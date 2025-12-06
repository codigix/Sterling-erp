#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║     Sales Order Draft Feature - Setup Helper                   ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const backendPath = path.join(__dirname, 'backend');

// Check if backend directory exists
if (!fs.existsSync(backendPath)) {
  console.error('✗ Error: backend directory not found');
  process.exit(1);
}

// Check required files
const requiredFiles = [
  'models/SalesOrderDraft.js',
  'controllers/sales/draftController.js',
  'routes/sales/salesRoutes.js',
  'createDraftsTable.js'
];

console.log('Checking required files...\n');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(backendPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${file}`);
  } else {
    console.log(`✗ ${file} - NOT FOUND`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n✗ Some required files are missing. Please check the installation.');
  process.exit(1);
}

console.log('\n✓ All required files found!\n');

console.log('Next Steps:');
console.log('───────────────────────────────────────────────────────────────\n');
console.log('1. Create the database table by running ONE of these commands:\n');
console.log('   Option A (Fresh Database):');
console.log('   $ cd backend && npm run init-db\n');
console.log('   Option B (Existing Database):');
console.log('   $ cd backend && node createDraftsTable.js\n');
console.log('2. Restart the backend server:');
console.log('   $ npm run dev\n');
console.log('3. Open Sales Orders form and try saving a draft!\n');

console.log('───────────────────────────────────────────────────────────────');
console.log('📖 For detailed instructions, see: DRAFT_FEATURE_SETUP.md\n');
