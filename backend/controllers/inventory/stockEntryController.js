const StockEntry = require('../../models/StockEntry');
const Material = require('../../models/Material');

exports.createStockEntry = async (req, res) => {
  try {
    const entryData = req.body;
    const entryId = await StockEntry.create(entryData);
    
    // If status is submitted, update inventory quantities
    if (entryData.status === 'submitted') {
      const items = entryData.items || [];
      
      for (const item of items) {
        const materialId = item.material_id;
        const qty = Number(item.quantity);
        
        if (!materialId || isNaN(qty)) continue;
        
        const material = await Material.findById(materialId);
        if (!material) continue;
        
        // Adjust quantity based on entry type in material_stock
        if (entryData.entry_type === 'Material Receipt') {
          await Material.updateStock(materialId, (entryData.to_warehouse || 'Main Warehouse').trim(), qty, item.batch_no || null);
        } else if (entryData.entry_type === 'Material Issue') {
          await Material.updateStock(materialId, (entryData.from_warehouse || 'Main Warehouse').trim(), -qty, item.batch_no || null);
        } else if (entryData.entry_type === 'Material Transfer') {
          // Deduct from source
          await Material.updateStock(materialId, entryData.from_warehouse.trim(), -qty, item.batch_no || null);
          // Add to destination
          await Material.updateStock(materialId, entryData.to_warehouse.trim(), qty, item.batch_no || null);
        }
      }
    }
    
    const newEntry = await StockEntry.findById(entryId);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Create stock entry error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getAllStockEntries = async (req, res) => {
  try {
    const { status, type } = req.query;
    const entries = await StockEntry.findAll({ status, type });
    res.json({ movements: entries });
  } catch (error) {
    console.error('Get all stock entries error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStockEntryById = async (req, res) => {
  try {
    const entry = await StockEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Stock entry not found' });
    res.json(entry);
  } catch (error) {
    console.error('Get stock entry error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
