const pool = require('../../config/database');
const Material = require('../../models/Material');
const Notification = require('../../models/Notification');

exports.getMaterials = async (req, res) => {
  try {
    const { itemCode, itemName, category, warehouse, belowReorderLevel, onlyWithStock } = req.query;
    const materials = await Material.findAll({
      itemCode,
      itemName,
      category,
      warehouse,
      belowReorderLevel: belowReorderLevel === 'true',
      onlyWithStock: onlyWithStock === 'true'
    });
    res.json({ materials, total: materials.length });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    res.json(material);
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const { 
      itemCode, itemName, batch, specification, unit, category, 
      itemGroupId, valuationRate, sellingRate, noOfCavity, 
      weightPerUnit, weightUom, drawingNo, revision, 
      materialGrade, eanBarcode, gstPercent,
      quantity, reorderLevel, location, vendorId, unitCost,
      rack, shelf, qrCode
    } = req.body;
    
    if (!itemCode || !itemName || !unit) {
      return res.status(400).json({ message: 'Item code, name, and unit are required' });
    }
    
    const materialId = await Material.create({
      itemCode,
      itemName,
      batch,
      specification,
      unit,
      category,
      itemGroupId,
      valuationRate,
      sellingRate,
      noOfCavity,
      weightPerUnit,
      weightUom,
      drawingNo,
      revision,
      materialGrade,
      eanBarcode,
      gstPercent,
      quantity: quantity || 0,
      reorderLevel: reorderLevel || 0,
      location,
      vendorId,
      unitCost,
      rack,
      shelf,
      qrCode
    });
    
    res.status(201).json({ message: 'Material created successfully', materialId });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      itemCode, itemName, batch, specification, unit, category, 
      itemGroupId, valuationRate, sellingRate, noOfCavity, 
      weightPerUnit, weightUom, drawingNo, revision, 
      materialGrade, eanBarcode, gstPercent,
      quantity, reorderLevel, location, vendorId, unitCost,
      rack, shelf, qrCode
    } = req.body;
    
    await Material.update(id, {
      itemCode,
      itemName,
      batch,
      specification,
      unit,
      category,
      itemGroupId,
      valuationRate,
      sellingRate,
      noOfCavity,
      weightPerUnit,
      weightUom,
      drawingNo,
      revision,
      materialGrade,
      eanBarcode,
      gstPercent,
      quantity,
      reorderLevel,
      location,
      vendorId,
      unitCost,
      rack,
      shelf,
      qrCode
    });
    
    res.json({ message: 'Material updated successfully' });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    await Material.delete(id);
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateMaterialQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({ message: 'Quantity is required' });
    }
    
    await Material.updateQuantity(id, quantity);
    res.json({ message: 'Material quantity updated successfully' });
  } catch (error) {
    console.error('Update material quantity error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.checkReorderLevels = async (req, res) => {
  try {
    const materials = await Material.checkReorderLevels();
    res.json({ materials, total: materials.length });
  } catch (error) {
    console.error('Check reorder levels error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
