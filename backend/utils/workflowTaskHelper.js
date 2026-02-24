const pool = require('../config/database');

/**
 * Helper to manage Design Engineer workflow tasks
 */
class WorkflowTaskHelper {
  /**
   * Completes a workflow task by title and opens the next one in sequence
   * @param {number} rootCardId 
   * @param {string} taskTitle 
   * @param {object} connection Optional DB connection
   */
  static async completeAndOpenNext(rootCardId, taskTitle, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      if (!connection) await conn.beginTransaction();

      console.log(`[WorkflowTaskHelper] Completing task: "${taskTitle}" for Root Card: ${rootCardId}`);

      // 1. Find the task to complete
      const [tasks] = await conn.execute(
        `SELECT id, notes FROM department_tasks 
         WHERE root_card_id = ? AND task_title = ? AND status != 'completed'`,
        [rootCardId, taskTitle]
      );

      if (tasks.length === 0) {
        console.log(`[WorkflowTaskHelper] No active task found with title "${taskTitle}"`);
        if (!connection) await conn.rollback();
        return;
      }

      const task = tasks[0];
      let stepOrder = 0;
      
      try {
        const notes = typeof task.notes === 'string' ? JSON.parse(task.notes) : task.notes;
        stepOrder = notes?.step_order || 0;
      } catch (e) {
        console.warn(`[WorkflowTaskHelper] Could not parse notes for task ${task.id}`);
      }

      // 2. Complete the current task
      await conn.execute(
        "UPDATE department_tasks SET status = 'completed', updated_at = NOW() WHERE id = ?",
        [task.id]
      );
      console.log(`[WorkflowTaskHelper] Task ${task.id} marked as completed`);

      // 3. Open the next task (step_order + 1)
      if (stepOrder > 0) {
        const nextStepOrder = stepOrder + 1;
        const [nextTasks] = await conn.execute(
          `SELECT id FROM department_tasks 
           WHERE root_card_id = ? AND status = 'on_hold' 
           AND JSON_EXTRACT(notes, '$.step_order') = ?`,
          [rootCardId, nextStepOrder]
        );

        if (nextTasks.length > 0) {
          await conn.execute(
            "UPDATE department_tasks SET status = 'pending', updated_at = NOW() WHERE id = ?",
            [nextTasks[0].id]
          );
          console.log(`[WorkflowTaskHelper] Next task ${nextTasks[0].id} (Step ${nextStepOrder}) opened (status set to pending)`);
        } else {
          console.log(`[WorkflowTaskHelper] No 'on_hold' task found for next step ${nextStepOrder}`);
        }
      }

      if (!connection) await conn.commit();
    } catch (error) {
      console.error(`[WorkflowTaskHelper] Error:`, error.message);
      if (!connection) await conn.rollback();
      throw error;
    } finally {
      if (!connection) conn.release();
    }
  }

  /**
   * Specifically handles design approval check (Task 1)
   */
  static async checkAndCompleteApproveDesigns(rootCardId, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const DesignEngineeringDetail = require('../models/DesignEngineeringDetail');
      const design = await DesignEngineeringDetail.findByRootCardId(rootCardId);
      
      if (!design) return;

      const drawings = design.drawings3D || [];
      if (drawings.length === 0) return;

      const allApproved = drawings.every(d => d.status === 'approved');
      
      if (allApproved) {
        await this.completeAndOpenNext(rootCardId, 'Approve Designs', conn);
      }
    } catch (error) {
      console.error(`[WorkflowTaskHelper] Error checking designs:`, error.message);
      throw error;
    } finally {
      if (!connection) conn.release();
    }
  }

  /**
   * Specifically handles document approval check (Task 2)
   */
  static async checkAndCompleteApproveDocuments(rootCardId, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const DesignEngineeringDetail = require('../models/DesignEngineeringDetail');
      const design = await DesignEngineeringDetail.findByRootCardId(rootCardId);
      
      if (!design) return;

      const docs = design.documents || [];
      if (docs.length === 0) return;

      const allApproved = docs.every(d => d.status === 'approved');
      
      if (allApproved) {
        await this.completeAndOpenNext(rootCardId, 'Approve Documents', conn);
      }
    } catch (error) {
      console.error(`[WorkflowTaskHelper] Error checking documents:`, error.message);
      throw error;
    } finally {
      if (!connection) conn.release();
    }
  }
}

module.exports = WorkflowTaskHelper;
