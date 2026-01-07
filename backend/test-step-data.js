const SalesOrderStep = require('./models/SalesOrderStep');

(async () => {
  try {
    const steps = await SalesOrderStep.findBySalesOrderId(5);
    console.log('\n===== SALES ORDER STEP DATA FOR SO 5 =====\n');
    console.log('Total Steps:', steps.length);
    console.log('\nStep Details:');
    steps.forEach(step => {
      console.log(`\nStep ${step.stepId}:`);
      console.log(`  id: ${step.id}`);
      console.log(`  assignedTo: ${step.assignedTo}`);
      console.log(`  assignedTo type: ${typeof step.assignedTo}`);
      console.log(`  assignedTo === null: ${step.assignedTo === null}`);
      console.log(`  assignedTo === undefined: ${step.assignedTo === undefined}`);
      console.log(`  !step.assignedTo: ${!step.assignedTo}`);
      if (step.assignedTo) {
        const parsed = parseInt(step.assignedTo);
        console.log(`  parseInt(assignedTo): ${parsed}`);
        console.log(`  !isNaN(parsed): ${!isNaN(parsed)}`);
        console.log(`  parsed === 7: ${parsed === 7}`);
      }
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
