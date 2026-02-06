const Workstation = require('../../models/Workstation');

exports.getWorkstations = async (req, res) => {
  try {
    const workstations = await Workstation.findAll();
    const stats = await Workstation.getStats();
    res.json({ workstations, stats });
  } catch (error) {
    console.error('Get workstations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getWorkstationById = async (req, res) => {
  try {
    const { id } = req.params;
    const workstation = await Workstation.findById(id);
    
    if (!workstation) {
      return res.status(404).json({ message: 'Workstation not found' });
    }

    res.json(workstation);
  } catch (error) {
    console.error('Get workstation by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createWorkstation = async (req, res) => {
  try {
    const workstationId = await Workstation.create(req.body);
    const workstation = await Workstation.findById(workstationId);
    res.status(201).json(workstation);
  } catch (error) {
    console.error('Create workstation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateWorkstation = async (req, res) => {
  try {
    const { id } = req.params;
    await Workstation.update(id, req.body);
    const workstation = await Workstation.findById(id);
    res.json(workstation);
  } catch (error) {
    console.error('Update workstation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteWorkstation = async (req, res) => {
  try {
    const { id } = req.params;
    await Workstation.delete(id);
    res.json({ message: 'Workstation deleted successfully' });
  } catch (error) {
    console.error('Delete workstation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getWorkstationStats = async (req, res) => {
  try {
    const stats = await Workstation.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get workstation stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
