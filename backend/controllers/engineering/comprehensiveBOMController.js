const ComprehensiveBOM = require('../../models/ComprehensiveBOM');
const pool = require('../../config/database');
const DepartmentTask = require('../../models/DepartmentTask');
const Role = require('../../models/Role');

exports.createComprehensiveBOM = async (req, res) => {
  let connection = null;
  try {
    const { productInfo, components, materials, operations, scrapLoss } = req.body;
    const userId = req.user?.id;

    if (!productInfo || !productInfo.productName) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check for existing BOM with same item code and revision (Point 20)
    if (productInfo.itemCode) {
      const existingBOM = await ComprehensiveBOM.findByProductAndRevision(
        productInfo.itemCode, 
        productInfo.revision || 1
      );
      
      if (existingBOM) {
        return res.status(200).json({
          message: 'Existing BOM found for this product and revision',
          bomId: existingBOM.id,
          redirect: true
        });
      }
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const bomId = await ComprehensiveBOM.create({
      ...productInfo,
      createdBy: userId
    }, connection);

    if (components && Array.isArray(components) && components.length > 0) {
      for (const component of components) {
        if (component.componentCode && component.quantity) {
          await ComprehensiveBOM.addComponent(bomId, component, connection);
        }
      }
    }

    if (materials && Array.isArray(materials) && materials.length > 0) {
      for (const material of materials) {
        if (material.itemName && material.quantity) {
          await ComprehensiveBOM.addMaterial(bomId, material, connection);
        }
      }
    }

    if (operations && Array.isArray(operations) && operations.length > 0) {
      for (const operation of operations) {
        if (operation.operationName) {
          await ComprehensiveBOM.addOperation(bomId, operation, connection);
        }
      }
    }

    if (scrapLoss && Array.isArray(scrapLoss) && scrapLoss.length > 0) {
      for (const scrap of scrapLoss) {
        if (scrap.itemCode && scrap.name) {
          await ComprehensiveBOM.addScrapLoss(bomId, scrap, connection);
        }
      }
    }

    await connection.commit();

    const costs = await ComprehensiveBOM.calculateCosts(bomId);

    res.status(201).json({
      message: 'Comprehensive BOM created successfully',
      bomId,
      costs,
      summary: {
        components: components?.length || 0,
        materials: materials?.length || 0,
        operations: operations?.length || 0,
        scrapItems: scrapLoss?.length || 0
      }
    });
  } catch (error) {
    console.error('Create comprehensive BOM error:', error.message);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError.message);
      }
    }
    res.status(500).json({
      message: 'Failed to create comprehensive BOM',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.getComprehensiveBOM = async (req, res) => {
  try {
    const { id } = req.params;
    const bom = await ComprehensiveBOM.findById(id);

    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    const costs = await ComprehensiveBOM.calculateCosts(id);

    res.json({
      ...bom,
      costs
    });
  } catch (error) {
    console.error('Get comprehensive BOM error:', error.message);
    res.status(500).json({ message: 'Failed to fetch BOM' });
  }
};

exports.getComprehensiveBOMList = async (req, res) => {
  try {
    const boms = await ComprehensiveBOM.getAll();
    res.json({ boms });
  } catch (error) {
    console.error('Get BOM list error:', error.message);
    res.status(500).json({ message: 'Failed to fetch BOMs' });
  }
};

exports.updateComprehensiveBOM = async (req, res) => {
  let connection = null;
  try {
    const { id } = req.params;
    const { productInfo, components, materials, operations, scrapLoss } = req.body;

    const oldBOM = await ComprehensiveBOM.findById(id);
    if (!oldBOM) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    await ComprehensiveBOM.update(id, productInfo, connection);
    await ComprehensiveBOM.clearSubTables(id, connection);

    if (components && Array.isArray(components)) {
      for (const component of components) {
        if (component.componentCode && component.quantity) {
          await ComprehensiveBOM.addComponent(id, component, connection);
        }
      }
    }

    if (materials && Array.isArray(materials)) {
      for (const material of materials) {
        if (material.itemName && material.quantity) {
          await ComprehensiveBOM.addMaterial(id, material, connection);
        }
      }
    }

    if (operations && Array.isArray(operations)) {
      for (const operation of operations) {
        if (operation.operationName) {
          await ComprehensiveBOM.addOperation(id, operation, connection);
        }
      }
    }

    if (scrapLoss && Array.isArray(scrapLoss)) {
      for (const scrap of scrapLoss) {
        if (scrap.itemCode && scrap.name) {
          await ComprehensiveBOM.addScrapLoss(id, scrap, connection);
        }
      }
    }

    // Trigger Procurement tasks if status changed to active (Point 152)
    if (oldBOM.status === 'draft' && productInfo.status === 'active') {
      try {
        const procurementRole = await Role.findByName('Procurement Manager') || await Role.findByName('Inventory Manager');
        if (procurementRole) {
          await DepartmentTask.createDepartmentTask({
            root_card_id: productInfo.rootCardId || oldBOM.root_card_id,
            role_id: procurementRole.id,
            task_title: `Procure Materials for BOM: ${productInfo.productName || oldBOM.product_name}`,
            task_description: `BOM has been activated. Please review and initiate procurement for items in BOM revision ${productInfo.revision || oldBOM.revision}.`,
            priority: 'high',
            status: 'pending',
            assigned_by: req.user?.id
          });
        }
      } catch (taskError) {
        console.error('Error triggering procurement task:', taskError.message);
      }
    }

    await connection.commit();

    const costs = await ComprehensiveBOM.calculateCosts(id);

    res.json({
      message: 'Comprehensive BOM updated successfully',
      bomId: id,
      costs
    });
  } catch (error) {
    console.error('Update comprehensive BOM error:', error.message);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError.message);
      }
    }
    res.status(500).json({
      message: 'Failed to update comprehensive BOM',
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.deleteComprehensiveBOM = async (req, res) => {
  try {
    const { id } = req.params;
    await ComprehensiveBOM.delete(id);
    res.json({ message: 'BOM deleted successfully' });
  } catch (error) {
    console.error('Delete comprehensive BOM error:', error.message);
    res.status(500).json({ message: 'Failed to delete BOM' });
  }
};

exports.getBOMCosts = async (req, res) => {
  try {
    const { id } = req.params;
    const costs = await ComprehensiveBOM.calculateCosts(id);
    res.json(costs);
  } catch (error) {
    console.error('Get BOM costs error:', error.message);
    res.status(500).json({ message: 'Failed to calculate BOM costs' });
  }
};

exports.getComprehensiveBOMByRootCard = async (req, res) => {
  try {
    const { rootCardId } = req.params;
    const bomSummary = await ComprehensiveBOM.findByRootCardId(rootCardId);
    
    if (!bomSummary) {
      return res.status(404).json({ message: 'BOM not found for this root card' });
    }

    const bom = await ComprehensiveBOM.findById(bomSummary.id);
    res.json(bom);
  } catch (error) {
    console.error('Get BOM by Root Card error:', error.message);
    res.status(500).json({ message: 'Failed to fetch BOM' });
  }
};
