const Designation = require('../../models/Designation');
const pool = require('../../config/database');

exports.getDesignations = async (req, res) => {
  try {
    const designations = await Designation.findAll();

    for (const designation of designations) {
      const [employees] = await pool.execute(
        'SELECT COUNT(*) as count FROM employees WHERE designation = ?',
        [designation.name]
      );
      designation.employeeCount = employees[0]?.count || 0;
    }

    res.json({ designations });
  } catch (error) {
    console.error('Get designations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDesignationById = async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findById(id);

    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }

    res.json({ designation });
  } catch (error) {
    console.error('Get designation by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createDesignation = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Designation name is required' });
    }

    const designationId = await Designation.create({ name, description });

    res.status(201).json({
      message: 'Designation created successfully',
      designationId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Designation already exists' });
    }
    console.error('Create designation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const existingDesignation = await Designation.findById(id);
    if (!existingDesignation) {
      return res.status(404).json({ message: 'Designation not found' });
    }

    await Designation.update(id, { name, description, status });

    res.json({ message: 'Designation updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Designation name already exists' });
    }
    console.error('Update designation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;

    const designation = await Designation.findById(id);
    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }

    try {
      const [employees] = await pool.execute(
        'SELECT COUNT(*) as count FROM employees WHERE designation = ?',
        [designation.name]
      );
      if (employees && employees.length > 0 && employees[0].count > 0) {
        return res.status(400).json({
          message: `Cannot delete designation that is assigned to ${employees[0].count} employees`
        });
      }
    } catch (err) {
      console.error('Error checking employee count:', err);
    }

    await Designation.delete(id);

    res.json({ message: 'Designation deleted successfully' });
  } catch (error) {
    console.error('Delete designation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.setDesignationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either active or inactive' });
    }

    const designation = await Designation.findById(id);
    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }

    await Designation.setStatus(id, status);

    res.json({
      message: `Designation ${status} successfully`,
      designation: {
        id: designation.id,
        name: designation.name,
        status
      }
    });
  } catch (error) {
    console.error('Set designation status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
