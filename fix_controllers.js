const fs = require('fs');
const path = require('path');

const filesToUpdate = {
  'backend/controllers/sales/clientPOController.js': [
    { method: 'getClientPO', dataName: 'Client PO', varName: 'poDetal' },
    { method: 'getClientInfo', dataName: 'Client information', varName: 'clientInfo' },
    { method: 'getProjectDetails', dataName: 'Project details', varName: 'projectDetails' },
    { method: 'getProjectRequirements', dataName: 'Project requirements', varName: 'projectRequirements' },
  ],
  'backend/controllers/sales/designEngineeringController.js': [
    { method: 'getDesignEngineering', dataName: 'Design Engineering', varName: 'design' },
  ],
  'backend/controllers/sales/materialRequirementsController.js': [
    { method: 'getMaterialRequirements', dataName: 'Material Requirements', varName: 'materials' },
  ],
  'backend/controllers/sales/productionPlanController.js': [
    { method: 'getProductionPlan', dataName: 'Production Plan', varName: 'plan' },
  ],
  'backend/controllers/sales/qualityCheckController.js': [
    { method: 'getQualityCheck', dataName: 'Quality Check', varName: 'qc' },
  ],
  'backend/controllers/sales/shipmentController.js': [
    { method: 'getShipment', dataName: 'Shipment', varName: 'shipment' },
  ],
  'backend/controllers/sales/deliveryController.js': [
    { method: 'getDelivery', dataName: 'Delivery', varName: 'delivery' },
  ],
};

Object.entries(filesToUpdate).forEach(([filePath, methods]) => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`✗ File not found: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  methods.forEach(({ method, dataName, varName }) => {
    const pattern = new RegExp(
      `if \\(!${varName}\\) \\{[\\s\\S]*?return res\\.status\\(404\\)\\.json\\(formatErrorResponse\\('[^']*'\\)\\);[\\s\\S]*?\\}[\\s\\S]*?(res\\.json\\(formatSuccessResponse\\(${varName})`,
      'g'
    );
    
    content = content.replace(pattern, `$1 || null`);
  });

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✓ Updated ${filePath}`);
});

console.log('\n✓ All controllers fixed!');
