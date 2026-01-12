# Root Card Wizard - Data Persistence Fix Guide

## Problem Statement
When filling out the Root Card Wizard (8-step form) and submitting, not all data is being correctly stored in the database.

## Solution Overview
The system saves data through multiple API endpoints, one for each step. This guide helps identify and fix any issues.

---

## Quick Diagnosis

### Step 1: Check if data is being sent to the API
1. Open **Browser DevTools** (F12)
2. Go to **Network** tab
3. Fill out a form step and click **Next**
4. Look for API calls like:
   - `/api/sales/steps/123/client-po`
   - `/api/sales/steps/123/sales-order/sales-product`
   - etc.
5. Check if the calls show status **200** (success) or error codes **400/500**

### Step 2: Verify database tables exist
```bash
node backend/verify-db-tables.js
```

Expected output:
```
✅ Step Root: Table 'sales_orders' exists
✅ Step 1: Table 'client_po_details' exists
✅ Step 2: Table 'sales_order_details' exists
...
```

### Step 3: Check if data was saved to database
```bash
node backend/verify-data-persistence.js <SALES_ORDER_ID>
```

Example:
```bash
node backend/verify-data-persistence.js 5
```

Expected output shows all 8 steps with ✅ marks.

### Step 4: Test API endpoints
```bash
node backend/test-api-endpoints.js <SALES_ORDER_ID>
```

This tests if all endpoints are accessible and returning proper responses.

---

## Common Issues & Fixes

### Issue 1: "Table Does Not Exist"

**Symptom:** Database error when saving data

**Fix:**
```bash
node backend/initDb.js
```

This initializes the database with all required tables.

---

### Issue 2: API Returns 401/403 (Authentication Error)

**Symptom:** Network tab shows 401 responses

**Fix:**
1. Ensure you're logged in
2. Check if authentication token is being sent in headers
3. Verify token is valid and not expired

Check in browser console:
```javascript
// Should return a token
localStorage.getItem('authToken')
```

---

### Issue 3: API Returns 400 (Bad Request)

**Symptom:** Field validation errors

**Possible Causes:**
- Required fields are empty
- Field format is wrong (e.g., date format should be YYYY-MM-DD)
- Field names don't match backend expectations

**Fix:**
1. Check browser console for error message
2. Verify all required fields are filled:
   - Step 1: poNumber, poDate, clientName, clientEmail, clientPhone, projectName, projectCode
   - Step 2: At least email/phone in Sales tab
   - Other steps: Vary by step
3. Check date fields use YYYY-MM-DD format

---

### Issue 4: Data Not Persisting After Refresh

**Symptom:** Can see data during form fill, but it's gone after page refresh

**Possible Causes:**
- API call failed silently
- Data saved to draft but not to final sales order
- API endpoint not implemented

**Fix:**
1. Open browser DevTools Network tab
2. Look for red status codes (4xx, 5xx)
3. Check backend logs:
   ```bash
   # Terminal where backend is running
   # Look for [Error] or [ERROR] messages
   ```
4. Verify the API endpoint exists in `backend/routes/sales/salesOrderStepsRoutes.js`

---

### Issue 5: Root Card Not Created

**Symptom:** Sales order created but no root card in database

**Cause:** Root card should be auto-created when sales order is submitted

**Verification:**
```bash
# Check if root card was created
mysql -u root -p sterling_erp
SELECT * FROM root_cards WHERE sales_order_id = 5;
```

**Fix:**
If root card not found:
1. Check the `salesController.createSalesOrder()` function (backend/controllers/sales/salesController.js:142)
2. Verify RootCard.create() is being called
3. Check for errors in backend logs

---

### Issue 6: Missing Step Data Tables

**Symptom:** Some steps' data tables don't exist

**Fix:**
```bash
# Check which tables are missing
node backend/verify-db-tables.js

# If any are missing, reinitialize database
node backend/initDb.js

# Or run specific migrations
node backend/runMigrations.js
```

---

## Verification Workflow

### For New Sales Order Submission:

