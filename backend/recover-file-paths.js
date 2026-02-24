const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'sterling_erp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const UPLOADS_BASE = path.join(__dirname, 'uploads');

async function getAllFiles(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      files = files.concat(await getAllFiles(itemPath));
    } else {
      files.push({
        filename: item,
        fullPath: itemPath,
        relativePath: path.relative(UPLOADS_BASE, itemPath).replace(/\\/g, '/'),
        size: stat.size,
        ext: path.extname(item).toLowerCase()
      });
    }
  }
  return files;
}

async function recoverFilePaths() {
  console.log('Starting file path recovery...');
  console.log(`Upload directory: ${UPLOADS_BASE}\n`);

  try {
    const designEngineeringDir = path.join(UPLOADS_BASE, 'design-engineering');
    console.log(`Scanning directory: ${designEngineeringDir}`);

    if (!fs.existsSync(designEngineeringDir)) {
      console.log('⚠️ Design engineering directory not found');
      return;
    }

    const allUploadedFiles = fs.readdirSync(designEngineeringDir);
    console.log(`Found ${allUploadedFiles.length} files in uploads directory\n`);

    const [designs] = await pool.execute(
      'SELECT id, sales_order_id, documents, drawings_3d FROM design_engineering_details'
    );

    let recoveredCount = 0;
    let skippedCount = 0;

    for (const design of designs) {
      let updated = false;
      let updatedDocuments = [];
      let updatedDrawings = [];

      try {
        if (design.documents) {
          const docs = typeof design.documents === 'string' 
            ? JSON.parse(design.documents) 
            : design.documents;

          if (Array.isArray(docs) && docs.length > 0) {
            updatedDocuments = docs.map(doc => {
              if (!doc.path && doc.name) {
                const baseName = doc.name.split('.')[0];
                const ext = path.extname(doc.name);
                
                const match = allUploadedFiles.find(f => {
                  const fileBase = f.split('.')[0];
                  return f.endsWith(ext) && (
                    f === doc.name || 
                    f.startsWith(baseName) && f.includes('_')
                  );
                });
                
                if (match) {
                  return {
                    ...doc,
                    path: `design-engineering/${match}`,
                    recovered: true
                  };
                }
              }
              return doc;
            });
            
            if (JSON.stringify(updatedDocuments) !== JSON.stringify(docs)) {
              updated = true;
            }
          }
        }

        if (design.drawings_3d) {
          const drawings = typeof design.drawings_3d === 'string' 
            ? JSON.parse(design.drawings_3d) 
            : design.drawings_3d;

          if (Array.isArray(drawings) && drawings.length > 0) {
            updatedDrawings = drawings.map(drawing => {
              if (!drawing.path && drawing.name) {
                const baseName = drawing.name.split('.')[0];
                const ext = path.extname(drawing.name);
                
                const match = allUploadedFiles.find(f => {
                  const fileBase = f.split('.')[0];
                  return f.endsWith(ext) && (
                    f === drawing.name || 
                    f.startsWith(baseName) && f.includes('_')
                  );
                });
                
                if (match) {
                  return {
                    ...drawing,
                    path: `design-engineering/${match}`,
                    recovered: true
                  };
                }
              }
              return drawing;
            });
            
            if (JSON.stringify(updatedDrawings) !== JSON.stringify(drawings)) {
              updated = true;
            }
          }
        }

        if (updated) {
          await pool.execute(
            'UPDATE design_engineering_details SET documents = ?, drawings_3d = ? WHERE id = ?',
            [
              JSON.stringify(updatedDocuments),
              JSON.stringify(updatedDrawings),
              design.id
            ]
          );
          recoveredCount++;
          console.log(`✓ Recovered SO#${design.sales_order_id} - ${updatedDocuments.filter(d => d.path).length} docs, ${updatedDrawings.filter(d => d.path).length} drawings`);
        } else {
          skippedCount++;
        }
      } catch (err) {
        console.error(`✗ Error processing SO#${design.sales_order_id}:`, err.message);
      }
    }

    console.log(`\n=== Recovery Summary ===`);
    console.log(`Total records processed: ${designs.length}`);
    console.log(`Records with recovered paths: ${recoveredCount}`);
    console.log(`Records skipped (no recovery needed): ${skippedCount}`);

  } catch (error) {
    console.error('Recovery failed:', error);
  } finally {
    await pool.end();
  }
}

console.log('=== File Path Recovery Utility ===\n');
recoverFilePaths().catch(console.error);
