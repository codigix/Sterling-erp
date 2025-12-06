const ProjectTracking = require('../../models/ProjectTracking');
const EmployeeTracking = require('../../models/EmployeeTracking');

const trackingController = {
  async createProjectMilestone(req, res) {
    try {
      const { projectId, milestoneName, targetDate } = req.body;

      if (!projectId || !milestoneName) {
        return res.status(400).json({ message: 'Project ID and milestone name are required' });
      }

      const milestoneId = await ProjectTracking.create({
        projectId,
        milestoneName,
        targetDate,
        status: 'not_started'
      });

      res.status(201).json({
        message: 'Milestone created successfully',
        milestoneId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating milestone', error: error.message });
    }
  },

  async getProjectMilestones(req, res) {
    try {
      const { projectId } = req.params;
      const milestones = await ProjectTracking.findByProjectId(projectId);
      res.json(milestones);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching milestones', error: error.message });
    }
  },

  async updateMilestoneProgress(req, res) {
    try {
      const { id } = req.params;
      const { completionPercentage } = req.body;

      await ProjectTracking.updateProgress(id, completionPercentage);
      res.json({ message: 'Milestone progress updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating milestone progress', error: error.message });
    }
  },

  async updateMilestoneStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['not_started', 'in_progress', 'completed', 'delayed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      await ProjectTracking.updateStatus(id, status);
      res.json({ message: 'Milestone status updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating milestone status', error: error.message });
    }
  },

  async getProjectProgress(req, res) {
    try {
      const { projectId } = req.params;
      const progress = await ProjectTracking.getProjectProgress(projectId);
      res.json(progress);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching project progress', error: error.message });
    }
  },

  async createEmployeeTracking(req, res) {
    try {
      const { employeeId, projectId, productionStageId } = req.body;

      if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID is required' });
      }

      const trackingId = await EmployeeTracking.create({
        employeeId,
        projectId,
        productionStageId
      });

      res.status(201).json({
        message: 'Employee tracking created successfully',
        trackingId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating employee tracking', error: error.message });
    }
  },

  async getEmployeeTracking(req, res) {
    try {
      const { employeeId } = req.params;
      const trackingData = await EmployeeTracking.findByEmployeeId(employeeId);
      res.json(trackingData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching employee tracking', error: error.message });
    }
  },

  async getProjectTeamTracking(req, res) {
    try {
      const { projectId } = req.params;
      const teamData = await EmployeeTracking.findByProjectId(projectId);
      res.json(teamData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching team tracking', error: error.message });
    }
  },

  async updateEmployeeTaskStats(req, res) {
    try {
      const { employeeId, projectId } = req.params;
      const { tasksAssigned, tasksCompleted, tasksInProgress, tasksPaused, tasksCancelled } = req.body;

      await EmployeeTracking.updateTaskStats(employeeId, projectId, {
        tasksAssigned,
        tasksCompleted,
        tasksInProgress,
        tasksPaused,
        tasksCancelled
      });

      res.json({ message: 'Employee stats updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating employee stats', error: error.message });
    }
  },

  async updateEmployeeEfficiency(req, res) {
    try {
      const { employeeId, projectId } = req.params;
      const { efficiencyPercentage } = req.body;

      await EmployeeTracking.updateEfficiency(employeeId, projectId, efficiencyPercentage);
      res.json({ message: 'Employee efficiency updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating efficiency', error: error.message });
    }
  },

  async getEmployeePerformance(req, res) {
    try {
      const { employeeId } = req.params;
      const performance = await EmployeeTracking.getEmployeePerformance(employeeId);
      res.json(performance);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching employee performance', error: error.message });
    }
  },

  async getProjectTeamPerformance(req, res) {
    try {
      const { projectId } = req.params;
      const performance = await EmployeeTracking.getProjectTeamPerformance(projectId);
      res.json(performance);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching team performance', error: error.message });
    }
  }
};

module.exports = trackingController;
