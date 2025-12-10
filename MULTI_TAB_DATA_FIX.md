# Multi-Tab Data Persistence Fix

## Problem Identified

When completing a multi-tab step (e.g., Step 1 with 3 tabs), only partial data is saved or loaded back. The issue is in how the frontend loads saved data back into the form.

### Step 1 Issues:
**Location**: `frontend/src/components/admin/SalesOrderForm/index.jsx` lines 92-97

**Current Code (INCOMPLETE)**:
```javascript
if (clientPOResponse?.data?.data) {
  const poData = clientPOResponse.data.data;
  updateField('clientEmail', poData.clientEmail || '');
  updateField('clientPhone', poData.clientPhone || '');
  updateField('clientAddress', poData.clientAddress || '');
}
```

**Problem**: Only loads 3 fields from the API response. Missing:
- Tab 1 (Client Info): poNumber, poDate, clientName
- Tab 2 (Project Details): projectName, projectCode, billingAddress, shippingAddress
- Tab 3 (Project Requirements): projectRequirements object

**API Response Contains**: All fields from client_po_details table including projectRequirements as JSON

---

## Fix Required

### FIX 1: Step 1 Frontend Data Loading (index.jsx lines 92-97)

Replace:
```javascript
if (clientPOResponse?.data?.data) {
  const poData = clientPOResponse.data.data;
  updateField('clientEmail', poData.clientEmail || '');
  updateField('clientPhone', poData.clientPhone || '');
  updateField('clientAddress', poData.clientAddress || '');
}
```

With:
```javascript
if (clientPOResponse?.data?.data) {
  const poData = clientPOResponse.data.data;
  // Tab 1: Client Info
  updateField('poNumber', poData.poNumber || '');
  updateField('poDate', poData.poDate || '');
  updateField('clientName', poData.clientName || '');
  updateField('clientEmail', poData.clientEmail || '');
  updateField('clientPhone', poData.clientPhone || '');
  // Tab 2: Project Details
  updateField('projectName', poData.projectName || '');
  updateField('projectCode', poData.projectCode || '');
  updateField('billingAddress', poData.billingAddress || '');
  updateField('shippingAddress', poData.shippingAddress || '');
  // Tab 3: Project Requirements
  if (poData.projectRequirements) {
    updateField('projectRequirements', poData.projectRequirements);
  }
  // Fallback for clientAddress (legacy field)
  updateField('clientAddress', poData.clientAddress || '');
}
```

---

## Root Cause Analysis

### Data Flow for Step 1:

1. **Frontend sends data to API** ✅
   - `saveAllStepData()` collects all 3 tabs and sends to `/api/sales/steps/{id}/client-po`
   
2. **Backend saves all data** ✅
   - `clientPOController.createOrUpdate()` validates and saves
   - `ClientPODetail.create()` stores all fields in database
   - All 3 tabs' data is persisted

3. **Frontend loads data from API** ❌
   - `loadAllStepData()` calls `/api/sales/steps/{id}/client-po`
   - API returns complete object with all fields
   - But frontend only extracts 3 fields and ignores the rest

4. **User sees incomplete form** ❌
   - Tab 1 shows empty PO Number, Date, Client Name
   - Tab 2 shows empty Project Name, Code, Addresses  
   - Tab 3 shows empty Requirements

---

## Affected Steps

This issue affects ALL multi-tab steps. Similar fixes needed for:

- **Step 2 (Sales Order)**: 3 tabs - need to load all productDetails, qualityCompliance, warrantySupport, paymentTerms, internalInfo
- **Step 3 (Design Engineering)**: 2 sections - need to load all generalDesignInfo, productSpecification, materialsRequired, attachments
- **Step 5 (Production Plan)**: 2 sections - need to load timeline and selectedPhases properly
- **Step 7 (Shipment)**: 2 sections - need to load deliveryTerms and shipment separately
- **Step 8 (Delivery)**: 4 sections - need to load all subsections

---

## Implementation Steps

1. **Step 1 (CRITICAL)**: Fix frontend data loading in index.jsx
2. **Step 2**: Similar fix for sales order data loading
3. **Step 3**: Fix design engineering data loading
4. **Steps 4-8**: Similar fixes for remaining steps

---

## Testing Checklist

After applying fixes:

1. Create sales order and complete Step 1 with all 3 tabs filled
2. Go back to Step 1 - verify all fields from all 3 tabs load correctly
3. Edit Step 1 - verify changes save completely
4. Repeat for Steps 2, 3, 5, 7, 8

---

## Files Affected

- `frontend/src/components/admin/SalesOrderForm/index.jsx` - Data loading functions
- `frontend/src/components/admin/SalesOrderForm/stepDataService.js` - Ensures complete data is sent (already correct)
- Backend models/controllers - Already correctly save all data (no changes needed)

