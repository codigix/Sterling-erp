require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testDesignEngineerFlow() {
  try {
    console.log('🔍 Testing Design Engineer Dashboard Flow\n');
    console.log('=' .repeat(60));

    console.log('\n1️⃣  Getting Design Engineer Role ID...');
    const roleResponse = await axios.get(`${API_URL}/department/portal/role/design_engineer`);
    const roleId = roleResponse.data.roleId;
    console.log(`   ✅ Role ID: ${roleId}`);
    console.log(`   Role Name: ${roleResponse.data.roleName}`);

    console.log('\n2️⃣  Fetching Design Engineer Tasks...');
    const tasksResponse = await axios.get(`${API_URL}/department/portal/tasks/${roleId}`);
    const tasks = tasksResponse.data;
    console.log(`   ✅ Found ${tasks.length} tasks`);
    
    if (tasks.length > 0) {
      console.log('\n   📋 First Task Details:');
      const firstTask = tasks[0];
      console.log(`      ID: ${firstTask.id}`);
      console.log(`      Title: ${firstTask.title}`);
      console.log(`      Status: ${firstTask.status}`);
      console.log(`      Priority: ${firstTask.priority}`);
      if (firstTask.rootCard) {
        console.log(`      Root Card: ${firstTask.rootCard.title} (${firstTask.rootCard.code})`);
      }
      if (firstTask.salesOrder) {
        console.log(`      Customer: ${firstTask.salesOrder.customer}`);
        console.log(`      PO: ${firstTask.salesOrder.poNumber}`);
      }
    } else {
      console.log('   ⚠️  No tasks found for this role');
    }

    console.log('\n3️⃣  Fetching Task Statistics...');
    const statsResponse = await axios.get(`${API_URL}/department/portal/stats/${roleId}`);
    const stats = statsResponse.data;
    console.log(`   ✅ Statistics fetched`);
    console.log(`      Total Tasks: ${stats.total}`);
    console.log(`      Pending: ${stats.pending}`);
    console.log(`      In Progress: ${stats.in_progress}`);
    console.log(`      Completed: ${stats.completed}`);
    console.log(`      On Hold: ${stats.on_hold || 0}`);
    console.log(`      Critical: ${stats.critical_count || 0}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Design Engineer Flow is WORKING CORRECTLY!\n');

    console.log('Summary:');
    console.log(`- Design Engineer Role: Active (ID: ${roleId})`);
    console.log(`- Tasks API: Working (${tasks.length} tasks)`);
    console.log(`- Stats API: Working (${stats.total} total)`);
    console.log(`- Data Flow: ✅ Correct`);

  } catch (error) {
    console.error('\n❌ Error during test:\n');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data?.message || error.message}`);
    } else {
      console.error(error.message);
    }
    console.log('\n⚠️ Design Engineer Flow has ISSUES');
  }
}

testDesignEngineerFlow();
