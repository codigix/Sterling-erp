# Sales Order Draft Feature - Setup Guide

## Overview
This document explains how to set up the **Save as Draft** feature for Sales Orders. The feature allows users to save their form progress at each step and resume later.

## What Was Implemented

### Frontend (Already Done)
✓ **SalesOrderForm.jsx** - Enhanced with auto-save, manual save, and draft loading
✓ Draft status indicators in header
✓ Draft detection dialog on form open
✓ Auto-save every 30 seconds
✓ Manual "Save Draft" button on steps 2-5
✓ Draft cleanup after successful submission

### Backend (New - Needs Setup)

#### 1. **Models**
- `backend/models/SalesOrderDraft.js` - Database model with CRUD operations

#### 2. **Controllers**
- `backend/controllers/sales/draftController.js` - API endpoint handlers

#### 3. **Routes**
- Updated `backend/routes/sales/salesRoutes.js` - Draft API routes added

#### 4. **Database**
- Table: `sales_order_drafts` - Stores draft data
- Migration: `backend/migrations/003_create_sales_order_drafts.js`
- Init script: `backend/createDraftsTable.js`

## Setup Instructions

### Step 1: Create the Database Table

**Option A: Fresh Database Installation**
```bash
cd backend
npm run init-db
```
This will create all tables including `sales_order_drafts`.

**Option B: Add Table to Existing Database**
```bash
cd backend
node createDraftsTable.js
```

### Step 2: Verify Backend Routes

Check that these routes are registered in `backend/routes/sales/salesRoutes.js`:
```javascript
router.get('/drafts/latest', draftController.getLatestDraft);
router.get('/drafts/:id', draftController.getDraftById);
router.post('/drafts', draftController.createDraft);
router.put('/drafts/:id', draftController.updateDraft);
router.delete('/drafts/:id', draftController.deleteDraft);
```

### Step 3: Verify API Endpoints

The following endpoints should now be available:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/sales/drafts/latest` | Get latest draft for current user |
| GET | `/api/sales/drafts/{id}` | Get specific draft by ID |
| POST | `/api/sales/drafts` | Create new draft |
| PUT | `/api/sales/drafts/{id}` | Update existing draft |
| DELETE | `/api/sales/drafts/{id}` | Delete draft |

All endpoints require authentication (Bearer token).

### Step 4: Test the Feature

1. **Open the form** → Should check for existing draft
2. **Fill details** → Auto-save should trigger every 30 seconds
3. **Click Next** → Draft saves before moving to next step
4. **Click "Save Draft"** → Manual save with visual feedback
5. **Close and reopen** → Should show draft recovery dialog
6. **Submit order** → Draft should auto-delete

## API Request/Response Examples

### Create Draft (POST)
```json
POST /api/sales/drafts

Request Body:
{
  "formData": {
    "poNumber": "PO-2024-001",
    "clientName": "ACME Corp",
    "projectName": "Project X",
    ...all form fields...
  },
  "currentStep": 2,
  "poDocuments": [
    { "name": "po.pdf" },
    { "name": "spec.pdf" }
  ]
}

Response:
{
  "id": 123,
  "message": "Draft created successfully"
}
```

### Update Draft (PUT)
```json
PUT /api/sales/drafts/123

Request Body:
{
  "formData": {...updated form data...},
  "currentStep": 3,
  "poDocuments": [...]
}

Response:
{
  "message": "Draft updated successfully"
}
```

### Get Latest Draft (GET)
```json
GET /api/sales/drafts/latest

Response:
{
  "draft": {
    "id": 123,
    "user_id": 1,
    "formData": {...},
    "currentStep": 2,
    "poDocuments": [...],
    "lastSaved": "2024-12-02T10:30:00Z",
    "createdAt": "2024-12-02T09:15:00Z",
    "updatedAt": "2024-12-02T10:30:00Z"
  }
}
```

## Database Schema

```sql
CREATE TABLE sales_order_drafts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  form_data LONGTEXT NOT NULL,
  current_step INT DEFAULT 1,
  po_documents LONGTEXT,
  last_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_updated (user_id, updated_at)
);
```

## Files Created/Modified

### New Files
- ✓ `backend/models/SalesOrderDraft.js` - Model class
- ✓ `backend/controllers/sales/draftController.js` - Controller
- ✓ `backend/migrations/003_create_sales_order_drafts.js` - Migration
- ✓ `backend/createDraftsTable.js` - Table creation script

### Modified Files
- ✓ `backend/routes/sales/salesRoutes.js` - Added draft routes
- ✓ `backend/initDb.js` - Added table schema
- ✓ `frontend/src/components/admin/SalesOrderForm.jsx` - Auto-save logic

## Error Handling

The implementation includes error handling for:
- Missing user authentication
- Draft not found (404)
- Database errors
- Invalid input data
- Unauthorized access (draft belongs to other user)

## Performance Considerations

1. **Auto-save Interval**: 30 seconds (configurable in frontend)
2. **Save Triggers**: On step change + auto-interval
3. **Database Indexes**: User ID + Updated At for fast lookups
4. **Old Draft Cleanup**: Consider cron job to delete drafts >30 days old

## Troubleshooting

### "Route not found" Error (404)
→ Backend API endpoints not registered. Ensure `draftController` is imported in `salesRoutes.js`

### "Unauthorized" Error (401)
→ User not authenticated. Ensure Bearer token is included in request header

### "Draft not found" Error (404)
→ Draft ID doesn't exist or belongs to different user. Check `createDraftsTable.js` was run

### Table doesn't exist error
→ Run: `node backend/createDraftsTable.js` or `npm run init-db`

## Next Steps

1. ✓ Run table creation script
2. ✓ Restart backend server
3. ✓ Test from Sales Orders page
4. ✓ Verify auto-save indicator appears
5. ✓ Test draft recovery on page reload

## Support

For issues:
1. Check backend console for errors
2. Verify database table exists: `SHOW TABLES LIKE 'sales_order_drafts';`
3. Check user ID matches: `SELECT * FROM sales_order_drafts;`
4. Verify auth middleware isn't blocking requests
