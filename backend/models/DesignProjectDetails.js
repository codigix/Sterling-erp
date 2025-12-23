const pool = require('../config/database');

class DesignProjectDetails {
  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      'SELECT * FROM design_project_details WHERE root_card_id = ?',
      [rootCardId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async createOrUpdate(rootCardId, data) {
    try {
      const existing = await this.findByRootCardId(rootCardId);
      if (existing) {
        return this.update(rootCardId, data);
      }
    } catch (err) {
      console.log('Note: Existing record check failed, will insert new record');
    }
    return this.create(rootCardId, data);
  }

  static async create(rootCardId, data, externalConnection = null) {
    const connection = externalConnection || pool;
    
    console.log('Creating design project details with materials:', {
      steelSections: data.steelSections,
      plates: data.plates,
      fasteners: data.fasteners,
      components: data.components,
      electrical: data.electrical,
      consumables: data.consumables
    });

    const [result] = await connection.execute(
      `INSERT INTO design_project_details (
        root_card_id, design_id, project_name, product_name, design_status,
        design_engineer_name, system_length, system_width, system_height,
        load_capacity, operating_environment, material_grade, surface_finish,
        steel_sections, plates, fasteners, components, electrical, consumables,
        design_specifications, manufacturing_instructions, quality_safety,
        additional_notes, reference_documents
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rootCardId,
        data.designId || null,
        // data.designName || null, // Removed
        data.projectName || null,
        data.productName || null,
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
        data.referenceDocuments && data.referenceDocuments.length > 0 ? JSON.stringify(data.referenceDocuments) : null
      ]
    );
    return result.insertId;
  }

  static async update(rootCardId, data) {
    console.log('Updating design project details with materials:', {
      steelSections: data.steelSections,
      plates: data.plates,
      fasteners: data.fasteners,
      components: data.components,
      electrical: data.electrical,
      consumables: data.consumables
    });

    await pool.execute(
      `UPDATE design_project_details SET
        design_id = ?,
        design_name = ?,
        project_name = ?,
        product_name = ?,
        design_status = ?,
        design_engineer_name = ?,
        system_length = ?,
        system_width = ?,
        system_height = ?,
        load_capacity = ?,
        operating_environment = ?,
        material_grade = ?,
        surface_finish = ?,
        steel_sections = ?,
        plates = ?,
        fasteners = ?,
        components = ?,
        electrical = ?,
        consumables = ?,
        design_specifications = ?,
        manufacturing_instructions = ?,
        quality_safety = ?,
        additional_notes = ?,
        reference_documents = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE root_card_id = ?`,
      [
        data.designId || null,
        data.designName || null,
        data.projectName || null,
        data.productName || null,
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
        rootCardId
      ]
    );
  }

  static async delete(rootCardId) {
    await pool.execute(
      'DELETE FROM design_project_details WHERE root_card_id = ?',
      [rootCardId]
    );
  }

  static formatRow(row) {
    if (!row) return null;
    
    const parseJSON = (data) => {
      if (!data || data === '') return [];
      
      if (Array.isArray(data)) {
        return data;
      }
      
      if (typeof data === 'object' && data !== null) {
        return Array.isArray(data) ? data : [];
      }
      
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        console.error('Error parsing JSON field:', err.message, 'Attempting recovery from:', data);
        if (typeof data === 'string' && data.trim()) {
          const items = data.split(',').map(s => s.trim()).filter(s => s.length > 0);
          console.log('Successfully recovered items from malformed data:', items);
          return items;
        }
        return [];
      }
    };
    
    const formatted = {
      id: row.id,
      rootCardId: row.root_card_id,
      designId: row.design_id,
      designName: row.design_name,
      projectName: row.project_name,
      productName: row.product_name,
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

    console.log('Formatted row with materials:', {
      steelSections: formatted.steelSections,
      plates: formatted.plates,
      fasteners: formatted.fasteners,
      components: formatted.components,
      electrical: formatted.electrical,
      consumables: formatted.consumables
    });

    return formatted;
  }
}

module.exports = DesignProjectDetails;
