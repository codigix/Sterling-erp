const OutsourcingTask = require('../../models/OutsourcingTask');
const OutwardChallan = require('../../models/OutwardChallan');
const InwardChallan = require('../../models/InwardChallan');
const Material = require('../../models/Material');
const Vendor = require('../../models/Vendor');
const RootCard = require('../../models/RootCard');
const pool = require('../../config/database');

const outsourcingController = {
  async getOutsourcingTasks(req, res) {
    try {
      const filters = req.query;
      const tasks = await OutsourcingTask.findAll(filters);
      res.json({ success: true, data: tasks });
    } catch (error) {
      console.error('Error fetching outsourcing tasks:', error);
      res.status(500).json({ success: false, message: 'Error fetching tasks', error: error.message });
    }
  },

  async getOutsourcingTaskById(req, res) {
    try {
      const { id } = req.params;
      const task = await OutsourcingTask.findById(id);

      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const outwardChallans = await OutwardChallan.findByOutsourcingTaskId(id);

      let inwardChallans = [];
      if (outwardChallans.length > 0) {
        const inwardResults = await Promise.all(
          outwardChallans.map(oc => InwardChallan.findByOutwardChallanId(oc.id))
        );
        inwardChallans = inwardResults.flat();
      }

      res.json({
        success: true,
        data: {
          ...task,
          outwardChallans,
          inwardChallans
        }
      });
    } catch (error) {
      console.error('Error fetching outsourcing task:', error);
      res.status(500).json({ success: false, message: 'Error fetching task', error: error.message });
    }
  },

  async selectVendor(req, res) {
    try {
      const { taskId } = req.params;
      const { vendorId } = req.body;

      if (!vendorId) {
        return res.status(400).json({ success: false, message: 'Vendor ID is required' });
      }

      const task = await OutsourcingTask.findById(taskId);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ success: false, message: 'Vendor not found' });
      }

      await OutsourcingTask.selectVendor(taskId, vendorId);

      res.json({
        success: true,
        message: 'Vendor selected successfully',
        data: { taskId, vendorId, vendorName: vendor.name }
      });
    } catch (error) {
      console.error('Error selecting vendor:', error);
      res.status(500).json({ success: false, message: 'Error selecting vendor', error: error.message });
    }
  },

  async getWorkOrderMaterials(req, res) {
    try {
      const { workOrderId } = req.params;

      // 1. Get work order details to find production_plan_id or sales_order_id
      const [woRows] = await pool.execute(
        'SELECT production_plan_id, sales_order_id FROM work_orders WHERE id = ?',
        [workOrderId]
      );
      
      if (woRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Work order not found' });
      }

      const { production_plan_id, sales_order_id } = woRows[0];

      // 2. Fetch materials from material requests linked to this production plan or sales order
      // We show the quantity that was actually requested/released in the Material Request
      const [materials] = await pool.execute(
        `SELECT 
            inv.id, 
            inv.item_code, 
            inv.item_name, 
            inv.unit, 
            SUM(mri.quantity) as quantity
         FROM material_request_items mri
         JOIN material_requests mr ON mri.material_request_id = mr.id
         JOIN inventory inv ON mri.material_code = inv.item_code
         WHERE (mr.production_plan_id = ? AND ? IS NOT NULL)
            OR (mr.sales_order_id = ? AND ? IS NOT NULL)
         GROUP BY inv.id, inv.item_code, inv.item_name, inv.unit
         ORDER BY inv.item_name ASC`,
        [production_plan_id, production_plan_id, sales_order_id, sales_order_id]
      );

      res.json({
        success: true,
        data: materials || []
      });
    } catch (error) {
      console.error('Error fetching work order materials:', error);
      res.status(500).json({ success: false, message: 'Error fetching materials', error: error.message });
    }
  },

  async createOutwardChallanFromJobCard(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const { operationId } = req.params;
      const { vendorId, materialSentDate, expectedReturnDate, items, notes, pdfBase64 } = req.body;

      if (!vendorId) {
        return res.status(400).json({ success: false, message: 'Vendor ID is required' });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one material must be selected' });
      }

      const [operationRows] = await connection.execute(
        'SELECT woo.*, wo.work_order_no, wo.project_id FROM work_order_operations woo JOIN work_orders wo ON woo.work_order_id = wo.id WHERE woo.id = ?',
        [operationId]
      );
      const operation = operationRows[0];
      
      if (!operation) {
        return res.status(404).json({ success: false, message: 'Operation not found' });
      }

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ success: false, message: 'Vendor not found' });
      }

      // 1. Material verification (No deduction as it was already released to production)
      for (const item of items) {
        const material = await Material.findById(item.materialId);
        if (!material) {
          throw new Error(`Material with ID ${item.materialId} not found`);
        }
        // Removed inventory deduction as materials were already issued via MR
      }

      // 2. Create outward challan
      const challanNumber = await OutwardChallan.generateChallanNumber();
      const [result] = await connection.execute(
        `INSERT INTO outward_challans 
         (work_order_operation_id, challan_number, vendor_id, material_sent_date, 
          expected_return_date, notes, created_by, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'issued')`,
        [
          operationId,
          challanNumber,
          vendorId,
          materialSentDate || null,
          expectedReturnDate || null,
          notes || null,
          req.user?.id || null
        ]
      );
      const challanId = result.insertId;

      // 3. Add items to challan
      for (const item of items) {
        await connection.execute(
          `INSERT INTO outward_challan_items 
           (outward_challan_id, material_id, quantity, unit, remarks)
           VALUES (?, ?, ?, ?, ?)`,
          [
            challanId,
            item.materialId,
            item.quantity,
            item.unit || 'piece',
            item.remarks || null
          ]
        );
      }

      // 4. Update operation status and vendor
      await connection.execute(
        'UPDATE work_order_operations SET status = ?, vendor_id = ? WHERE id = ?',
        ['in_progress', vendorId, operationId]
      );
      
      await connection.commit();

      // 5. Send email notification (async)
      try {
        const emailService = require('../../services/emailService');
        const emailContent = `
          <h2>Outward Challan Generated: ${challanNumber}</h2>
          <p><strong>Work Order:</strong> ${operation.work_order_no || '-'}</p>
          <p><strong>Operation:</strong> ${operation.operation_name || '-'}</p>
          <p><strong>Expected Return Date:</strong> ${expectedReturnDate || 'Not specified'}</p>
          <h3>Material List:</h3>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px;">Item Code</th>
                <th style="padding: 8px;">Material Name</th>
                <th style="padding: 8px;">Quantity</th>
                <th style="padding: 8px;">Unit</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td style="padding: 8px;">${item.itemCode || '-'}</td>
                  <td style="padding: 8px;">${item.itemName || item.materialName || 'Material'}</td>
                  <td style="padding: 8px;">${item.quantity}</td>
                  <td style="padding: 8px;">${item.unit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p>Please find the attached Outward Challan PDF for your records.</p>
        `;

        const attachments = [];
        if (pdfBase64) {
          const base64Data = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64;
          attachments.push({
            filename: `Outward_Challan_${challanNumber}.pdf`,
            content: Buffer.from(base64Data, 'base64')
          });
        }

        if (vendor.email) {
          await emailService.sendMail({
            to: vendor.email,
            subject: `Outward Challan Issued - ${challanNumber}`,
            html: emailContent,
            attachments
          });
        }
      } catch (emailErr) {
        console.error('Failed to send email to vendor:', emailErr);
      }

      res.json({
        success: true,
        message: 'Outward challan created successfully',
        data: {
          challanId,
          challanNumber,
          vendorName: vendor.name,
          itemCount: items.length
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error creating outward challan:', error);
      res.status(500).json({ success: false, message: error.message || 'Error creating challan' });
    } finally {
      connection.release();
    }
  },

  async getProjectMaterials(req, res) {
    try {
      const { projectId } = req.params; // This is root_card_id

      // 1. Get sales_order_id from root_card
      const [rcRows] = await pool.execute(
        'SELECT sales_order_id FROM root_cards WHERE id = ?',
        [projectId]
      );
      
      const sales_order_id = rcRows.length > 0 ? rcRows[0].sales_order_id : null;

      // 2. Fetch materials from material requests linked to this sales order
      const [materials] = await pool.execute(
        `SELECT 
            inv.id, 
            inv.item_code, 
            inv.item_name, 
            inv.unit, 
            SUM(mri.quantity) as quantity
         FROM material_request_items mri
         JOIN material_requests mr ON mri.material_request_id = mr.id
         JOIN inventory inv ON mri.material_code = inv.item_code
         WHERE mr.sales_order_id = ? AND ? IS NOT NULL
         GROUP BY inv.id, inv.item_code, inv.item_name, inv.unit
         ORDER BY inv.item_name ASC`,
        [sales_order_id, sales_order_id]
      );

      res.json({
        success: true,
        data: materials || []
      });
    } catch (error) {
      console.error('Error fetching project materials:', error);
      res.status(500).json({ success: false, message: 'Error fetching materials', error: error.message });
    }
  },

  async createOutwardChallan(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const { taskId } = req.params;
      const { vendorId, materialSentDate, expectedReturnDate, items, notes, pdfBase64 } = req.body;

      if (!vendorId) {
        return res.status(400).json({ success: false, message: 'Vendor ID is required' });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one material must be selected' });
      }

      const task = await OutsourcingTask.findById(taskId);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ success: false, message: 'Vendor not found' });
      }

      // 1. Material verification (No deduction as it was already released to production)
      for (const item of items) {
        const material = await Material.findById(item.materialId);
        if (!material) {
          throw new Error(`Material with ID ${item.materialId} not found`);
        }
        // Removed inventory deduction as materials were already issued via MR
      }

      // 2. Create outward challan
      const challanNumber = await OutwardChallan.generateChallanNumber();
      const [result] = await connection.execute(
        `INSERT INTO outward_challans 
         (outsourcing_task_id, challan_number, vendor_id, material_sent_date, 
          expected_return_date, notes, created_by, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'issued')`,
        [
          taskId,
          challanNumber,
          vendorId,
          materialSentDate || null,
          expectedReturnDate || null,
          notes || null,
          req.user?.id || null
        ]
      );
      const challanId = result.insertId;

      // 3. Add items to challan
      for (const item of items) {
        await connection.execute(
          `INSERT INTO outward_challan_items 
           (outward_challan_id, material_id, quantity, unit, remarks)
           VALUES (?, ?, ?, ?, ?)`,
          [
            challanId,
            item.materialId,
            item.quantity,
            item.unit || 'piece',
            item.remarks || null
          ]
        );
      }

      // 4. Update task and production stage status
      await connection.execute(
        'UPDATE outsourcing_tasks SET status = ?, selected_vendor_id = ? WHERE id = ?',
        ['outward_challan_generated', vendorId, taskId]
      );
      
      if (task.production_plan_stage_id) {
        await connection.execute(
          'UPDATE production_plan_stages SET status = ? WHERE id = ?',
          ['outward_challan_generated', task.production_plan_stage_id]
        );
      }

      await connection.commit();

      // 5. Send email notification (async, don't block response)
      try {
        const emailService = require('../../services/emailService');
        const emailContent = `
          <h2>Outward Challan Generated: ${challanNumber}</h2>
          <p><strong>Project:</strong> ${task.project_name || '-'}</p>
          <p><strong>Task:</strong> ${task.stage_name || '-'}</p>
          <p><strong>Product:</strong> ${task.product_name || '-'}</p>
          <p><strong>Expected Return Date:</strong> ${expectedReturnDate || 'Not specified'}</p>
          <h3>Material List:</h3>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px;">Item Code</th>
                <th style="padding: 8px;">Material Name</th>
                <th style="padding: 8px;">Quantity</th>
                <th style="padding: 8px;">Unit</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td style="padding: 8px;">${item.itemCode || '-'}</td>
                  <td style="padding: 8px;">${item.itemName || item.materialName || 'Material'}</td>
                  <td style="padding: 8px;">${item.quantity}</td>
                  <td style="padding: 8px;">${item.unit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p>Please find the attached Outward Challan PDF for your records.</p>
          <p>Please acknowledge the receipt of materials.</p>
        `;

        const attachments = [];
        if (pdfBase64) {
          const base64Data = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64;
          attachments.push({
            filename: `Outward_Challan_${challanNumber}.pdf`,
            content: Buffer.from(base64Data, 'base64')
          });
        }

        if (vendor.email) {
          await emailService.sendMail({
            to: vendor.email,
            subject: `Outward Challan Issued - ${challanNumber}`,
            html: emailContent,
            attachments
          });
        }
      } catch (emailErr) {
        console.error('Failed to send email to vendor:', emailErr);
      }

      res.json({
        success: true,
        message: 'Outward challan created successfully',
        data: {
          challanId,
          challanNumber,
          vendorName: vendor.name,
          itemCount: items.length
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error creating outward challan:', error);
      res.status(500).json({ success: false, message: error.message || 'Error creating challan' });
    } finally {
      connection.release();
    }
  },

  async getOutwardChallanDetails(req, res) {
    try {
      const { challanId } = req.params;

      const challan = await OutwardChallan.findById(challanId);
      if (!challan) {
        return res.status(404).json({ success: false, message: 'Challan not found' });
      }

      const items = await OutwardChallan.getItems(challanId);

      res.json({
        success: true,
        data: {
          ...challan,
          items
        }
      });
    } catch (error) {
      console.error('Error fetching challan details:', error);
      res.status(500).json({ success: false, message: 'Error fetching challan', error: error.message });
    }
  },

  async createInwardChallan(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const { outwardChallanId } = req.params;
      const { receivedDate, items, inspectionNotes, qualityStatus, notes } = req.body;

      const outwardChallan = await OutwardChallan.findById(outwardChallanId);
      if (!outwardChallan) {
        return res.status(404).json({ success: false, message: 'Outward challan not found' });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one material receipt must be recorded' });
      }

      // 1. Create inward challan
      const challanNumber = await InwardChallan.generateChallanNumber();
      const [result] = await connection.execute(
        `INSERT INTO inward_challans 
         (outward_challan_id, challan_number, received_date, received_by, 
          inspection_notes, quality_status, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'received')`,
        [
          outwardChallanId,
          challanNumber,
          receivedDate || null,
          req.user?.id || null,
          inspectionNotes || null,
          qualityStatus || 'pending_inspection',
          notes || null
        ]
      );
      const challanId = result.insertId;

      // 2. Process items and update inventory
      for (const item of items) {
        await connection.execute(
          `INSERT INTO inward_challan_items 
           (inward_challan_id, outward_challan_item_id, material_id, quantity_received, 
            quantity_rejected, quantity_scrap, quantity_expected, unit, quality_status, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            challanId,
            item.outwardChallanItemId || null,
            item.materialId,
            item.quantityReceived,
            item.quantityRejected || 0,
            item.quantityScrap || 0,
            item.quantityExpected || null,
            item.unit || 'piece',
            item.qualityStatus || 'pending_inspection',
            item.remarks || null
          ]
        );

        // Add received quantity back to inventory
        if (item.quantityReceived > 0) {
          await connection.execute(
            'UPDATE inventory SET quantity = quantity + ? WHERE id = ?',
            [item.quantityReceived, item.materialId]
          );
        }
      }

      // 3. Update outward challan and task statuses
      await connection.execute(
        'UPDATE outward_challans SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['received', outwardChallanId]
      );

      const task = await OutsourcingTask.findById(outwardChallan.outsourcing_task_id);
      if (task) {
        await connection.execute(
          'UPDATE outsourcing_tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['inward_challan_generated', outwardChallan.outsourcing_task_id]
        );
        
        if (task.production_plan_stage_id) {
          await connection.execute(
            'UPDATE production_plan_stages SET status = ? WHERE id = ?',
            ['inward_challan_generated', task.production_plan_stage_id]
          );
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Inward challan created successfully',
        data: {
          challanId,
          challanNumber,
          itemCount: items.length
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error creating inward challan:', error);
      res.status(500).json({ success: false, message: error.message || 'Error creating inward challan' });
    } finally {
      connection.release();
    }
  },

  async getInwardChallanDetails(req, res) {
    try {
      const { challanId } = req.params;

      const challan = await InwardChallan.findById(challanId);
      if (!challan) {
        return res.status(404).json({ success: false, message: 'Inward challan not found' });
      }

      const items = await InwardChallan.getItems(challanId);

      res.json({
        success: true,
        data: {
          ...challan,
          items
        }
      });
    } catch (error) {
      console.error('Error fetching inward challan:', error);
      res.status(500).json({ success: false, message: 'Error fetching inward challan', error: error.message });
    }
  },

  async createInwardChallanFromJobCard(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { operationId } = req.params;
      const { receivedQty, acceptedQty, rejectedQty, notes } = req.body;

      // 1. Find the outward challan for this operation
      const [ocRows] = await connection.execute(
        'SELECT id FROM outward_challans WHERE work_order_operation_id = ? ORDER BY created_at DESC LIMIT 1',
        [operationId]
      );

      if (ocRows.length === 0) {
        return res.status(404).json({ success: false, message: 'No outward challan found for this operation' });
      }

      const outwardChallanId = ocRows[0].id;

      // 2. Create inward challan record
      const challanNumber = await InwardChallan.generateChallanNumber();
      const [icResult] = await connection.execute(
        `INSERT INTO inward_challans 
         (outward_challan_id, challan_number, received_date, received_by, notes, status)
         VALUES (?, ?, NOW(), ?, ?, 'received')`,
        [outwardChallanId, challanNumber, req.user?.id || null, notes || null]
      );
      const inwardChallanId = icResult.insertId;

      // 3. Update work_order_operations status and end date
      await connection.execute(
        `UPDATE work_order_operations 
         SET status = 'completed', actual_end_date = NOW(), updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [operationId]
      );

      // 4. Record production quantity (Time Log)
      await connection.execute(
        `INSERT INTO work_order_time_logs 
         (operation_id, operator_id, start_time, end_time, produced_qty, notes)
         VALUES (?, ?, NOW(), NOW(), ?, ?)`,
        [operationId, req.user?.id || null, receivedQty, 'Received from Outsource Vendor']
      );

      // 5. Record quality entry
      await connection.execute(
        `INSERT INTO work_order_quality_entries 
         (operation_id, operator_id, inspection_date, accepted_qty, rejected_qty, notes)
         VALUES (?, ?, NOW(), ?, ?, ?)`,
        [operationId, req.user?.id || null, acceptedQty, rejectedQty, notes || 'Outsource receipt inspection']
      );

      // 6. Check if this was the last operation of the work order
      const [opRows] = await connection.execute(
        'SELECT work_order_id FROM work_order_operations WHERE id = ?',
        [operationId]
      );
      const workOrderId = opRows[0].work_order_id;

      const [remainingOps] = await connection.execute(
        "SELECT id FROM work_order_operations WHERE work_order_id = ? AND status != 'completed'",
        [workOrderId]
      );

      if (remainingOps.length === 0) {
        await connection.execute(
          "UPDATE work_orders SET status = 'completed', actual_end_date = NOW() WHERE id = ?",
          [workOrderId]
        );
      } else {
        // Find next operation in sequence and mark as ready if it's currently pending
        const [currentOp] = await connection.execute(
          'SELECT sequence FROM work_order_operations WHERE id = ?',
          [operationId]
        );
        
        if (currentOp.length > 0) {
          await connection.execute(
            `UPDATE work_order_operations 
             SET status = 'ready' 
             WHERE work_order_id = ? AND sequence > ? AND status = 'pending' 
             ORDER BY sequence ASC LIMIT 1`,
            [workOrderId, currentOp[0].sequence]
          );
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Inward challan created and operation completed successfully',
        data: {
          inwardChallanId,
          challanNumber
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error creating inward challan from job card:', error);
      res.status(500).json({ success: false, message: error.message || 'Error processing receipt' });
    } finally {
      connection.release();
    }
  },

  async completeOutsourcingTask(req, res) {
    try {
      const { taskId } = req.params;

      const task = await OutsourcingTask.findById(taskId);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      if (task.status !== 'inward_challan_generated') {
        return res.status(400).json({
          success: false,
          message: 'Task can only be completed after inward challan is generated'
        });
      }

      await OutsourcingTask.updateStatus(taskId, 'completed');

      const productionStageId = task.production_plan_stage_id;
      if (productionStageId) {
        await pool.execute(
          'UPDATE production_plan_stages SET status = ? WHERE id = ?',
          ['completed', productionStageId]
        );

        // Unlock next stage (copied logic from productionPortalController.js)
        const [nextStages] = await pool.execute(
          `SELECT id, stage_name, stage_type, assigned_employee_id, production_plan_id FROM production_plan_stages WHERE blocked_by_stage_id = ? LIMIT 1`,
          [productionStageId]
        );
        
        if (nextStages.length > 0) {
          const nextStageId = nextStages[0].id;
          const nextStageName = nextStages[0].stage_name;
          const nextStageType = nextStages[0].stage_type;
          const nextStageEmployeeId = nextStages[0].assigned_employee_id;
          const planId = nextStages[0].production_plan_id;
          
          await pool.execute(
            `UPDATE production_plan_stages SET is_blocked = FALSE WHERE id = ?`,
            [nextStageId]
          );
          
          if (nextStageType === 'outsource') {
            try {
              const AlertsNotification = require('../../models/AlertsNotification');
              const [deptMembers] = await pool.execute(`
                SELECT DISTINCT u.id 
                FROM users u 
                INNER JOIN roles r ON u.role_id = r.id 
                WHERE r.name = 'Production'
                LIMIT 20
              `);
              for (const member of deptMembers) {
                await AlertsNotification.create({
                  userId: member.id,
                  alertType: 'outsource_task_created',
                  message: `Outsource task "${nextStageName}" is now ready for production. Previous stage completed!`,
                  relatedTable: 'production_plan_stages',
                  relatedId: nextStageId,
                  priority: 'high'
                });
              }
            } catch (err) {
              console.error('Error sending outsource notifications:', err);
            }
          /* 
          } else if (nextStageEmployeeId) {
            try {
              const EmployeeTask = require('../../models/EmployeeTask');
              await EmployeeTask.createAssignedTask(nextStageEmployeeId, {
                title: `Production Stage: ${nextStageName}`,
                description: `Assigned to production plan stage`,
                type: 'production_stage',
                priority: 'medium',
                dueDate: null,
                notes: `Production Plan ID: ${planId}`,
                productionPlanStageId: nextStageId
              });
            } catch (err) {
              console.error('Error creating employee task:', err);
            }
          */
          }
        }
      }

      res.json({
        success: true,
        message: 'Outsourcing task completed successfully'
      });
    } catch (error) {
      console.error('Error completing task:', error);
      res.status(500).json({ success: false, message: 'Error completing task', error: error.message });
    }
  },

  async getOutsourcingTaskByProductionStage(req, res) {
    try {
      const { stageId } = req.params;

      const task = await OutsourcingTask.findByProductionPlanStageId(stageId);
      if (!task) {
        return res.status(404).json({ success: false, message: 'No outsourcing task found for this stage' });
      }

      const outwardChallans = await OutwardChallan.findByOutsourcingTaskId(task.id);

      res.json({
        success: true,
        data: {
          ...task,
          outwardChallans
        }
      });
    } catch (error) {
      console.error('Error fetching task by stage:', error);
      res.status(500).json({ success: false, message: 'Error fetching task', error: error.message });
    }
  }
};

module.exports = outsourcingController;
