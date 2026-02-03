const MaterialRequest = require('../../models/MaterialRequest');
const PurchaseOrder = require('../../models/PurchaseOrder');
const Quotation = require('../../models/Quotation');

exports.getPurchaseRequests = async (req, res) => {
  try {
    const purchaseRequests = await MaterialRequest.findAll();
    
    // Format for frontend if needed
    const formattedPRs = purchaseRequests.map(pr => ({
      id: pr.id,
      project: pr.customer || pr.material_name, // Use customer name if available
      items: 1, // MaterialRequest model seems to be per item
      totalAmount: 'N/A', // Amount might not be in material_requests
      status: pr.status,
      createdDate: pr.created_at,
      requiredDate: pr.required_date
    }));

    res.json(formattedPRs);
  } catch (error) {
    console.error('Get purchase requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.findAll();
    
    const formattedPOs = purchaseOrders.map(po => ({
      id: po.id,
      vendor: po.vendor_name,
      poNumber: po.po_number,
      amount: `₹${po.total_amount}`,
      status: po.status,
      poDate: po.created_at,
      expectedDelivery: po.expected_delivery_date
    }));

    res.json(formattedPOs);
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getQuotes = async (req, res) => {
  try {
    const quotes = await Quotation.findAll({ type: 'inbound' });
    
    const formattedQuotes = quotes.map(quote => ({
      id: quote.quotation_number,
      vendor: quote.vendor_name,
      amount: `₹${quote.total_amount}`,
      items: Array.isArray(JSON.parse(quote.items || '[]')) ? JSON.parse(quote.items || '[]').length : 0,
      expiryDate: quote.valid_until,
      status: quote.status
    }));

    res.json(formattedQuotes);
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
