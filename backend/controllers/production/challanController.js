const pool = require('../../config/database');
const ProductionPhaseTracking = require('../../models/ProductionPhaseTracking');

const challanController = {
  async createOutwardChallan(req, res) {
    try {
      const { salesOrderId, trackingId, vendorName, vendorContact, expectedDeliveryDate } = req.body;

      if (!salesOrderId || !trackingId) {
        return res.status(400).json({ message: 'salesOrderId and trackingId are required' });
      }

      const challanNo = `OC-${Date.now()}`;
      
      const [result] = await pool.execute(
        `INSERT INTO outward_challan_details 
         (sales_order_id, tracking_id, challan_number, vendor_name, vendor_contact, expected_delivery_date, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'Issued')`,
        [salesOrderId, trackingId, challanNo, vendorName || null, vendorContact || null, expectedDeliveryDate || null]
      );

      await ProductionPhaseTracking.updateStatus(trackingId, 'Outsourced', {
        outwardChallanNo: challanNo
      });

      res.status(201).json({ 
        message: 'Outward challan created', 
        challanId: result.insertId, 
        challanNo,
        success: true 
      });
    } catch (error) {
      console.error('Error in createOutwardChallan:', error);
      res.status(500).json({ 
        message: 'Error creating outward challan', 
        error: error.message,
        success: false 
      });
    }
  },

  async createInwardChallan(req, res) {
    try {
      const { outwardChallanId, trackingId } = req.body;

      if (!outwardChallanId) {
        return res.status(400).json({ message: 'outwardChallanId is required' });
      }

      const challanNo = `IC-${Date.now()}`;
      
      const [result] = await pool.execute(
        `INSERT INTO inward_challan_details 
         (outward_challan_id, tracking_id, challan_number, status, received_at) 
         VALUES (?, ?, ?, 'Received', NOW())`,
        [outwardChallanId, trackingId || null, challanNo]
      );

      if (trackingId) {
        await ProductionPhaseTracking.updateStatus(trackingId, 'Completed', {
          inwardChallanNo: challanNo,
          finishTime: new Date().toISOString()
        });
      }

      res.status(201).json({ 
        message: 'Inward challan created', 
        challanId: result.insertId, 
        challanNo,
        success: true 
      });
    } catch (error) {
      console.error('Error in createInwardChallan:', error);
      res.status(500).json({ 
        message: 'Error creating inward challan', 
        error: error.message,
        success: false 
      });
    }
  },

  async getOutwardChallans(req, res) {
    try {
      const { salesOrderId } = req.params;
      
      if (!salesOrderId) {
        return res.status(400).json({ message: 'salesOrderId is required' });
      }

      const [rows] = await pool.execute(
        'SELECT * FROM outward_challan_details WHERE sales_order_id = ? ORDER BY created_at DESC',
        [salesOrderId]
      );

      res.json({ 
        data: rows || [],
        success: true 
      });
    } catch (error) {
      console.error('Error in getOutwardChallans:', error);
      res.status(500).json({ 
        message: 'Error fetching outward challans', 
        error: error.message,
        success: false 
      });
    }
  },

  async getInwardChallans(req, res) {
    try {
      const { outwardChallanId } = req.params;
      
      if (!outwardChallanId) {
        return res.status(400).json({ message: 'outwardChallanId is required' });
      }

      const [rows] = await pool.execute(
        'SELECT * FROM inward_challan_details WHERE outward_challan_id = ? ORDER BY created_at DESC',
        [outwardChallanId]
      );

      res.json({ 
        data: rows || [],
        success: true 
      });
    } catch (error) {
      console.error('Error in getInwardChallans:', error);
      res.status(500).json({ 
        message: 'Error fetching inward challans', 
        error: error.message,
        success: false 
      });
    }
  },

  async updateOutwardChallan(req, res) {
    try {
      const { challanId } = req.params;
      const { status } = req.body;

      if (!challanId || !status) {
        return res.status(400).json({ message: 'challanId and status are required' });
      }

      await pool.execute(
        'UPDATE outward_challan_details SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, challanId]
      );

      res.json({ 
        message: 'Outward challan updated successfully',
        success: true 
      });
    } catch (error) {
      console.error('Error in updateOutwardChallan:', error);
      res.status(500).json({ 
        message: 'Error updating outward challan', 
        error: error.message,
        success: false 
      });
    }
  },

  async updateInwardChallan(req, res) {
    try {
      const { challanId } = req.params;
      const { status, qualityStatus, notes } = req.body;

      if (!challanId) {
        return res.status(400).json({ message: 'challanId is required' });
      }

      const updates = [];
      const params = [];

      if (status) {
        updates.push('status = ?');
        params.push(status);
      }
      if (qualityStatus) {
        updates.push('quality_status = ?');
        params.push(qualityStatus);
      }
      if (notes) {
        updates.push('notes = ?');
        params.push(notes);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(challanId);

      if (updates.length > 1) {
        await pool.execute(
          `UPDATE inward_challan_details SET ${updates.join(', ')} WHERE id = ?`,
          params
        );
      }

      res.json({ 
        message: 'Inward challan updated successfully',
        success: true 
      });
    } catch (error) {
      console.error('Error in updateInwardChallan:', error);
      res.status(500).json({ 
        message: 'Error updating inward challan', 
        error: error.message,
        success: false 
      });
    }
  }
};

module.exports = challanController;
