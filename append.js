const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'backend/controllers/production/productionPlanMethods.txt');
const targetFile = path.join(__dirname, 'backend/controllers/production/productionController.js');

const content = fs.readFileSync(sourceFile, 'utf8');
fs.appendFileSync(targetFile, content);

console.log('Successfully appended production plan methods to controller');
