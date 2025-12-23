const pool = require('../config/database');

class DesignProject {
  static formatRow(row) {
    if (!row) return null;
    
    const parseJSON = (data) => {
      if (!data || data === '') return [];
      if (Array.isArray(data)) return data;
      if (typeof data === 'object' && data !== null) return Array.isArray(data) ? data : [];
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        return [];
      }
    };
    
    return {
      id: row.id,
      projectName: row.project_name,
      projectCode: row.project_code,
      designId: row.design_id,
      productName: row.product_name,
      clientName: row.client_name,
      priority: row.priority,
      status: row.status,
      designStatus: row.design_status,
      designEngineerName: row.design_engineer_name,
      systemLength: row.system_length,
      systemWidth: row.system_width,
      systemHeight: row.system_height,
      loadCapacity: row.load_capacity,
      operatingEnvironment: row.operating_environment,
      materialGrade: row.material_grade,
      surfaceFinish: row.surface_finish,
      steelSections: parseJSON(row.steel_sections),
      plates: parseJSON(row.plates),
      fasteners: parseJSON(row.fasteners),
      components: parseJSON(row.components),
      electrical: parseJSON(row.electrical),
      consumables: parseJSON(row.consumables),
      designSpecifications: row.design_specifications,
      manufacturingInstructions: row.manufacturing_instructions,
      qualitySafety: row.quality_safety,
      additionalNotes: row.additional_notes,
      referenceDocuments: parseJSON(row.reference_documents),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static async findAll(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.status && filters.status !== 'all') {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      conditions.push('priority = ?');
      params.push(filters.priority);
    }

    if (filters.search) {
      conditions.push('(project_name LIKE ? OR project_code LIKE ? OR client_name LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like, like);
    }

    let query = 'SELECT * FROM design_projects';
    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows.map(DesignProject.formatRow);
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM design_projects WHERE id = ?', [id]);
    return DesignProject.formatRow(rows[0]);
  }

  static async create(data) {
    const projectCode = data.projectCode || `DP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const [result] = await pool.execute(
      `INSERT INTO design_projects (
        project_name, project_code, design_id, product_name, client_name,
        priority, status, design_status, design_engineer_name,
        system_length, system_width, system_height, load_capacity,
        operating_environment, material_grade, surface_finish,
        steel_sections, plates, fasteners, components, electrical, consumables,
        design_specifications, manufacturing_instructions, quality_safety,
        additional_notes, reference_documents, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.projectName || null,
        projectCode,
        data.designId || null,
        data.productName || null,
        data.clientName || null,
        data.priority || 'medium',
        data.status || 'draft',
        data.designStatus || 'draft',
        data.designEngineerName || null,
        data.systemLength || null,
        data.systemWidth || null,
        data.systemHeight || null,
        data.loadCapacity || null,
        data.operatingEnvironment || null,
        data.materialGrade || null,
        data.surfaceFinish || null,
        data.steelSections && data.steelSections.length > 0 ? JSON.stringify(data.steelSections) : null,
        data.plates && data.plates.length > 0 ? JSON.stringify(data.plates) : null,
        data.fasteners && data.fasteners.length > 0 ? JSON.stringify(data.fasteners) : null,
        data.components && data.components.length > 0 ? JSON.stringify(data.components) : null,
        data.electrical && data.electrical.length > 0 ? JSON.stringify(data.electrical) : null,
        data.consumables && data.consumables.length > 0 ? JSON.stringify(data.consumables) : null,
        data.designSpecifications || null,
        data.manufacturingInstructions || null,
        data.qualitySafety || null,
        data.additionalNotes || null,
        data.referenceDocuments && data.referenceDocuments.length > 0 ? JSON.stringify(data.referenceDocuments) : null,
        data.createdBy || null
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const updates = {};
    if (data.projectName !== undefined) updates.project_name = data.projectName;
    if (data.projectCode !== undefined) updates.project_code = data.projectCode;
    if (data.designId !== undefined) updates.design_id = data.designId;
    if (data.productName !== undefined) updates.product_name = data.productName;
    if (data.clientName !== undefined) updates.client_name = data.clientName;
    if (data.priority !== undefined) updates.priority = data.priority;
    if (data.status !== undefined) updates.status = data.status;
    if (data.designStatus !== undefined) updates.design_status = data.designStatus;
    if (data.designEngineerName !== undefined) updates.design_engineer_name = data.designEngineerName;
    if (data.systemLength !== undefined) updates.system_length = data.systemLength;
    if (data.systemWidth !== undefined) updates.system_width = data.systemWidth;
    if (data.systemHeight !== undefined) updates.system_height = data.systemHeight;
    if (data.loadCapacity !== undefined) updates.load_capacity = data.loadCapacity;
    if (data.operatingEnvironment !== undefined) updates.operating_environment = data.operatingEnvironment;
    if (data.materialGrade !== undefined) updates.material_grade = data.materialGrade;
    if (data.surfaceFinish !== undefined) updates.surface_finish = data.surfaceFinish;
    if (data.steelSections !== undefined) updates.steel_sections = data.steelSections && data.steelSections.length > 0 ? JSON.stringify(data.steelSections) : null;
    if (data.plates !== undefined) updates.plates = data.plates && data.plates.length > 0 ? JSON.stringify(data.plates) : null;
    if (data.fasteners !== undefined) updates.fasteners = data.fasteners && data.fasteners.length > 0 ? JSON.stringify(data.fasteners) : null;
    if (data.components !== undefined) updates.components = data.components && data.components.length > 0 ? JSON.stringify(data.components) : null;
    if (data.electrical !== undefined) updates.electrical = data.electrical && data.electrical.length > 0 ? JSON.stringify(data.electrical) : null;
    if (data.consumables !== undefined) updates.consumables = data.consumables && data.consumables.length > 0 ? JSON.stringify(data.consumables) : null;
    if (data.designSpecifications !== undefined) updates.design_specifications = data.designSpecifications;
    if (data.manufacturingInstructions !== undefined) updates.manufacturing_instructions = data.manufacturingInstructions;
    if (data.qualitySafety !== undefined) updates.quality_safety = data.qualitySafety;
    if (data.additionalNotes !== undefined) updates.additional_notes = data.additionalNotes;
    if (data.referenceDocuments !== undefined) updates.reference_documents = data.referenceDocuments && data.referenceDocuments.length > 0 ? JSON.stringify(data.referenceDocuments) : null;
    updates.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    await pool.execute(`UPDATE design_projects SET ${setClause} WHERE id = ?`, values);
  }

  static async updateStatus(id, status) {
    await pool.execute('UPDATE design_projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM design_projects WHERE id = ?', [id]);
  }
}

module.exports = DesignProject;
