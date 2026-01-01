require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function testDesignEngineerFlow() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔍 Testing Design Engineer Flow (Database)\n');
    console.log('='.repeat(60));

    console.log('\n1️⃣  Checking Design Engineer Role...');
    const [roles] = await connection.execute(
      "SELECT id, name FROM roles WHERE LOWER(name) LIKE '%design%engineer%' OR LOWER(name) = 'design_engineer'"
    );
    
    if (roles.length === 0) {
      console.log('   ❌ Design Engineer role NOT FOUND');
      console.log('   Available roles:');
      const [allRoles] = await connection.execute('SELECT id, name FROM roles');
      allRoles.forEach(r => console.log(`      - ${r.name} (ID: ${r.id})`));
    } else {
      const roleId = roles[0].id;
      console.log(`   ✅ Design Engineer Role Found: ID ${roleId}`);
      console.log(`      Name: ${roles[0].name}`);

      console.log('\n2️⃣  Checking Department Tasks for Design Engineer...');
      const [tasks] = await connection.execute(`
        SELECT dt.id, dt.task_title, dt.status, dt.priority, dt.role_id
        FROM department_tasks dt
        WHERE dt.role_id = ?
        LIMIT 10
      `, [roleId]);

      console.log(`   ✅ Found ${tasks.length} department tasks`);
      
      if (tasks.length > 0) {
        console.log('\n   📋 Task Breakdown:');
        const statusCounts = {};
        const priorityCounts = {};
        
        tasks.forEach(t => {
          statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
          priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
        });

        console.log('      By Status:');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`        - ${status}: ${count}`);
        });

        console.log('      By Priority:');
        Object.entries(priorityCounts).forEach(([priority, count]) => {
          console.log(`        - ${priority}: ${count}`);
        });

        console.log('\n      Sample Task:');
        const firstTask = tasks[0];
        console.log(`        - ID: ${firstTask.id}`);
        console.log(`        - Title: ${firstTask.task_title}`);
        console.log(`        - Status: ${firstTask.status}`);
        console.log(`        - Priority: ${firstTask.priority}`);
      } else {
        console.log('   ⚠️  No tasks found for Design Engineer role');
      }

      console.log('\n3️⃣  Checking if Root Cards are linked...');
      const [rootCards] = await connection.execute(`
        SELECT COUNT(DISTINCT root_card_id) as count
        FROM department_tasks
        WHERE role_id = ? AND root_card_id IS NOT NULL
      `, [roleId]);

      const linkedCount = rootCards[0].count;
      console.log(`   ✅ ${linkedCount} tasks have linked root cards`);

      console.log('\n4️⃣  Checking if Sales Orders are linked...');
      const [salesOrders] = await connection.execute(`
        SELECT COUNT(DISTINCT sales_order_id) as count
        FROM department_tasks
        WHERE role_id = ? AND sales_order_id IS NOT NULL
      `, [roleId]);

      const soCount = salesOrders[0].count;
      console.log(`   ✅ ${soCount} tasks have linked sales orders`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Design Engineer setup ANALYSIS COMPLETE!\n');

    connection.end();

  } catch (error) {
    console.error('\n❌ Error:\n', error.message);
  }
}

testDesignEngineerFlow();
