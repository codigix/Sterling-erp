const pool = require('../config/database');

class ProjectTracking {
  static async create(data) {
    const [result] = await pool.execute(
      `
        INSERT INTO project_tracking (project_id, milestone_name, target_date, status)
        VALUES (?, ?, ?, ?)
      `,
      [
        data.projectId,
        data.milestoneName || null,
        data.targetDate || null,
        data.status || 'not_started'
      ]
    );
    return result.insertId;
  }

  static async findByProjectId(projectId) {
    const [rows] = await pool.execute(
      `
        SELECT pt.*, p.name AS project_name
        FROM project_tracking pt
        LEFT JOIN projects p ON p.id = pt.project_id
        WHERE pt.project_id = ?
        ORDER BY pt.target_date ASC
      `,
      [projectId]
    );
    return rows || [];
  }

  static async updateProgress(id, completionPercentage) {
    await pool.execute(
      'UPDATE project_tracking SET completion_percentage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [completionPercentage, id]
    );
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE project_tracking SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
  }

  static async getProjectProgress(projectId) {
    const [rows] = await pool.execute(
      `
        SELECT 
          COUNT(*) as total_milestones,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_milestones,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_milestones,
          SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) as delayed_milestones,
          ROUND(AVG(completion_percentage), 0) as average_completion
        FROM project_tracking
        WHERE project_id = ?
      `,
      [projectId]
    );
    return rows[0];
  }

  static async delete(id) {
    await pool.execute('DELETE FROM project_tracking WHERE id = ?', [id]);
  }
}

module.exports = ProjectTracking;
