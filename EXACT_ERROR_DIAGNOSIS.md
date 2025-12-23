# Sales Order Workflow - Exact Error Diagnosis & Fix

## Problem Summary

When creating a new sales order, the workflow fails with the following errors:

1. **First API call after Step 2**: `POST /api/sales/steps/88/client-po` 
   - **Error**: `{"success": false, "errors": ["Sales Order not found"]}`

2. **Next API calls (Steps 3+)**: `POST /api/sales/steps/88/design-engineering`, etc.
   - **Error**: `{"success": false, "errors": ["At least one document is required"]}`

---

## Root Cause Analysis

### The Core Issue: ID Mismatch & Missing Data Synchronization

**Workflow Timeline:**
```
Step 1 (Client PO)
  ↓
  createDraft() → POST /api/sales/drafts
  → Response: {"id": 87, ...}
  → createdOrderId = 87 ✓
  ↓
Step 2 (Sales Order)
  ↓
  createActualSalesOrder() → POST /api/sales/orders
  → Response: {"order": {id: 88, ...}}
  → createdOrderId = 88 ✓
  ↓
  Move to Step 3 (WITHOUT saving Step 2 data!)
  ↓
Step 3 (Design Engineering)
  ↓
  saveStepData(3) → POST /api/sales/steps/88/design-engineering
  → API checks: SalesOrder.findById(88) → NOT FOUND ❌
```

### Why the Sales Order Isn't Found

1. **Critical Issue**: After Step 2 completes, the code does NOT call `saveStepData(2)` immediately
   - The step 2 API endpoint expects the sale order to exist AND have associated step data
   - Since step 2 data is never saved in the proper workflow, the step tables are inconsistent

2. **Frontend Bug**: In `index.jsx`, the `handleNext()` function:
   ```javascript
   else if (currentStep === 2) {
     await createActualSalesOrder();  // Creates sales order
     // Returns WITHOUT saving Step 2 data to database!
   } else {
     await saveStepData(currentStep);  // Step 2 data save never happens
   }
   ```

3. **Backend Validation**: Controllers like `clientPOController` and `designEngineeringController` verify that:
   ```javascript
   const salesOrder = await SalesOrder.findById(salesOrderId);
   if (!salesOrder) {
     return res.status(404).json(formatErrorResponse('Sales Order not found'));
   }
   ```

4. **Design Engineering Validation Error**: The `validateDesignEngineering` function requires:
   ```javascript
   if (!data.documents || data.documents.length === 0) {
     errors.push('At least one document is required');
   }
   ```
   - The frontend wasn't properly formatting the documents array when sending

---

## Database Issue Found

### Missing Tables Error

When you tried Step 3, you got:
```
Table 'sterling_erp.sales_order_steps' doesn't exist
```

**Root Cause**: The database migration script was not creating all the necessary step detail tables. The models had the `createTable()` methods defined, but they were never executed during database setup.

**Tables Missing**:
- `sales_order_steps` - Main step tracking table
- `client_po_details` - Client PO information storage
- `sales_order_details` - Sales Order Step 2 data storage
- `design_engineering_details` - Design engineering data storage
- `material_requirements_details` - Material procurement data storage
- `production_plan_details` - Production plan data storage
- `quality_check_details` - Quality check data storage
- `shipment_details` - Shipment data storage
- `delivery_details` - Delivery data storage

---

## Issues Fixed

### 1. **Frontend: Missing Step 2 Data Save** 
   - **File**: `frontend/src/components/admin/SalesOrderForm/index.jsx`
   - **Change**: Modified `createActualSalesOrder()` to call `saveStepData(2)` immediately after creating the sales order
   - **Why**: Ensures Root Card Details
 (email, phone, addresses, etc.) are persisted before moving to Step 3

### 2. **Frontend: Wrong API Endpoint for Step 2**
   - **File**: `frontend/src/components/admin/SalesOrderForm/index.jsx`
   - **Change**: Changed endpoint from `/api/sales/steps/${id}/client-po` to `/api/sales/steps/${id}/sales-order`
   - **Why**: Step 2 data should be saved as "sales-order" details, not "client-po"

### 3. **Frontend: Incomplete Step 2 Data Structure**
   - **File**: `frontend/src/components/admin/SalesOrderForm/index.jsx`
   - **Change**: Created proper `stepData` object with all required Step 2 fields:
     ```javascript
     {
       clientEmail, clientPhone, billingAddress, shippingAddress,
       productDetails, pricingDetails, deliveryTerms,
       qualityCompliance, warrantySupport, internalInfo
     }
     ```
   - **Why**: Ensures all necessary data is saved to the database

### 4. **Frontend: Improved Document Handling for Step 3**
   - **File**: `frontend/src/components/admin/SalesOrderForm/index.jsx`
   - **Change**: Properly formatted documents array with correct structure:
     ```javascript
     {
       type: 'Drawings' | 'PD',
       filePath: filename,
       fileName: filename
     }
     ```
   - **Why**: Meets backend validation requirements for design engineering

