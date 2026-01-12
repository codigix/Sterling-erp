const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sterling_erp',
};

async function fixGRNInspectionStatus() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected!');

    console.log('Altering grn table inspection_status column...');
    
    // We want to allow all QC statuses in grn.inspection_status as well
    const alterQuery = `
      ALTER TABLE grn 
      MODIFY COLUMN inspection_status ENUM(
        'pending', 
        'in_progress', 
        'passed', 
        'failed', 
        'conditional', 
        'partially_completed', 
        'shortage', 
        'overage',
        'rejected',
        'approved',
        'hold'
      ) DEFAULT 'pending';
    `;

    await connection.query(alterQuery);
    console.log('Successfully updated grn inspection_status column definition.');

  } catch (error) {
    console.error('Error updating schema:', error);
    if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log("Column inspection_status might not exist. Adding it.");
        try {
            const addQuery = `
                ALTER TABLE grn
                ADD COLUMN inspection_status ENUM(
                    'pending', 
                    'in_progress', 
                    'passed', 
                    'failed', 
                    'conditional', 
                    'partially_completed', 
                    'shortage', 
                    'overage',
                    'rejected',
                    'approved',
                    'hold'
                ) DEFAULT 'pending';
            `;
            await connection.query(addQuery);
            console.log("Column added successfully.");
        } catch (addError) {
             console.error("Failed to add column:", addError);
        }
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

fixGRNInspectionStatus();
