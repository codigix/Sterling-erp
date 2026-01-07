const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function diagnose() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sterling_erp'
  });

  try {
    console.log('\n===== ROOT CARD 21 DIAGNOSIS =====\n');

    // Check if root card 21 exists
    const [rcData] = await pool.execute(
      `SELECT id, project_id, code, title, status FROM root_cards WHERE id = 21`
    );
    console.log('1. Root Card 21 Data:');
    console.log(rcData.length ? rcData[0] : 'NOT FOUND');

    if (rcData.length) {
      const projectId = rcData[0].project_id;
      
      // Check project and sales order
      const [projData] = await pool.execute(
        `SELECT p.id, p.name, p.sales_order_id, so.id as so_exists FROM projects p
         LEFT JOIN sales_orders so ON so.id = p.sales_order_id
         WHERE p.id = ?`,
        [projectId]
      );
      console.log('\n2. Project Data:');
      console.log(projData.length ? projData[0] : 'NOT FOUND');

      if (projData.length && projData[0].sales_order_id) {
        // Check sales order steps
        const [sosData] = await pool.execute(
          `SELECT id, step_id, assigned_to, status FROM sales_order_steps 
           WHERE sales_order_id = ?`,
          [projData[0].sales_order_id]
        );
        console.log('\n3. Sales Order Steps:');
        console.log(sosData.length ? sosData : 'NONE');
      }
    }

    // Check manufacturing stages
    const [msData] = await pool.execute(
      `SELECT id, root_card_id, stage_name, assigned_worker FROM manufacturing_stages WHERE root_card_id = 21`
    );
    console.log('\n4. Manufacturing Stages Assigned to Root Card 21:');
    console.log(msData.length ? msData : 'NONE');

    // List all users
    const [usersData] = await pool.execute(
      `SELECT id, username, role_id FROM users LIMIT 10`
    );
    console.log('\n5. Sample Users (to identify your ID):');
    console.log(usersData);

    console.log('\n===== END DIAGNOSIS =====\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

diagnose();
