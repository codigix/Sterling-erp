exports.getInventoryStock = async (req, res) => {
  try {
    const stock = [
      {
        id: 'SKU-001',
        name: 'Steel Shaft',
        batch: 'BATCH-2025-001',
        quantity: 50,
        rack: 'A-1-01',
        location: 'Warehouse A',
        status: 'available'
      },
      {
        id: 'SKU-002',
        name: 'Bearing Assembly',
        batch: 'BATCH-2025-002',
        quantity: 30,
        rack: 'B-2-03',
        location: 'Warehouse A',
        status: 'available'
      },
      {
        id: 'SKU-003',
        name: 'Motor Coupling',
        batch: 'BATCH-2025-001',
        quantity: 5,
        rack: 'C-3-05',
        location: 'Warehouse B',
        status: 'low-stock'
      }
    ];

    const stats = {
      totalSKUs: stock.length,
      totalQuantity: stock.reduce((sum, item) => sum + item.quantity, 0),
      lowStock: stock.filter(item => item.status === 'low-stock').length,
      pendingIssuance: 1
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
