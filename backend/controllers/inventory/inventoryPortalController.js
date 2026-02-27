const Material = require('../../models/Material');

exports.getInventoryStock = async (req, res) => {
  try {
    const materials = await Material.getAll();
    const statsData = await Material.getStats();

    const stock = (materials || []).map(m => ({
      id: m.item_code,
      name: m.description,
      batch: 'N/A', // Batch management could be added later
      quantity: m.quantity || 0,
      reorder_level: m.reorder_level || 0,
      rack: m.rack_location || 'N/A',
      location: m.warehouse_name || 'Main',
      status: (m.quantity || 0) < (m.reorder_level || 0) ? 'low-stock' : 'available'
    }));

    const stats = {
      totalSKUs: statsData.total_items || 0,
      totalQuantity: stock.reduce((sum, item) => sum + item.quantity, 0),
      lowStock: statsData.low_stock_count || 0,
      pendingIssuance: 0 // Placeholder
    };

    res.json({ stock, stats });
  } catch (error) {
    console.error('Get inventory stock error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getInventoryIssuances = async (req, res) => {
  try {
    const issuances = [
      {
        id: 'ISS-001',
        material: 'Steel Shaft',
        sku: 'SKU-001',
        quantity: 10,
        issuedTo: 'PROD-001',
        issuedDate: '2025-01-28',
        status: 'completed'
      },
      {
        id: 'ISS-002',
        material: 'Bearing Assembly',
        sku: 'SKU-002',
        quantity: 8,
        issuedTo: 'PROD-002',
        issuedDate: '2025-01-29',
        status: 'pending'
      }
    ];

    res.json(issuances);
  } catch (error) {
    console.error('Get inventory issuances error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
