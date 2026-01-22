const ItemGroup = require('../../models/ItemGroup');

exports.getItemGroups = async (req, res) => {
  try {
    const groups = await ItemGroup.findAll();
    res.json(groups);
  } catch (error) {
    console.error('Get item groups error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createItemGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const id = await ItemGroup.create({ name, description });
    res.status(201).json({ message: 'Item group created successfully', id });
  } catch (error) {
    console.error('Create item group error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Item group name already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateItemGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    await ItemGroup.update(id, { name, description });
    res.json({ message: 'Item group updated successfully' });
  } catch (error) {
    console.error('Update item group error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteItemGroup = async (req, res) => {
  try {
    const { id } = req.params;
    await ItemGroup.delete(id);
    res.json({ message: 'Item group deleted successfully' });
  } catch (error) {
    console.error('Delete item group error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