1. **Fill Form & Submit**
   - Complete all 8 steps
   - Click "Submit" on final step

2. **Check Frontend**
   ```
   Browser DevTools → Network tab
   Look for successful responses (200 status) for all endpoints
   ```

3. **Check Database**
   ```bash
   node backend/verify-data-persistence.js <SALES_ORDER_ID>
   ```
   Should show all 8 steps with ✅

4. **Verify in Database Directly**
   ```sql
   SELECT * FROM client_po_details WHERE sales_order_id = <ID>;
   SELECT * FROM sales_order_details WHERE sales_order_id = <ID>;
   SELECT * FROM design_engineering_details WHERE sales_order_id = <ID>;
   -- etc. for each step
   ```

---

## Data Flow Mapping

```
Form Fill → Frontend State → API Call → Backend Controller → Model → Database

Step 1:  Form → /sales/steps/{id}/client-po → ClientPOController → ClientPODetail → client_po_details
Step 2a: Form → /sales/steps/{id}/sales-order/sales-product → SalesOrderDetailController → SalesOrderDetail → sales_order_details
Step 2b: Form → /sales/steps/{id}/sales-order/quality-compliance → SalesOrderDetailController → SalesOrderDetail → sales_order_details
Step 2c: Form → /sales/steps/{id}/sales-order/payment-internal → SalesOrderDetailController → SalesOrderDetail → sales_order_details
Step 3:  Form → /sales/steps/{id}/design-engineering → DesignEngineeringController → DesignEngineeringDetail → design_engineering_details
Step 4:  Form → /sales/steps/{id}/material-requirements → MaterialRequirementsController → MaterialRequirementsDetail → material_requirements_details
Step 5:  Form → /sales/steps/{id}/production-plan → ProductionPlanController → ProductionPlanDetail → production_plan_details
Step 6:  Form → /sales/steps/{id}/quality-check → QualityCheckController → QualityCheckDetail → quality_check_details
Step 7:  Form → /sales/steps/{id}/shipment → ShipmentController → ShipmentDetail → shipment_details
Step 8:  Form → /sales/steps/{id}/delivery → DeliveryController → DeliveryDetail → delivery_details
```

---

## Backend Logs

**Location:** Terminal where you ran `npm start` (backend server)

**Look for:**
- `[ClientPOController]` - Step 1 errors
- `[SalesOrderDetailController]` - Step 2 errors
- `[DesignEngineeringController]` - Step 3 errors
- `[MaterialRequirementsController]` - Step 4 errors
- `[ProductionPlanController]` - Step 5 errors
- `[QualityCheckController]` - Step 6 errors
- `[ShipmentController]` - Step 7 errors
- `[DeliveryController]` - Step 8 errors

---

## Database Cleanup (if needed)

**WARNING: This deletes data!**

```bash
# Delete a specific sales order and all its related data
mysql -u root -p sterling_erp

DELETE FROM client_po_details WHERE sales_order_id = 5;
DELETE FROM sales_order_details WHERE sales_order_id = 5;
DELETE FROM design_engineering_details WHERE sales_order_id = 5;
DELETE FROM material_requirements_details WHERE sales_order_id = 5;
DELETE FROM production_plan_details WHERE sales_order_id = 5;
DELETE FROM quality_check_details WHERE sales_order_id = 5;
DELETE FROM shipment_details WHERE sales_order_id = 5;
DELETE FROM delivery_details WHERE sales_order_id = 5;
DELETE FROM root_cards WHERE sales_order_id = 5;
DELETE FROM projects WHERE sales_order_id = 5;
DELETE FROM sales_orders WHERE id = 5;
```

---

## Support Resources

- **Full Documentation:** `DATA_PERSISTENCE_CHECKLIST.md`
- **Database Verification:** `node backend/verify-db-tables.js`
- **Data Persistence Check:** `node backend/verify-data-persistence.js <SALES_ORDER_ID>`
- **API Endpoint Test:** `node backend/test-api-endpoints.js <SALES_ORDER_ID>`

---

**Last Updated:** January 12, 2026
