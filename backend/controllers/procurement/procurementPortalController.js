const MaterialRequest = require('../../models/MaterialRequest');
const PurchaseOrder = require('../../models/PurchaseOrder');

exports.getPurchaseRequests = async (req, res) => {
  try {
    const purchaseRequests = [
      {
        id: 'PR-001',
        project: 'Motor Assembly Unit',
        items: 5,
        totalAmount: '₹2,50,000',
        status: 'pending',
        createdDate: '2025-01-15',
        requiredDate: '2025-02-05'
      },
      {
        id: 'PR-002',
        project: 'Control Panel',
        items: 3,
        totalAmount: '₹1,75,000',
        status: 'approved',
        createdDate: '2025-01-18',
        requiredDate: '2025-02-10'
      }
    ];

    res.json(purchaseRequests);
  } catch (error) {
    console.error('Get purchase requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = [
      {
        id: 'PO-2025-001',
        vendor: 'Steel Supplies Ltd',
        poNumber: 'PO-001',
        amount: '₹2,50,000',
        status: 'placed',
        poDate: '2025-01-20',
        expectedDelivery: '2025-02-05'
      },
      {
        id: 'PO-2025-002',
        vendor: 'Electrical Components Co',
        poNumber: 'PO-002',
        amount: '₹1,75,000',
        status: 'delivered',
        poDate: '2025-01-22',
        expectedDelivery: '2025-02-01'
      }
    ];

    res.json(purchaseOrders);
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getQuotes = async (req, res) => {
  try {
    const quotes = [
      {
        id: 'QT-001',
        vendor: 'Steel Supplies Ltd',
        amount: '₹2,50,000',
        items: 5,
        expiryDate: '2025-02-15',
        status: 'accepted'
      },
      {
        id: 'QT-002',
        vendor: 'Alternative Steel Inc',
        amount: '₹2,60,000',
        items: 5,
        expiryDate: '2025-02-10',
        status: 'pending'
      }
    ];

    res.json(quotes);
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
