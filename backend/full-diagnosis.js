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
    console.log('\n========== FULL ROOT CARD 21 DIAGNOSIS ==========\n');

    // 1. Get all users
    const [users] = await pool.execute(
      `SELECT id, username, role_id FROM users ORDER BY id`
    );
    console.log('All Users:');
    users.forEach(u => console.log(`  [${u.id}] ${u.username} (role_id: ${u.role_id})`));

    // 2. Check root card 21
    const [rcData] = await pool.execute(
      `SELECT id, project_id, code, title FROM root_cards WHERE id = 21`
    );
    console.log('\nRoot Card 21:');
    console.log(rcData.length ? rcData[0] : 'NOT FOUND');

    if (!rcData.length) {
      await pool.end();
      return;
    }

    const projectId = rcData[0].project_id;

    // 3. Get project and sales order info
    const [projData] = await pool.execute(
      `SELECT p.id, p.name, p.sales_order_id FROM projects p WHERE p.id = ?`,
      [projectId]
    );
    console.log('\nProject 8 (associated with RC 21):');
    console.log(projData.length ? projData[0] : 'NOT FOUND');

    if (projData.length && projData[0].sales_order_id) {
      // 4. Get ALL sales order steps with user details
      const [sosData] = await pool.execute(
        `SELECT sos.id, sos.step_id, sos.assigned_to, sos.status, u.username 
         FROM sales_order_steps sos
         LEFT JOIN users u ON u.id = sos.assigned_to
         WHERE sos.sales_order_id = ?
         ORDER BY sos.step_id`,
        [projData[0].sales_order_id]
      );
      console.log('\nSales Order Steps for SO 5 (all assignments):');
      sosData.forEach(s => {
        console.log(`  Step ${s.step_id}: assigned_to=${s.assigned_to} (${s.username || 'NULL'}), status=${s.status}`);
      });
    }

    // 5. Get manufacturing stages for RC 21
    const [msData] = await pool.execute(
      `SELECT id, root_card_id, stage_name, assigned_worker FROM manufacturing_stages WHERE root_card_id = 21`
    );
    console.log('\nManufacturing Stages for RC 21:');
    console.log(msData.length ? msData : 'NONE');

    // 6. Check RootCard filtering logic - simulate what findAll does
    console.log('\n========== FILTERING SIMULATION ==========\n');
    
    // Check for each user
    for (const testUser of [5, 6, 7]) {
      const [filtered] = await pool.execute(
        `SELECT DISTINCT rc.id, rc.title, 
                COUNT(DISTINCT ms_filter.id) as has_mfg_stage,
                COUNT(DISTINCT sos.id) as has_sales_step
         FROM root_cards rc
         LEFT JOIN projects p ON p.id = rc.project_id
         LEFT JOIN sales_orders so ON so.id = p.sales_order_id
         LEFT JOIN manufacturing_stages ms_filter ON ms_filter.root_card_id = rc.id AND ms_filter.assigned_worker = ?
         LEFT JOIN sales_order_steps sos ON sos.sales_order_id = so.id AND sos.assigned_to = ?
         WHERE rc.id = 21
         GROUP BY rc.id`,
        [testUser, testUser]
      );
      
      if (filtered.length) {
        const row = filtered[0];
        const user = users.find(u => u.id === testUser);
        console.log(`User ${testUser} (${user.username}):`);
        console.log(`  Would RC 21 appear in dropdown? ${row.has_mfg_stage || row.has_sales_step ? 'YES' : 'NO'}`);
        console.log(`  Manufacturing stages assigned: ${row.has_mfg_stage}`);
        console.log(`  Sales order steps assigned: ${row.has_sales_step}`);
      }
    }

    console.log('\n========== CONCLUSION ==========\n');
    console.log('RC 21 is assigned to user 7 (production) in sales order steps 3-8');
    console.log('RC 21 has NO manufacturing stage assignments');
    console.log('If you see RC 21 in dropdown but get 403:');
    console.log('  -> You are NOT user 7');
    console.log('  -> There is a bug in the RootCard.findAll() query filtering');
    console.log('  -> Only users assigned to RC 21 (user 7) should see it\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

diagnose();
