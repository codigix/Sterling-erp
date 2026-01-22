const pool = require('./config/database');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function generateWorkflowTasksForRootCard(rootCardId) {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    console.log(`\n🔍 Finding root card: ${rootCardId}...\n`);

    // Get sales order details (as root card primary source)
    const [salesOrders] = await connection.execute(
      'SELECT id, po_number, customer, project_name FROM sales_orders WHERE id = ?',
      [rootCardId]
    );

    if (salesOrders.length === 0) {
      console.error(`❌ Root Card ${rootCardId} not found`);
      process.exit(1);
    }

    const rootCard = salesOrders[0];
    console.log(`✅ Found Root Card:`);
    console.log(`   PO Number: ${rootCard.po_number}`);
    console.log(`   Customer: ${rootCard.customer}`);
    console.log(`   Project: ${rootCard.project_name}`);

    // Check if root card exists for this sales order
    console.log(`\n📋 Checking for existing Root Card...`);
    const [rootCards] = await connection.execute(
      'SELECT id, title, code FROM root_cards WHERE sales_order_id = ? LIMIT 1',
      [rootCardId]
    );

    let actualRootCardId;
    if (rootCards.length > 0) {
      actualRootCardId = rootCards[0].id;
      console.log(`✅ Found existing Root Card:`);
      console.log(`   ID: ${actualRootCardId}`);
      console.log(`   Title: ${rootCards[0].title}`);
      console.log(`   Code: ${rootCards[0].code}`);
    } else {
      console.log(`⏳ No existing Root Card record found in root_cards table. One will be created automatically.`);
    }

    // Make API call to generate workflow tasks
    console.log(`\n🚀 Generating workflow tasks via API...\n`);
    
    const API_HOST = process.env.API_HOST || 'localhost';
    const API_PORT = process.env.PORT || 5000;
    const apiUrl = `http://${API_HOST}:${API_PORT}`;
    const endpoint = `/api/production/root-cards/${rootCardId}/workflow-tasks`;
    
    console.log(`   Endpoint: POST ${apiUrl}${endpoint}`);
    
    // For demonstration, we'll show what would be called
    console.log(`\n📝 To generate tasks, call:`);
    console.log(`\n   curl -X POST ${apiUrl}${endpoint} \\`);
    console.log(`     -H "Authorization: Bearer YOUR_TOKEN" \\`);
    console.log(`     -H "Content-Type: application/json"`);

    console.log(`\n✨ The workflow will:`);
    console.log(`   1. Check if Root Card exists for this ID`);
    console.log(`   2. If not, create one automatically`);
    console.log(`   3. Generate 7 workflow-based design tasks:`);
    console.log(`      - Project Details Input`);
    console.log(`      - Design Document Preparation`);
    console.log(`      - BOM Creation`);
    console.log(`      - Design Review & Approval`);
    console.log(`      - Pending Reviews Follow-up`);
    console.log(`      - Approved Design Documentation`);
    console.log(`      - Technical File Management`);

    console.log(`\n✅ After running, tasks will be visible in:`);
    console.log(`   - Design Engineer Dashboard: /design-engineer/tasks/projects`);
    console.log(`   - Design Engineer Tasks: /design-engineer/tasks/list`);

    console.log(`\n---\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

// Get root card ID from command line arguments
const rootCardIdArg = process.argv[2];

if (!rootCardIdArg) {
  console.log('\n📖 Usage:');
  console.log(`   node generate-workflow-tasks-for-root-card.js <rootCardId>\n`);
  console.log('Example:');
  console.log(`   node generate-workflow-tasks-for-root-card.js 1\n`);
  
  // List available root cards
  (async () => {
    try {
      const connection = await pool.getConnection();
      const [orders] = await connection.execute(
        'SELECT id, po_number, customer FROM sales_orders LIMIT 10'
      );
      connection.release();
      
      if (orders.length > 0) {
        console.log('📋 Available Root Cards:\n');
        orders.forEach(order => {
          console.log(`   ID: ${order.id} | PO: ${order.po_number} | Customer: ${order.customer}`);
        });
      }
      console.log('');
    } catch (err) {
      console.error('Error:', err.message);
    }
    process.exit(1);
  })();
} else {
  generateWorkflowTasksForRootCard(parseInt(rootCardIdArg));
}
