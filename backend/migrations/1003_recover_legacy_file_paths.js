const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function up() {
  try {
    console.log('🔄 Recovering legacy file paths...\n');

    const uploadDir = path.join(__dirname, '../uploads/design-engineering');
    
    if (!fs.existsSync(uploadDir)) {
      console.log('⚠️ Upload directory not found, skipping migration');
      return;
    }

    const uploadedFiles = fs.readdirSync(uploadDir);
    console.log(`Found ${uploadedFiles.length} files in uploads directory`);

    const [records] = await pool.execute(
      'SELECT id, sales_order_id, documents, drawings_3d FROM design_engineering_details'
    );

    let totalRecovered = 0;

    for (const record of records) {
      let updated = false;
      let newDocs = [];
      let newDrawings = [];

      try {
        if (record.documents) {
          const docs = typeof record.documents === 'string' 
            ? JSON.parse(record.documents) 
            : record.documents;

          newDocs = Array.isArray(docs) ? docs.map(doc => {
            if (!doc.path && doc.name) {
              const baseName = path.basename(doc.name, path.extname(doc.name));
              const ext = path.extname(doc.name);
              
              const match = uploadedFiles.find(f => 
                f.endsWith(ext) && (
                  f === doc.name || 
                  f.startsWith(baseName) && f.includes('_')
                )
              );
              
              if (match) {
                totalRecovered++;
                return {
                  ...doc,
                  path: `design-engineering/${match}`,
                  recovered: true
                };
              }
            }
            return doc;
          }) : [];

          if (JSON.stringify(newDocs) !== JSON.stringify(docs)) {
            updated = true;
          }
        }

        if (record.drawings_3d) {
          const drawings = typeof record.drawings_3d === 'string' 
            ? JSON.parse(record.drawings_3d) 
            : record.drawings_3d;

          newDrawings = Array.isArray(drawings) ? drawings.map(drawing => {
            if (!drawing.path && drawing.name) {
              const baseName = path.basename(drawing.name, path.extname(drawing.name));
              const ext = path.extname(drawing.name);
              
              const match = uploadedFiles.find(f => 
                f.endsWith(ext) && (
                  f === drawing.name || 
                  f.startsWith(baseName) && f.includes('_')
                )
              );
              
              if (match) {
                totalRecovered++;
                return {
                  ...drawing,
                  path: `design-engineering/${match}`,
                  recovered: true
                };
              }
            }
            return drawing;
          }) : [];

          if (JSON.stringify(newDrawings) !== JSON.stringify(drawings)) {
            updated = true;
          }
        }

        if (updated) {
          await pool.execute(
            'UPDATE design_engineering_details SET documents = ?, drawings_3d = ? WHERE id = ?',
            [
              JSON.stringify(newDocs || []),
              JSON.stringify(newDrawings || []),
              record.id
            ]
          );
          console.log(`✓ SO#${record.sales_order_id}: Recovered paths for ${newDocs.filter(d => d.path).length} docs, ${newDrawings.filter(d => d.path).length} drawings`);
        }
      } catch (err) {
        console.error(`✗ SO#${record.sales_order_id}: ${err.message}`);
      }
    }

    console.log(`\n✅ Migration complete: ${totalRecovered} file paths recovered`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    console.log('🔄 Reverting legacy file paths...');

    const [records] = await pool.execute(
      'SELECT id, documents, drawings_3d FROM design_engineering_details'
    );

    for (const record of records) {
      const docs = typeof record.documents === 'string' 
        ? JSON.parse(record.documents) 
        : record.documents || [];

      const drawings = typeof record.drawings_3d === 'string' 
        ? JSON.parse(record.drawings_3d) 
        : record.drawings_3d || [];

      const cleanedDocs = docs.map(d => {
        const { recovered, ...rest } = d;
        if (recovered) delete rest.path;
        return rest;
      });

      const cleanedDrawings = drawings.map(d => {
        const { recovered, ...rest } = d;
        if (recovered) delete rest.path;
        return rest;
      });

      await pool.execute(
        'UPDATE design_engineering_details SET documents = ?, drawings_3d = ? WHERE id = ?',
        [
          JSON.stringify(cleanedDocs),
          JSON.stringify(cleanedDrawings),
          record.id
        ]
      );
    }

    console.log('✅ Revert complete');
  } catch (error) {
    console.error('❌ Revert failed:', error);
    throw error;
  }
}

module.exports = { up, down };
