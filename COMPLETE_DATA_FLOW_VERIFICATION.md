# Complete Root Card Wizard Data Flow Verification

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND: Root Card Wizard (8 Steps)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Step 1         Step 2a       Step 2b          Step 2c       Step 3          │
│  ClientPO   Sales&Product  Quality&Compliance  Payment   Design Engineering  │
│                                                                               │
│  Step 4         Step 5         Step 6           Step 7       Step 8          │
│  Materials  Production Plan   Quality Check    Shipment     Delivery         │
│                                                                               │
└──────────────┬──────────────────────────────────────────────────────────────┘
               │
               ├─► Form Data Validation
               │   (validateStep1, validateStep2, etc.)
               │
               └──► stepDataHandler.js
                    - buildStepPayload()
                    - getStepEndpoint()
                    - saveStepDataToAPI()
                    - saveAllStepsToSalesOrder()
                    
                    
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API LAYER: HTTP Requests                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ POST /sales/steps/{id}/client-po                                            │
│ POST /sales/steps/{id}/sales-order/sales-product                            │
│ POST /sales/steps/{id}/sales-order/quality-compliance                       │
│ POST /sales/steps/{id}/sales-order/payment-internal                         │
│ POST /sales/steps/{id}/design-engineering                                   │
│ POST /sales/steps/{id}/material-requirements                                │
│ POST /sales/steps/{id}/production-plan                                      │
│ POST /sales/steps/{id}/quality-check                                        │
│ POST /sales/steps/{id}/shipment                                             │
│ POST /sales/steps/{id}/delivery                                             │
│                                                                               │
└──────────────┬──────────────────────────────────────────────────────────────┘
               │
               └──► Routes: backend/routes/sales/salesOrderStepsRoutes.js
                    - Validates auth
                    - Extracts salesOrderId from params
                    - Routes to appropriate controller
                    
                    
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CONTROLLERS: Data Processing                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ ClientPOController.createOrUpdate()                                         │
│ ↓ Validates data using validateClientPO()                                   │
│ ↓ Calls ClientPODetail.create/update()                                      │
│ ↓ Returns response to frontend                                              │
│                                                                               │
│ SalesOrderDetailController.createOrUpdateSalesAndProduct()                  │
│ ↓ Validates data using validateSalesOrderDetail()                           │
│ ↓ Calls SalesOrderDetail.create/update()                                    │
│ ↓ Returns response to frontend                                              │
│                                                                               │
│ [Similar pattern for all other steps...]                                    │
│                                                                               │
└──────────────┬──────────────────────────────────────────────────────────────┘
               │
               └──► Models: Data Persistence
                    
                    
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MODELS: Database Operations                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ ClientPODetail.create(data)                                                 │
│ ├─ INSERT INTO client_po_details VALUES (...)                               │
│ └─ Returns insertId                                                          │
│                                                                               │
│ ClientPODetail.update(salesOrderId, data)                                   │
│ ├─ UPDATE client_po_details SET ... WHERE sales_order_id = ?                │
│ └─ No return (void)                                                          │
│                                                                               │
│ SalesOrderDetail.create(data)                                               │
│ ├─ INSERT INTO sales_order_details VALUES (...)                             │
│ └─ Returns insertId                                                          │
│                                                                               │
│ [Similar pattern for all other steps...]                                    │
│                                                                               │
└──────────────┬──────────────────────────────────────────────────────────────┘
               │
               └──► MySQL Database: sterling_erp
                    
                    
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DATABASE: Data Storage                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ Root Resources (Auto-Created)                                          │  │
│ ├────────────────────────────────────────────────────────────────────────┤  │
│ │ • sales_orders (1 row)                                                 │  │
│ │ • projects (1 row)                                                     │  │
│ │ • root_cards (1 row)                                                   │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌────────────────────────────────────────────────────────────────────────┐  │
│ │ Step-Specific Tables (User-Filled)                                     │  │
│ ├────────────────────────────────────────────────────────────────────────┤  │
│ │ Step 1:  client_po_details (1 row) - PO and client information        │  │
│ │ Step 2:  sales_order_details (1 row) - Sales order information        │  │
│ │ Step 3:  design_engineering_details (1 row) - Design information      │  │
│ │ Step 4:  material_requirements_details (1 row) - Materials list       │  │
│ │ Step 5:  production_plan_details (1 row) - Production timeline        │  │
│ │ Step 6:  quality_check_details (1 row) - Quality information          │  │
│ │ Step 7:  shipment_details (1 row) - Shipment information              │  │
│ │ Step 8:  delivery_details (1 row) - Delivery information              │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Data Verification Checklist

### Pre-Submission Checks

- [ ] Browser JavaScript Console - No errors
- [ ] All required fields filled (marked with * or red)
- [ ] Date fields in correct format (YYYY-MM-DD)
- [ ] Email fields contain valid email
- [ ] Phone numbers are numeric (10 digits)

### During Submission

- [ ] Browser DevTools Network tab shows API calls
- [ ] All 10 API endpoints return 200 status
- [ ] No 400 (Bad Request) errors
- [ ] No 401/403 (Authentication) errors
- [ ] No 500 (Server) errors

