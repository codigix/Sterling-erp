#!/usr/bin/env python3
"""
Apply multi-tab data persistence fixes to frontend
"""
import re
import sys

def fix_step1_loading():
    """Fix Step 1 data loading in index.jsx"""
    file_path = r'd:\passion\Sterling-erp\frontend\src\components\admin\SalesOrderForm\index.jsx'
    
    old_pattern = r'''      if \(clientPOResponse\?\.data\?\.data\) \{
        const poData = clientPOResponse\.data\.data;
        updateField\('clientEmail', poData\.clientEmail \|\| ''\);
        updateField\('clientPhone', poData\.clientPhone \|\| ''\);
        updateField\('clientAddress', poData\.clientAddress \|\| ''\);
      \}'''
    
    new_code = '''      if (clientPOResponse?.data?.data) {
        const poData = clientPOResponse.data.data;
        updateField('poNumber', poData.poNumber || '');
        updateField('poDate', poData.poDate || '');
        updateField('clientName', poData.clientName || '');
        updateField('clientEmail', poData.clientEmail || '');
        updateField('clientPhone', poData.clientPhone || '');
        updateField('projectName', poData.projectName || '');
        updateField('projectCode', poData.projectCode || '');
        updateField('billingAddress', poData.billingAddress || '');
        updateField('shippingAddress', poData.shippingAddress || '');
        updateField('clientAddress', poData.clientAddress || '');
        if (poData.projectRequirements) {
          updateField('projectRequirements', poData.projectRequirements);
        }
      }'''
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Try regex replacement first
        new_content = re.sub(old_pattern, new_code, content, flags=re.MULTILINE)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print("✅ Step 1 (Client PO) data loading fixed")
            return True
        else:
            # If regex fails, try simple string replacement
            old_code = '''      if (clientPOResponse?.data?.data) {
        const poData = clientPOResponse.data.data;
        updateField('clientEmail', poData.clientEmail || '');
        updateField('clientPhone', poData.clientPhone || '');
        updateField('clientAddress', poData.clientAddress || '');
      }'''
            
            if old_code in content:
                new_content = content.replace(old_code, new_code)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print("✅ Step 1 (Client PO) data loading fixed")
                return True
            else:
                print("⚠️ Could not find exact pattern in file")
                return False
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def fix_step2_loading():
    """Fix Step 2 data loading in index.jsx"""
    file_path = r'd:\passion\Sterling-erp\frontend\src\components\admin\SalesOrderForm\index.jsx'
    
    old_code = '''      if (designResponse?.data?.data) {
        const designData = designResponse.data.data;
        updateField('designEngineering', designData);
      }

      if (materialsResponse?.data?.data) {
        const materialsData = materialsResponse.data.data;
        updateField('materialProcurement', materialsData);
      }'''
    
    new_code = '''      // Step 2 data is handled later in the flow
      // if (designResponse?.data?.data) {
      //   const designData = designResponse.data.data;
      //   updateField('designEngineering', designData);
      // }

      if (materialsResponse?.data?.data) {
        const materialsData = materialsResponse.data.data;
        updateField('materialProcurement', materialsData);
      }'''
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # This is a placeholder - Step 2 data structure needs investigation
        print("⚠️ Step 2 data loading - needs manual review")
        return False
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    print("Applying multi-tab data persistence fixes...\n")
    result1 = fix_step1_loading()
    print()
    fix_step2_loading()
    sys.exit(0 if result1 else 1)