### 5. **Backend: Added Sales Order Validation**
   - **File**: `backend/controllers/sales/designEngineeringController.js`
   - **Change**: Added check to ensure sales order exists before processing:
     ```javascript
     const salesOrder = await SalesOrder.findById(salesOrderId);
     if (!salesOrder) {
       return res.status(404).json(formatErrorResponse('Sales Order not found'));
     }
     ```
   - **Why**: Provides clearer error messages when sales order doesn't exist

### 6. **Frontend: Better Error Handling**
   - **File**: `frontend/src/components/admin/SalesOrderForm/index.jsx`
   - **Change**: Added error propagation instead of silently failing
   - **Why**: Users can see what went wrong and retry

### 7. **Database: Created Missing Tables**
   - **File**: `backend/runMigrations.js`
   - **Change**: Added 9 new table migrations for:
     - `sales_order_steps` - Step tracking and management
     - `client_po_details` - PO information storage
     - `sales_order_details` - Root Card Details
 (Step 2)
     - `design_engineering_details` - Design documents storage
     - `material_requirements_details` - Material tracking
     - `production_plan_details` - Production planning
     - `quality_check_details` - Quality assurance data
     - `shipment_details` - Shipment information
     - `delivery_details` - Final delivery tracking
   - **Why**: These tables are required by all step controllers to persist data
   - **Status**: ✅ All tables created successfully when migrations ran

---

## New Correct Workflow

After fixes, the flow is now:

```
Step 1 (Client PO)
  ↓
  createDraft()
  → Save draftId = 87
  ↓
Step 2 (Sales Order)
  ↓
  createActualSalesOrder()
  → Create order (ID = 88)
  → Immediately call saveStepData(2)
  → Save Step 2 details to sales_order_details table ✓
  ↓
Step 3 (Design Engineering)
  ↓
  saveStepData(3)
  → POST /api/sales/steps/88/design-engineering
  → SalesOrder.findById(88) returns ✓
  → Validate documents ✓
  ↓
Steps 4-8: Continue workflow ✓
```

---

## Testing the Fix

To verify the fixes work:

1. Create new sales order
2. Fill Step 1 (Client PO) completely
3. Click "Next" → Should see "Draft created successfully"
4. Fill Step 2 (Sales Order) completely with:
   - Client Email ✓
   - Client Phone ✓
   - Billing Address ✓
   - Shipping Address ✓
   - Product Details ✓
5. Click "Next" → Should see "Sales Order created and saved successfully"
6. Fill Step 3 (Design Engineering) and upload documents
7. Click "Next" → Should proceed without "Sales Order not found" error

---

## Files Modified

1. **Frontend**:
   - `/frontend/src/components/admin/SalesOrderForm/index.jsx`
     - `createActualSalesOrder()` - Added immediate `saveStepData(2)` call
     - `saveStepData()` - Fixed endpoint and data structure for Step 2
     - `handleNext()` - Better error handling

2. **Backend**:
   - `/backend/controllers/sales/designEngineeringController.js`
     - Added sales order existence check for better error messages
   
   - `/backend/runMigrations.js`
     - Added 9 new table creation migrations

---

## Implementation Summary

### What Was Wrong

1. **Frontend Logic**: Step 2 created the sales order but never saved the step data
2. **API Endpoints**: Wrong endpoint was used for Step 2 data (`/client-po` instead of `/sales-order`)
3. **Database**: 9 essential tables were not created, causing "table doesn't exist" errors
4. **Data Format**: Documents and step data weren't properly formatted for the API

### What Was Fixed

1. ✅ Step 2 data now saves immediately after sales order creation
2. ✅ Correct API endpoints are used for each step
3. ✅ All required database tables are created via migrations
4. ✅ Proper error handling and validation at each step
5. ✅ Sales order existence check before processing step data

---

## How to Verify the Fix

1. **Restart backend** (tables are already created):
   ```bash
   cd backend
   npm start
   ```

2. **Test the workflow**:
   - Create new sales order
   - Fill Step 1 (Client PO) → Click Next
   - Fill Step 2 (Sales Order) → Click Next
   - Fill Step 3+ (Design Engineering, etc.) → Should work without errors

3. **Expected Results**:
   - No "Sales Order not found" errors
   - No "Table doesn't exist" errors
   - Data properly persisted at each step
   - All 8 steps complete successfully

---

## Key Takeaway

The workflow was failing due to **three interconnected issues**:
1. **Frontend**: Not saving step data in the right place at the right time
2. **Backend**: Wrong endpoints and missing validation
3. **Database**: Missing tables that were never created

All three have been fixed. The system should now handle sales orders from creation through completion smoothly.