### After Submission

- [ ] Frontend shows success message
- [ ] Page redirects to sales orders list
- [ ] No error banners visible

### Database Verification (Command Line)

```bash
# 1. Check all tables exist
node backend/verify-db-tables.js

# Expected output: All tables marked with ✅

# 2. Check data was saved for sales order (e.g., ID = 5)
node backend/validate-step-fields.js 5

# Expected output: 
#   ✅ Step 1: X fields found, 0 missing
#   ✅ Step 2: X fields found, 0 missing
#   ... etc for all steps

# 3. Check specific step only
node backend/validate-step-fields.js 5 1

# Expected output: Only Step 1 validation

# 4. Full system check
node backend/full-system-check.js

# Expected output: All checks passed
```

### Database Direct Query

```sql
-- From MySQL console or GUI
USE sterling_erp;

-- Check main resources
SELECT id, customer, po_number FROM sales_orders WHERE id = 5;
SELECT id, name, code FROM projects WHERE sales_order_id = 5;
SELECT id, title, code FROM root_cards WHERE sales_order_id = 5;

-- Check step data
SELECT * FROM client_po_details WHERE sales_order_id = 5;
SELECT * FROM sales_order_details WHERE sales_order_id = 5;
SELECT * FROM design_engineering_details WHERE sales_order_id = 5;
SELECT * FROM material_requirements_details WHERE sales_order_id = 5;
SELECT * FROM production_plan_details WHERE sales_order_id = 5;
SELECT * FROM quality_check_details WHERE sales_order_id = 5;
SELECT * FROM shipment_details WHERE sales_order_id = 5;
SELECT * FROM delivery_details WHERE sales_order_id = 5;

-- All should return at least 1 row if submitted correctly
```

---

## Step-by-Step Submission Flow

### Step 1: Submit Client PO Form
```
Frontend Form
├─ poNumber ─────────────────────────► POST /sales/steps/5/client-po
├─ poDate ─────────────────────────────► {poNumber, poDate, clientName, ...}
├─ clientName ────────────────────────►
├─ clientEmail ───────────────────────►
├─ clientPhone ───────────────────────►
├─ projectName ───────────────────────►
├─ projectCode ───────────────────────►
├─ projectRequirements ───────────────►
└─ notes ────────────────────────────►
                                       ↓
                          ClientPOController.createOrUpdate()
                                       ↓
                          ClientPODetail.create/update()
                                       ↓
                   INSERT/UPDATE client_po_details
                                       ↓
                         Response: {data: {...}, message: "..."}
                                       ↓
                          Frontend receives response
                          ✅ Display success message
                          ✅ Enable Next button
```

### Step 2: Submit Sales Order (3 Tabs)

**Tab A: Sales & Product**
```
Frontend Form (Tab A)
├─ clientEmail ────────────────────────► POST /sales/steps/5/sales-order/sales-product
├─ clientPhone ────────────────────────► {clientEmail, clientPhone, ...}
├─ estimatedEndDate ───────────────────►
├─ billingAddress ──────────────────────►
├─ shippingAddress ─────────────────────►
└─ productDetails ──────────────────────►
                                       ↓
                      SalesOrderDetailController.createOrUpdateSalesAndProduct()
                                       ↓
                      SalesOrderDetail.updateSalesAndProduct()
                                       ↓
                   UPDATE sales_order_details (product columns)
```

**Tab B: Quality & Compliance**
```
Frontend Form (Tab B)
├─ qualityCompliance ──────────────────► POST /sales/steps/5/sales-order/quality-compliance
├─ warrantySupport ────────────────────► {qualityCompliance, warrantySupport}
└─ ...
                                       ↓
                      SalesOrderDetailController.createOrUpdateQualityAndCompliance()
                                       ↓
                      SalesOrderDetail.updateQualityAndCompliance()
                                       ↓
                   UPDATE sales_order_details (quality columns)
```

**Tab C: Payment & Internal**
```
Frontend Form (Tab C)
├─ paymentTerms ───────────────────────► POST /sales/steps/5/sales-order/payment-internal
├─ projectPriority ────────────────────► {paymentTerms, projectPriority, ...}
├─ totalAmount ────────────────────────►
├─ internalInfo ────────────────────────►
└─ specialInstructions ─────────────────►
                                       ↓
                      SalesOrderDetailController.createOrUpdatePaymentAndInternal()
                                       ↓
                      SalesOrderDetail.updatePaymentAndInternal()
                                       ↓
                   UPDATE sales_order_details (payment columns)
```

### Steps 3-8: Similar Pattern

Each step follows the same flow:
1. Frontend collects form data
2. Builds payload using `buildStepPayload()`
3. Sends to API endpoint
4. Controller validates and saves
5. Model executes INSERT/UPDATE
6. Response returned to frontend
7. Success message shown
8. User can proceed to next step

---

## Data Integrity Checks

### 1. Foreign Key Relationships

```
sales_orders (id=5)
    ↓
projects (sales_order_id=5)
    ├─► root_cards (project_id=?, sales_order_id=5)
    └─► All step tables (sales_order_id=5)
```

