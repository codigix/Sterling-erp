const Quotation = require('../../models/Quotation');
const Vendor = require('../../models/Vendor');

exports.getAllQuotations = async (req, res) => {
  try {
    const { search, vendor_id, status, type } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (vendor_id) filters.vendor_id = vendor_id;
    if (status) filters.status = status;
    if (type) filters.type = type;

    const quotations = await Quotation.findAll(filters);
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: 'Error fetching quotations' });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.items && typeof quotation.items === 'string') {
      quotation.items = JSON.parse(quotation.items);
    }
    
    res.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ message: 'Error fetching quotation' });
  }
};

exports.createQuotation = async (req, res) => {
  try {
    const { vendor_id, total_amount, valid_until, items, notes, status, type, reference_id, sales_order_id } = req.body;
    
    if (!vendor_id) {
      return res.status(400).json({ message: 'Vendor is required' });
    }

    const vendor = await Vendor.findById(vendor_id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    const quotationId = await Quotation.create({
      vendor_id,
      total_amount: total_amount || 0,
      valid_until,
      items: items || [],
      notes,
      status: status || 'pending',
      type: type || 'outbound',
      reference_id: reference_id || null,
      sales_order_id: sales_order_id || null
    });
    
    const newQuotation = await Quotation.findById(quotationId);
    if (newQuotation && newQuotation.items && typeof newQuotation.items === 'string') {
      newQuotation.items = JSON.parse(newQuotation.items);
    }
    res.status(201).json(newQuotation);
  } catch (error) {
    console.error('Error creating quotation:', error.message, error.stack);
    res.status(500).json({ message: 'Error creating quotation', error: error.message });
  }
};

exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await Quotation.update(id, req.body);
    const updatedQuotation = await Quotation.findById(id);
    if (updatedQuotation && updatedQuotation.items && typeof updatedQuotation.items === 'string') {
      updatedQuotation.items = JSON.parse(updatedQuotation.items);
    }
    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(500).json({ message: 'Error updating quotation' });
  }
};

exports.deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await Quotation.delete(id);
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ message: 'Error deleting quotation' });
  }
};

exports.approveQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await Quotation.changeStatus(id, 'approved');
    const updatedQuotation = await Quotation.findById(id);
    if (updatedQuotation && updatedQuotation.items && typeof updatedQuotation.items === 'string') {
      updatedQuotation.items = JSON.parse(updatedQuotation.items);
    }
    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error approving quotation:', error);
    res.status(500).json({ message: 'Error approving quotation' });
  }
};

exports.rejectQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await Quotation.changeStatus(id, 'rejected');
    const updatedQuotation = await Quotation.findById(id);
    if (updatedQuotation && updatedQuotation.items && typeof updatedQuotation.items === 'string') {
      updatedQuotation.items = JSON.parse(updatedQuotation.items);
    }
    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error rejecting quotation:', error);
    res.status(500).json({ message: 'Error rejecting quotation' });
  }
};

exports.updateQuotationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await Quotation.changeStatus(id, status);
    const updatedQuotation = await Quotation.findById(id);
    if (updatedQuotation && updatedQuotation.items && typeof updatedQuotation.items === 'string') {
      updatedQuotation.items = JSON.parse(updatedQuotation.items);
    }
    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error updating quotation status:', error);
    res.status(500).json({ message: 'Error updating quotation status', error: error.message });
  }
};

exports.getQuotationStats = async (req, res) => {
  try {
    const stats = await Quotation.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching quotation stats:', error);
    res.status(500).json({ message: 'Error fetching quotation stats' });
  }
};

exports.getVendorQuotations = async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const { status } = req.query;
    
    const filters = {};
    if (status) filters.status = status;

    const quotations = await Quotation.getByVendor(vendor_id, filters);
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching vendor quotations:', error);
    res.status(500).json({ message: 'Error fetching vendor quotations' });
  }
};

exports.getQuotationsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const quotations = await Quotation.findAll({ 
      type: 'outbound',
      sales_order_id: projectId
    });
    
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching project quotations:', error);
    res.status(500).json({ message: 'Error fetching project quotations' });
  }
};
