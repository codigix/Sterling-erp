const Vendor = require('../../models/Vendor');

exports.getAllVendors = async (req, res) => {
  try {
    const { search, category, status, vendor_type, minRating } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (vendor_type) filters.vendor_type = vendor_type;
    if (minRating) filters.minRating = parseFloat(minRating);

    const vendors = await Vendor.findAll(filters);
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Error fetching vendor' });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { name, contact, email, address, phone, category, vendor_type, rating, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Vendor name is required' });
    }
    
    const vendorId = await Vendor.create({
      name,
      contact,
      email,
      address,
      phone,
      category,
      vendor_type,
      rating,
      status
    });
    
    const newVendor = await Vendor.findById(vendorId);
    res.status(201).json(newVendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Error creating vendor' });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    await Vendor.update(id, req.body);
    const updatedVendor = await Vendor.findById(id);
    res.json(updatedVendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ message: 'Error updating vendor' });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    await Vendor.delete(id);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: 'Error deleting vendor' });
  }
};

exports.getVendorStats = async (req, res) => {
  try {
    const stats = await Vendor.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    res.status(500).json({ message: 'Error fetching vendor stats' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Vendor.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};
