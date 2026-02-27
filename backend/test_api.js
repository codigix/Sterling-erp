const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// We need to mock axios or use a real request if we can.
// Since I'm in the backend environment, I can just call the model directly.
const RootCardInventoryTask = require('./models/RootCardInventoryTask');

(async () => {
    try {
        const mrId = 19;
        const tasks = await RootCardInventoryTask.getTasksByMaterialRequestId(mrId, true);
        console.log(`Tasks for MR ${mrId}:`, tasks.length);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
