const pool = require('../config/database');

class Workstation {
  static async findAll() {
    const [rows] = await pool.execute(`
      SELECT w.*, d.name AS department_name 
      FROM workstations w
      LEFT JOIN departments d ON w.responsible_dept = d.id
      ORDER BY w.display_name
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT w.*, d.name AS department_name 
      FROM workstations w
      LEFT JOIN departments d ON w.responsible_dept = d.id
      WHERE w.id = ?
    `, [id]);
    return rows[0];
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO workstations (
        workstation_id, display_name, building_area, responsible_dept, 
        equipment_class, equipment_code, units_per_hour, target_utilization, 
        technical_description, operational_status, is_active, 
        maintenance_schedule, last_maintenance_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.workstation_id,
        data.display_name,
        data.building_area || null,
        data.responsible_dept || null,
        data.equipment_class || null,
        data.equipment_code || null,
        data.units_per_hour || 0,
        data.target_utilization || 80.00,
        data.technical_description || null,
        data.operational_status || 'Operational',
        data.is_active !== undefined ? data.is_active : true,
        data.maintenance_schedule || 'Monthly',
        data.last_maintenance_date || null
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const updates = [];
    const values = [];

    const fields = [
      'workstation_id', 'display_name', 'building_area', 'responsible_dept',
      'equipment_class', 'equipment_code', 'units_per_hour', 'target_utilization',
      'technical_description', 'operational_status', 'is_active',
      'maintenance_schedule', 'last_maintenance_date'
    ];

    fields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (updates.length === 0) return;

    values.push(id);
    await pool.execute(
      `UPDATE workstations SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM workstations WHERE id = ?', [id]);
  }

  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_assets,
        SUM(CASE WHEN operational_status = 'Operational' THEN 1 ELSE 0 END) as operational,
        COUNT(DISTINCT equipment_class) as asset_classes
      FROM workstations
      WHERE is_active = TRUE
    `);
    return rows[0];
  }
}

module.exports = Workstation;
