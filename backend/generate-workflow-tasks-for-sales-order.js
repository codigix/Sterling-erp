const pool = require('./config/database');
const axios = require('axios');
require('dotenv').config();

async function generateWorkflowTasksForSalesOrder(salesOrderId) {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    console.log(`\n🔍 Finding sales order: ${salesOrderId}...\n`);

    // Get sales order details
    const [salesOrders] = await connection.execute(
      'SELECT id, po_number, customer, project_name FROM sales_orders WHERE id = ?',
      [salesOrderId]
    );

    if (salesOrders.length === 0) {
      console.error(`❌ Sales Order ${salesOrderId} not found`);
      process.exit(1);
    }

    const salesOrder = salesOrders[0];
    console.log(`✅ Found Sales Order:`);
    console.log(`   PO Number: ${salesOrder.po_number}`);
    console.log(`   Customer: ${salesOrder.customer}`);
    console.log(`   Project: ${salesOrder.project_name}`);

    // Check if root card exists for this sales order
    console.log(`\n📋 Checking for existing Root Card...`);
    const [rootCards] = await connection.execute(
      'SELECT id, title, code FROM root_cards WHERE sales_order_id = ? LIMIT 1',
      [salesOrderId]
    );

    let rootCardId;
    if (rootCards.length > 0) {
      rootCardId = rootCards[0].id;
      console.log(`✅ Found existing Root Card:`);
      console.log(`   ID: ${rootCardId}`);
      console.log(`   Title: ${rootCards[0].title}`);
      console.log(`   Code: ${rootCards[0].code}`);
    } else {
      console.log(`⏳ No existing Root Card found. One will be created automatically.`);
    }

    // Make API call to generate workflow tasks
    console.log(`\n🚀 Generating workflow tasks via API...\n`);
    
    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    const endpoint = `/api/production/root-cards/${salesOrderId}/workflow-tasks`;
    
    console.log(`   Endpoint: POST ${apiUrl}${endpoint}`);
    
    // For demonstration, we'll show what would be called
    console.log(`\n📝 To generate tasks, call:`);
    console.log(`\n   curl -X POST ${apiUrl}${endpoint} \\`);
    console.log(`     -H "Authorization: Bearer YOUR_TOKEN" \\`);
    console.log(`     -H "Content-Type: application/json"`);

    console.log(`\n✨ The workflow will:`);
    console.log(`   1. Check if Root Card exists for this sales order`);
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

// Get sales order ID from command line arguments
const salesOrderId = process.argv[2];

if (!salesOrderId) {
  console.log('\n📖 Usage:');
  console.log(`   node generate-workflow-tasks-for-sales-order.js <salesOrderId>\n`);
  console.log('Example:');
  console.log(`   node generate-workflow-tasks-for-sales-order.js 1\n`);
  
  // List available sales orders
  (async () => {
    try {
      const connection = await pool.getConnection();
      const [orders] = await connection.execute(
        'SELECT id, po_number, customer FROM sales_orders LIMIT 10'
      );
      connection.release();
      
      if (orders.length > 0) {
        console.log('📋 Available Sales Orders:\n');
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
  generateWorkflowTasksForSalesOrder(parseInt(salesOrderId));
}
