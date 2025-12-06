const pool = require('../config/database');

class EmployeeTracking {
  static async create(data) {
    const [result] = await pool.execute(
      `
        INSERT INTO employee_tracking (employee_id, project_id, production_stage_id, 
                                       tasks_assigned, tasks_completed, tasks_in_progress)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        data.employeeId,
        data.projectId || null,
        data.productionStageId || null,
        data.tasksAssigned || 0,
        data.tasksCompleted || 0,
        data.tasksInProgress || 0
      ]
    );
    return result.insertId;
  }

  static async findByEmployeeId(employeeId) {
    const [rows] = await pool.execute(
      `
        SELECT et.*, u.username AS employee_name, p.name AS project_name, ps.stage_name
        FROM employee_tracking et
        LEFT JOIN users u ON u.id = et.employee_id
        LEFT JOIN projects p ON p.id = et.project_id
        LEFT JOIN production_stages ps ON ps.id = et.production_stage_id
        WHERE et.employee_id = ?
        ORDER BY et.last_updated DESC
      `,
      [employeeId]
    );
    return rows || [];
  }

  static async findByProjectId(projectId) {
    const [rows] = await pool.execute(
      `
        SELECT et.*, u.username AS employee_name, u.email AS employee_email
        FROM employee_tracking et
        LEFT JOIN users u ON u.id = et.employee_id
        WHERE et.project_id = ?
        ORDER BY u.username ASC
      `,
      [projectId]
    );
    return rows || [];
  }

  static async updateTaskStats(employeeId, projectId, stats) {
    await pool.execute(
      `
        UPDATE employee_tracking
        SET tasks_assigned = ?, tasks_completed = ?, tasks_in_progress = ?, 
            tasks_paused = ?, tasks_cancelled = ?, last_updated = CURRENT_TIMESTAMP
        WHERE employee_id = ? AND project_id = ?
      `,
      [
        stats.tasksAssigned || 0,
        stats.tasksCompleted || 0,
        stats.tasksInProgress || 0,
        stats.tasksPaused || 0,
        stats.tasksCancelled || 0,
        employeeId,
        projectId
      ]
    );
  }

  static async updateEfficiency(employeeId, projectId, efficiencyPercentage) {
    await pool.execute(
      `
        UPDATE employee_tracking
        SET efficiency_percentage = ?, last_updated = CURRENT_TIMESTAMP
        WHERE employee_id = ? AND project_id = ?
      `,
      [efficiencyPercentage, employeeId, projectId]
    );
  }

  static async updateHoursWorked(employeeId, projectId, hoursWorked) {
    await pool.execute(
      `
        UPDATE employee_tracking
        SET total_hours_worked = total_hours_worked + ?, last_updated = CURRENT_TIMESTAMP
        WHERE employee_id = ? AND project_id = ?
      `,
      [hoursWorked, employeeId, projectId]
    );
  }

  static async getEmployeePerformance(employeeId) {
    const [rows] = await pool.execute(
      `
        SELECT 
          SUM(tasks_assigned) as total_tasks_assigned,
          SUM(tasks_completed) as total_tasks_completed,
          SUM(tasks_in_progress) as total_tasks_in_progress,
          SUM(tasks_paused) as total_tasks_paused,
          SUM(tasks_cancelled) as total_tasks_cancelled,
          ROUND(AVG(efficiency_percentage), 0) as average_efficiency,
          SUM(total_hours_worked) as total_hours_worked
        FROM employee_tracking
        WHERE employee_id = ?
      `,
      [employeeId]
    );
    return rows[0];
  }

  static async getProjectTeamPerformance(projectId) {
    const [rows] = await pool.execute(
      `
        SELECT 
          et.employee_id,
          u.username AS employee_name,
          et.tasks_assigned,
          et.tasks_completed,
          et.tasks_in_progress,
          et.efficiency_percentage,
          et.total_hours_worked
        FROM employee_tracking et
        LEFT JOIN users u ON u.id = et.employee_id
        WHERE et.project_id = ?
        ORDER BY et.efficiency_percentage DESC
      `,
      [projectId]
    );
    return rows || [];
  }

  static async delete(employeeId, projectId) {
    await pool.execute(
      'DELETE FROM employee_tracking WHERE employee_id = ? AND project_id = ?',
      [employeeId, projectId]
    );
  }
}

module.exports = EmployeeTracking;
