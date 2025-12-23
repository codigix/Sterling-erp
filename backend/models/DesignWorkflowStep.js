const pool = require('../config/database');

class DesignWorkflowStep {
  static async getAllSteps() {
    const [rows] = await pool.execute(
      `SELECT * FROM design_workflow_steps 
       WHERE is_active = TRUE 
       ORDER BY step_order ASC`
    );
    return rows || [];
  }

  static async getStepByOrder(stepOrder) {
    const [rows] = await pool.execute(
      `SELECT * FROM design_workflow_steps 
       WHERE step_order = ? AND is_active = TRUE 
       LIMIT 1`,
      [stepOrder]
    );
    return rows[0] || null;
  }

  static async getStepByTrigger(trigger) {
    const [rows] = await pool.execute(
      `SELECT * FROM design_workflow_steps 
       WHERE auto_create_on_trigger = ? AND is_active = TRUE 
       LIMIT 1`,
      [trigger]
    );
    return rows[0] || null;
  }

  static async getStepById(stepId) {
    const [rows] = await pool.execute(
      `SELECT * FROM design_workflow_steps 
       WHERE id = ? 
       LIMIT 1`,
      [stepId]
    );
    return rows[0] || null;
  }

  static async createStep(data) {
    const {
      stepName,
      stepOrder,
      description,
      taskTemplateTitle,
      taskTemplateDescription,
      priority = 'medium',
      autoCreateOnTrigger,
      isActive = true
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO design_workflow_steps 
       (step_name, step_order, description, task_template_title, task_template_description, priority, auto_create_on_trigger, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [stepName, stepOrder, description, taskTemplateTitle, taskTemplateDescription, priority, autoCreateOnTrigger, isActive]
    );
    return result;
  }

  static async updateStep(stepId, data) {
    const fields = [];
    const values = [];

    const allowedFields = ['step_name', 'description', 'task_template_title', 'task_template_description', 'priority', 'auto_create_on_trigger', 'is_active'];
    
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return { affectedRows: 0 };
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(stepId);

    const query = `UPDATE design_workflow_steps SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result;
  }
}

module.exports = DesignWorkflowStep;