**Verification:**
```sql
-- All records should have matching foreign keys
SELECT COUNT(*) FROM projects WHERE sales_order_id = 5;    -- Should be ≥ 1
SELECT COUNT(*) FROM root_cards WHERE sales_order_id = 5;  -- Should be ≥ 1
SELECT COUNT(*) FROM root_cards WHERE project_id IN (
  SELECT id FROM projects WHERE sales_order_id = 5
);                                                           -- Should be ≥ 1
```

### 2. Data Type Validation

| Column | Expected Type | Validation |
|--------|---------------|------------|
| `po_number` | VARCHAR | Not empty, unique |
| `po_date` | DATE | Valid date, YYYY-MM-DD |
| `client_email` | VARCHAR | Valid email format |
| `client_phone` | VARCHAR | Numeric, 10 digits |
| `total_amount` | DECIMAL(12,2) | Numeric, 2 decimals |
| `project_requirements` | JSON | Valid JSON string |
| `product_details` | JSON | Valid JSON string |

### 3. Completeness Check

```sql
-- Count rows per table
SELECT 
  'client_po_details' as table_name, COUNT(*) as rows FROM client_po_details WHERE sales_order_id = 5
UNION ALL
SELECT 'sales_order_details', COUNT(*) FROM sales_order_details WHERE sales_order_id = 5
UNION ALL
SELECT 'design_engineering_details', COUNT(*) FROM design_engineering_details WHERE sales_order_id = 5
UNION ALL
SELECT 'material_requirements_details', COUNT(*) FROM material_requirements_details WHERE sales_order_id = 5
UNION ALL
SELECT 'production_plan_details', COUNT(*) FROM production_plan_details WHERE sales_order_id = 5
UNION ALL
SELECT 'quality_check_details', COUNT(*) FROM quality_check_details WHERE sales_order_id = 5
UNION ALL
SELECT 'shipment_details', COUNT(*) FROM shipment_details WHERE sales_order_id = 5
UNION ALL
SELECT 'delivery_details', COUNT(*) FROM delivery_details WHERE sales_order_id = 5;

-- All should return 1 if all steps were submitted
```

---

## Troubleshooting Guide

### Problem: API Returns 400 Bad Request

**Check:**
1. Are all required fields filled?
2. Are dates in YYYY-MM-DD format?
3. Are JSON fields valid JSON?

**Fix:**
1. Fill all required fields
2. Use browser DevTools → Network tab to see exact error
3. Check `error` field in response for details

### Problem: API Returns 401 Unauthorized

**Check:**
1. Is user logged in?
2. Is auth token valid?

**Fix:**
1. Logout and login again
2. Check `Authorization` header in Network tab
3. Verify token hasn't expired

### Problem: API Returns 500 Server Error

**Check:**
1. Is backend server running?
2. Are there database errors?
3. Is foreign key constraint violated?

**Fix:**
1. Check backend terminal for error logs
2. Verify database tables exist: `node backend/verify-db-tables.js`
3. Check if sales_order_id exists in database

### Problem: Data Not Visible After Refresh

**Check:**
1. Was API response successful (200)?
2. Is data actually in database?

**Fix:**
```bash
# Verify data was saved
node backend/validate-step-fields.js <sales_order_id>

# Check database directly
mysql -u root -p sterling_erp
SELECT * FROM client_po_details WHERE sales_order_id = <id>;
```

---

## Quick Reference Commands

```bash
# Setup & Initialization
npm install                           # Install dependencies
node backend/initDb.js               # Initialize database
npm run setup-demo                   # Create demo users

# Start Application
npm start                            # Backend (from backend dir)
npm run dev                          # Frontend (from frontend dir)

# Verification Tools
node backend/full-system-check.js                          # Check all systems
node backend/verify-db-tables.js                           # Check tables exist
node backend/validate-step-fields.js <salesOrderId>        # Validate all steps
node backend/validate-step-fields.js <salesOrderId> <step> # Validate one step
node backend/test-api-endpoints.js <salesOrderId>          # Test all APIs
node backend/verify-data-persistence.js <salesOrderId>     # Check data saved

# Database Queries
mysql -u root -p sterling_erp
SELECT COUNT(*) FROM sales_orders;
SELECT * FROM sales_orders WHERE id = 5;
```

---

## Expected Results

### After Successful Submission:

✅ **Frontend:**
- Success toast notification
- Redirect to sales orders list
- Order visible in list

✅ **Database:**
- Sales order record created
- Project record created
- Root card record created
- 8 step detail records created
- All fields populated (or NULL for optional fields)
- No constraint violations

✅ **Logs:**
- No errors in backend terminal
- No errors in browser console
- All API calls returned 200

---

## Summary

**Total Database Records Created:** 11 (1 sales order + 1 project + 1 root card + 8 step details)  
**Total Fields Saved:** 150+  
**API Calls Made:** 10 (or 11 counting initial sales order creation)  
**Expected Time to Completion:** 2-5 minutes

If all verification steps pass, your data is correctly stored in the database! 🎉

---

**Last Updated:** January 12, 2026  
**Version:** 1.0 - Complete Flow Verification
