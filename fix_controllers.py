import re

def fix_get_endpoints():
    files_to_update = {
        'd:/passion/Sterling-erp/backend/controllers/sales/clientPOController.js': [
            ('getClientPO', 'Client PO', 'poDetal'),
            ('getClientInfo', 'Client information', 'clientInfo'),
            ('getProjectDetails', 'Project details', 'projectDetails'),
            ('getProjectRequirements', 'Project requirements', 'projectRequirements'),
        ],
        'd:/passion/Sterling-erp/backend/controllers/sales/designEngineeringController.js': [
            ('getDesignEngineering', 'Design Engineering', 'design'),
        ],
        'd:/passion/Sterling-erp/backend/controllers/sales/materialRequirementsController.js': [
            ('getMaterialRequirements', 'Material Requirements', 'materials'),
        ],
        'd:/passion/Sterling-erp/backend/controllers/sales/productionPlanController.js': [
            ('getProductionPlan', 'Production Plan', 'plan'),
        ],
        'd:/passion/Sterling-erp/backend/controllers/sales/qualityCheckController.js': [
            ('getQualityCheck', 'Quality Check', 'qc'),
        ],
        'd:/passion/Sterling-erp/backend/controllers/sales/shipmentController.js': [
            ('getShipment', 'Shipment', 'shipment'),
        ],
        'd:/passion/Sterling-erp/backend/controllers/sales/deliveryController.js': [
            ('getDelivery', 'Delivery', 'delivery'),
        ],
    }

    for file_path, methods in files_to_update.items():
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            for method_name, data_name, var_name in methods:
                old_pattern = rf'if \(\!{var_name}\) \{{\s+return res\.status\(404\)\.json\(formatErrorResponse\(\'.*?\'\)\);\s+\}}\s+(res\.json\(formatSuccessResponse\({var_name}'
                new_replacement = rf'res.json(formatSuccessResponse({var_name} || null'
                content = re.sub(old_pattern, new_replacement, content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✓ Updated {file_path}')
        except FileNotFoundError:
            print(f'✗ File not found: {file_path}')
        except Exception as e:
            print(f'✗ Error updating {file_path}: {e}')

if __name__ == '__main__':
    fix_get_endpoints()
