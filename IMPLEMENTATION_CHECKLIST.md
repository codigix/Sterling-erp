# Design Documents Root Card Filtering - Implementation Checklist

## ✅ Code Changes Completed

### Backend Changes
- [x] **Migration Created**: `backend/migrations/1001_add_root_card_to_specifications.js`
  - Adds `root_card_id` column to `specifications` table
  - Adds `status` column to `specifications` table
  - Adds foreign key constraint
  
- [x] **Migration Runner Updated**: `backend/utils/migrationRunner.js`
  - Updated specifications table schema to include `root_card_id`
  - Updated specifications table schema to include `status`
  
- [x] **Controller Enhanced**: `backend/controllers/root-cards/designEngineeringController.js`
  - Enhanced `createOrUpdate()` method to create Drawing/Specification records from attachments
  - Properly handles both JSON attachments and file objects
  - Creates records with correct `root_card_id`

### Frontend Changes
- [x] **Step Data Handler Enhanced**: `frontend/src/components/admin/RootCardForm/stepDataHandler.js`
  - Added `uploadWizardAttachments()` function
  - Identifies local files (files with `isLocal: true`)
  - Uploads files to server after root card creation
  - Modified `saveAllStepsToRootCard()` to call upload function

### Files Already in Place (No Changes Needed)
- [x] **DocumentsPage.jsx** - Already has root card filtering logic
  - Root card dropdown selection
  - Filters by `rootCardId` in API calls
  - Displays correct documents per tab

- [x] **Drawing & Specification Models** - Already have root card filtering
  - `Drawing.findAll()` filters by `root_card_id`
  - `Specification.findAll()` filters by `root_card_id`

- [x] **Drawing & Specification Controllers** - Already handle root card filtering
  - `getDrawings()` accepts `rootCardId` parameter
  - `getSpecifications()` accepts `rootCardId` parameter

## 🔧 Pre-Deployment Steps

### 1. Run Database Migration
```bash
cd d:\passion\Sterling-erp\backend
node migrations/1001_add_root_card_to_specifications.js
```
**Expected Output:**
```
✓ Column added successfully
✓ Status column added successfully
```

### 2. Restart Backend Server
```bash
# Kill existing process and restart
npm start
```

### 3. Clear Browser Cache
- Clear all browser cache for localhost
- Or use Ctrl+Shift+Delete in browser dev tools

## 🧪 Manual Testing Steps

### Test Case 1: Create Root Card with Documents

**Step 1: Admin Creates Root Card**
1. Navigate to `http://localhost:5173/admin/root-cards/new-root-card`
2. Fill **Step 1 - PO Details**:
   - PO Number: `TEST-001`
   - Client Name: `Test Client`
   - Project Name: `Test Project`
   - Click **Next**

3. Fill **Step 2 - Design Engineering**:
   - Assign to: Design Engineer (Default)
   
4. **Upload Files**:
   - In "Raw Design Drawings" section:
     - Upload a PDF file (e.g., `test-drawing.pdf`)
   - In "Required Documents" section:
     - Upload a DOCX or XLSX file (e.g., `test-spec.xlsx`)
   - Click anywhere to confirm uploads are showing

5. **Complete the Wizard**:
   - Click **Next** to continue through remaining steps (or skip if optional)
   - Click **Save & Submit** on final step

6. **Verify Root Card Created**:
   - Should see success message
   - Should be redirected to root cards list

### Test Case 2: View Documents in Design Engineer Portal

**Step 2: Design Engineer Views Documents**
1. Navigate to `http://localhost:5173/design-engineer/documents/raw-designs`
2. **Verify Root Card Dropdown**:
   - Should show "All Root Cards" as default
   - Should show the newly created root card in dropdown

3. **Select Root Card**:
   - Click on the dropdown
   - Select "Test Project" (or the name you gave it)

