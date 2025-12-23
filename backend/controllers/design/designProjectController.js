const DesignProject = require('../../models/DesignProject');

const designProjectController = {
  async getAllProjects(req, res) {
    try {
      const { status, priority, search } = req.query;
      const projects = await DesignProject.findAll({ status, priority, search });
      res.json(projects);
    } catch (error) {
      console.error('Error fetching design projects:', error);
      res.status(500).json({ message: 'Failed to fetch design projects', error: error.message });
    }
  },

  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const project = await DesignProject.findById(id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: 'Failed to fetch project', error: error.message });
    }
  },

  async createProject(req, res) {
    try {
      const data = req.body;
      
      if (!data.projectName) {
        return res.status(400).json({ message: 'Project name is required' });
      }
      if (!data.productName) {
        return res.status(400).json({ message: 'Product name is required' });
      }

      const projectId = await DesignProject.create(data);
      const newProject = await DesignProject.findById(projectId);
      
      res.status(201).json({
        message: 'Project created successfully',
        data: newProject
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Failed to create project', error: error.message });
    }
  },

  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const existing = await DesignProject.findById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Project not found' });
      }

      await DesignProject.update(id, data);
      const updatedProject = await DesignProject.findById(id);

      res.json({
        message: 'Project updated successfully',
        data: updatedProject
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ message: 'Failed to update project', error: error.message });
    }
  },

  async updateProjectStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const existing = await DesignProject.findById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Project not found' });
      }

      await DesignProject.updateStatus(id, status);
      const updatedProject = await DesignProject.findById(id);

      res.json({
        message: 'Project status updated successfully',
        data: updatedProject
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      res.status(500).json({ message: 'Failed to update project status', error: error.message });
    }
  },

  async deleteProject(req, res) {
    try {
      const { id } = req.params;

      const existing = await DesignProject.findById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Project not found' });
      }

      await DesignProject.delete(id);

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: 'Failed to delete project', error: error.message });
    }
  }
};

module.exports = designProjectController;
