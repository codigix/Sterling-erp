# Verification Script - Design Documents Implementation

## Quick Verification Commands

Run these commands to verify everything is in place:

### 1. Verify Migration File Exists
```bash
ls -la d:\passion\Sterling-erp\backend\migrations\1001_add_root_card_to_specifications.js
```
Should output: File exists and is readable

### 2. Verify Database Migration
```bash
cd d:\passion\Sterling-erp\backend
node migrations/1001_add_root_card_to_specifications.js
```
Expected output:
```
✓ Column already exists
✓ Status column already exists
```
(Already exists because migration was run during our fixes)

### 3. Verify Backend Controller Changes
```bash
grep -n "uploadWizardAttachments\|Create Drawing\|Create Specification" \
  d:\passion\Sterling-erp\backend\controllers\root-cards\designEngineeringController.js
```
Should find: Multiple matches indicating the new code is there

### 4. Verify Frontend Changes
```bash
grep -n "uploadWizardAttachments\|isLocal.*file" \
  d:\passion\Sterling-erp\frontend\src\components\admin\RootCardForm\stepDataHandler.js
```
Should find: Multiple matches indicating the new function is there

### 5. Check Database Schema
```bash
cd d:\passion\Sterling-erp\backend
node -e "
const pool = require('./config/database');
(async () => {
  const [cols] = await pool.execute(\`
    SELECT COLUMN_NAME, COLUMN_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'specifications' 
    ORDER BY ORDINAL_POSITION
  \`);
  cols.forEach(col => console.log(col.COLUMN_NAME + ' (' + col.COLUMN_TYPE + ')'));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
"
```
Should show:
```
id (int)
root_card_id (int)
title (varchar)
description (text)
version (varchar)
file_name (varchar)
file_path (varchar)
status (varchar)
uploaded_by (int)
created_at (timestamp)
updated_at (timestamp)
```

### 6. Verify Drawings Table
```bash
cd d:\passion\Sterling-erp\backend
node -e "
const pool = require('./config/database');
(async () => {
  const [cols] = await pool.execute(\`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'drawings' 
    AND COLUMN_NAME = 'root_card_id'
  \`);
  if (cols.length > 0) {
    console.log('✓ root_card_id column exists in drawings table');
  } else {
    console.log('✗ root_card_id column MISSING in drawings table');
  }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
"
```

### 7. Check API Endpoints Are Correct
The following endpoints should be working:

**Get Drawings by Root Card:**
```bash
curl -X GET "http://localhost:5000/api/production/drawings?rootCardId=31"
```
Should return: Array of drawing records for root card 31

**Get Specifications by Root Card:**
```bash
curl -X GET "http://localhost:5000/api/production/specifications?rootCardId=31"
```
Should return: Array of specification records for root card 31

**Upload Design Documents:**
```bash
curl -X POST "http://localhost:5000/api/root-cards/steps/31/design-engineering/upload" \
  -F "documents=@/path/to/file.pdf" \
  -F "type=drawings"
```
Should return: Success response with created drawing records

### 8. Frontend Route Verification
Check that these routes exist:

```bash
grep -r "documents/raw-designs\|documents/required-docs" \
  d:\passion\Sterling-erp\frontend/src/components/layout/
```

Should find references to both routes

## Integration Test Checklist

Run this complete integration test:

### Test Setup
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Wait for both servers to be ready (30 seconds)

### Test Execution

**Create Root Card:**
```bash
# Navigate to admin panel
# Create new root card
# Upload at least 1 drawing file and 1 document file
# Complete the wizard
# Note the root card ID (should be shown in success message or in URL)
```

**View Documents:**
```bash
# Navigate to Design Engineer → Design Documents
# Open browser console (F12)
# You should see these log messages:
# - "Wizard attachments uploaded successfully: [...]"
# - "✓ Created Drawing record for: [filename]"
# - "✓ Created Specification record for: [filename]"
# (or similar messages)
```

**Verify Filtering:**
```bash
# In the root card dropdown, select your newly created root card
# Switch to "Raw Design and Drawings" tab
# You should see the uploaded drawing file
# Switch to "Required Documents for Project" tab
# You should see the uploaded document file
```

## Logs to Expect

### Frontend Console (DevTools → Console)
```
[stepDataHandler.js] Wizard attachments uploaded successfully: [...]
```

### Backend Console
```
[DesignEngineeringController] ✓ Created Drawing record for: test-drawing.pdf
[DesignEngineeringController] ✓ Created Specification record for: test-spec.xlsx
```

### Browser Network Tab
Should see successful POST requests to:
- `/api/root-cards/steps/31/design-engineering/upload` (for drawings)
- `/api/root-cards/steps/31/design-engineering/upload` (for documents)

## Success Indicators

✅ **You know it's working if:**
1. Root card is created successfully
2. Backend logs show "Created Drawing record" and "Created Specification record"
3. When you select the root card in Design Documents, files appear
4. Each file is in the correct tab (drawings vs documents)
5. You can approve, download, and delete files
6. No console errors in DevTools
7. No errors in backend console

❌ **Troubleshooting if:**

**No files appear:**
- Check: Migration was run
- Check: Backend was restarted after migration
- Check: Browser cache was cleared
- Check: Correct root card ID in dropdown
- Check: Backend logs for file upload messages

**Files appear but wrong root card:**
- Check: rootCardId parameter is correct in upload requests
- Check: Database has correct root_card_id in drawing/specification records

**Upload fails:**
- Check: File size (should be < 50MB)
- Check: File type is allowed (PDF, DWG, XLSX, etc.)
- Check: Backend has write permissions to uploads folder
- Check: Disk space is available

## Performance Expectations

- Root card creation: < 2 seconds
- File upload (per file): < 5 seconds
- Documents page load: < 1 second
- Filtering by root card: < 500ms

## Database Query Performance

These queries should be fast (< 100ms):
```sql
SELECT * FROM drawings WHERE root_card_id = 31;
SELECT * FROM specifications WHERE root_card_id = 31;
SELECT * FROM root_cards WHERE id = 31;
```

## File Storage Locations

Uploaded files are stored in:
```
d:\passion\Sterling-erp\backend\uploads\design-engineering\
```

Files should have original names preserved:
- `test-drawing.pdf` → stored as `uploads/design-engineering/test-drawing.pdf`
- `test-spec.xlsx` → stored as `uploads/design-engineering/test-spec.xlsx`

## Security Verification

- [ ] Only authenticated users can upload
- [ ] Only design engineers can view design documents page
- [ ] File paths are not exposed to frontend
- [ ] File types are validated on upload
- [ ] File size limits are enforced (50MB)
- [ ] Files are stored outside web root
- [ ] SQL injection is prevented (parameterized queries)
- [ ] XSS is prevented (file names are sanitized)

## Rollback Plan

If something goes wrong:

1. **Delete Migration**: 
   - Delete the migration file won't undo changes if already run
   - SQL to revert: `ALTER TABLE specifications DROP COLUMN root_card_id, DROP COLUMN status`

2. **Revert Code Changes**:
   - Use git to revert the modified files
   - Clear npm cache: `npm cache clean --force`

3. **Clear Upload Files**:
   - Remove files from `backend/uploads/design-engineering/`
   - Remove records from database if needed

## Final Checklist

Before declaring success:
- [ ] All code files are in place
- [ ] Migration is run
- [ ] Backend is restarted
- [ ] Browser cache cleared
- [ ] Root card created with documents
- [ ] Documents appear in Design Documents page
- [ ] Root card filtering works
- [ ] Approval workflow works
- [ ] No console errors
- [ ] No server errors
- [ ] User can complete the task end-to-end