4. **Verify Raw Designs Tab**:
   - Should see `test-drawing.pdf` in the table
   - Should show:
     - NAME: test-drawing.pdf
     - VERSION: V1.0
     - STATUS: Draft
     - DATE: Today's date
   - Should have download, approve, and delete action buttons

5. **Switch to Required Documents Tab**:
   - Click on "Required Documents for Project" in sidebar
   - Should see `test-spec.xlsx` in the table
   - Should have same columns as above

### Test Case 3: Document Approval

1. In Design Documents page, with root card selected
2. Click the **checkmark icon** (✓) in Actions column
3. **Approval Modal** should appear with:
   - Text area for notes
   - Submit button
4. Add approval notes (optional)
5. Click **Approve**
6. **Verify Status Changes**:
   - Status badge should change from "Draft" to "Approved"
   - Document should still be visible in the list

### Test Case 4: Document Deletion

1. In Design Documents page, with root card selected
2. Click the **trash icon** (🗑) in Actions column
3. **Confirm Deletion** dialog should appear
4. Click **Confirm**
5. **Verify Document Removed**:
   - Document should disappear from the list

### Test Case 5: All Root Cards Filter

1. In Design Documents page
2. Click dropdown and select "All Root Cards"
3. **Verify All Documents Show**:
   - Should see documents from all root cards
   - Example: If you created 2 root cards with documents, should see all of them

## 🐛 Debugging - Check These If Tests Fail

### Documents Don't Appear After Selecting Root Card

**Check 1: Database Schema**
```bash
cd d:\passion\Sterling-erp\backend
node -e "const pool = require('./config/database'); pool.execute('DESCRIBE specifications').then(([rows]) => rows.forEach(r => console.log(r.Field))).catch(console.error)"
```
Should include: `root_card_id`, `status`

**Check 2: Browser Console Errors**
- Open DevTools (F12)
- Go to Console tab
- Look for any red error messages
- Check Network tab for failed API requests

**Check 3: Server Logs**
- Check backend console for errors
- Should see messages like: `✓ Created Drawing record for: test-drawing.pdf`

**Check 4: Database Records**
```bash
cd d:\passion\Sterling-erp\backend
node -e "const pool = require('./config/database'); pool.execute('SELECT * FROM drawings LIMIT 1').then(([rows]) => console.log(JSON.stringify(rows[0], null, 2))).catch(console.error)"
```
Verify `root_card_id` is set correctly

### Files Upload But Documents Don't Appear

**Check**: Backend is receiving upload requests
- Look in server logs for file upload messages
- Verify file size is not exceeding limits (50MB)

**Check**: Correct `rootCardId` is being passed
- In browser DevTools, Network tab
- Look for POST to `/root-cards/steps/XX/design-engineering/upload`
- Verify XX is the root card ID

## 📊 Expected Behavior Summary

### Before Fix:
- ❌ Upload documents in wizard
- ❌ Create root card
- ❌ Go to Design Documents
- ❌ Select root card
- ❌ **NO DOCUMENTS APPEAR** ← Problem

### After Fix:
- ✅ Upload documents in wizard
- ✅ Create root card
- ✅ Go to Design Documents
- ✅ Select root card
- ✅ **DOCUMENTS APPEAR** ← Fixed!

## 🎯 Success Criteria

All of the following must be true:
- [ ] Migration runs successfully
- [ ] Root card created with documents
- [ ] Documents appear in Design Documents page when root card selected
- [ ] Documents do NOT appear when "All Root Cards" selected (unless other cards have docs)
- [ ] Approval workflow works
- [ ] Delete functionality works
- [ ] No console errors
- [ ] No server errors

## 📝 Notes

- Files are uploaded **after** root card creation, not during
- This prevents orphaned files in the system
- Wizard attachments are identified by `isLocal: true` flag
- Each file type is uploaded separately (drawings vs documents)
- Both Drawing and Specification records are created simultaneously

## 🚀 Deployment

Once all tests pass:
1. Commit changes to git
2. Merge to main branch
3. Deploy to production
4. Verify in production environment
5. Document in release notes

