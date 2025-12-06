const Facility = require('../../models/Facility');

const facilityController = {
  async createFacility(req, res) {
    try {
      const { name, location, capacity, equipment, status } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Facility name is required' });
      }

      const facilityId = await Facility.create({
        name,
        location,
        capacity,
        equipment,
        status
      });

      res.status(201).json({
        message: 'Facility created successfully',
        facilityId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating facility', error: error.message });
    }
  },

  async getFacility(req, res) {
    try {
      const { id } = req.params;
      const facility = await Facility.findById(id);

      if (!facility) {
        return res.status(404).json({ message: 'Facility not found' });
      }

      res.json(facility);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching facility', error: error.message });
    }
  },

  async getAllFacilities(req, res) {
    try {
      const { status, search } = req.query;
      const filters = {};

      if (status) {
        filters.status = status;
      }
      if (search) {
        filters.search = search;
      }

      const facilities = await Facility.findAll(filters);
      res.json(facilities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching facilities', error: error.message });
    }
  },

  async updateFacility(req, res) {
    try {
      const { id } = req.params;
      const { name, location, capacity, equipment, status } = req.body;

      const facility = await Facility.findById(id);
      if (!facility) {
        return res.status(404).json({ message: 'Facility not found' });
      }

      await Facility.update(id, {
        name: name || facility.name,
        location: location || facility.location,
        capacity: capacity !== undefined ? capacity : facility.capacity,
        equipment: equipment || facility.equipment,
        status: status || facility.status
      });

      res.json({ message: 'Facility updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating facility', error: error.message });
    }
  },

  async deleteFacility(req, res) {
    try {
      const { id } = req.params;

      const facility = await Facility.findById(id);
      if (!facility) {
        return res.status(404).json({ message: 'Facility not found' });
      }

      await Facility.delete(id);
      res.json({ message: 'Facility deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting facility', error: error.message });
    }
  },

  async getAvailableFacilities(req, res) {
    try {
      const facilities = await Facility.getAvailableFacilities();
      res.json(facilities);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching available facilities', error: error.message });
    }
  }
};

module.exports = facilityController;
