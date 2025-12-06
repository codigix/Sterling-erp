const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/components/admin/SalesOrderForm.jsx');

try {
  let content = fs.readFileSync(filePath, 'utf8');

  const targetPattern = `<div className="flex gap-1 flex-wrap">
                                          {tracking.status ===
                                            "Not Started" && (`;

  const replacement = `<div className="flex gap-1 flex-wrap">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const detail = productionPhaseDetails[key];
                                              if (detail) {
                                                openProductionPhaseModal(detail.phase, detail.subTask);
                                              }
                                            }}
                                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors"
                                          >
                                            Edit
                                          </button>
                                          {tracking.status ===
                                            "Not Started" && (`;

  if (content.includes(targetPattern)) {
    content = content.replace(targetPattern, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ Edit button successfully added to Actions column');
    process.exit(0);
  } else {
    console.log('✗ Pattern not found in file');
    process.exit(1);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
