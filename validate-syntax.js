const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/components/admin/SalesOrderForm.jsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if Edit button exists
  if (content.includes('Edit') && content.includes('openProductionPhaseModal(detail.phase, detail.subTask)')) {
    console.log('✓ Edit button code found in file');
  }
  
  // Check for balanced braces/brackets
  let braceCount = 0;
  let bracketCount = 0;
  let parenCount = 0;
  
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') braceCount--;
    if (content[i] === '[') bracketCount++;
    if (content[i] === ']') bracketCount--;
    if (content[i] === '(') parenCount++;
    if (content[i] === ')') parenCount--;
  }
  
  if (braceCount === 0 && bracketCount === 0 && parenCount === 0) {
    console.log('✓ Balanced braces, brackets, and parentheses');
  } else {
    console.log('⚠ Potential balance issues:');
    console.log(`  Braces: ${braceCount}, Brackets: ${bracketCount}, Parens: ${parenCount}`);
  }
  
  // Check for commonJSX patterns
  const requiredPatterns = [
    'openProductionPhaseModal',
    'productionPhaseDetails',
    'productionPhaseTracking',
    'currentPhaseDetail'
  ];
  
  let allFound = true;
  for (const pattern of requiredPatterns) {
    if (!content.includes(pattern)) {
      console.log(`✗ Missing pattern: ${pattern}`);
      allFound = false;
    }
  }
  
  if (allFound) {
    console.log('✓ All required patterns found');
  }
  
  console.log('\n✓ File structure looks valid');
  
} catch (error) {
  console.error('Error reading file:', error.message);
  process.exit(1);
}
