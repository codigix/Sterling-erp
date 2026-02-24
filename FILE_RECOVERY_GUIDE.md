# File Path Recovery Guide

## Overview

Some files uploaded before the file path storage system was implemented don't have their file paths stored in the database. This causes errors when users try to download or preview those files, even though the files physically exist on the server.

## The Problem

**Symptom:** "File path not available" error when trying to download/view old documents

**Root Cause:** 
- Old uploads only stored the filename (e.g., `document.pdf`)
- The system needs the full filesystem path (e.g., `design-engineering/document_1708585200_abc123.pdf`) to locate files
- Files exist in `backend/uploads/design-engineering/` but the database can't map the filename to the actual file

## Recovery Options

### Option 1: Automatic Recovery (Recommended)

This attempts to match old filenames with actual files in the uploads directory.

#### Run the Recovery Script

```bash
cd backend
node recover-file-paths.js
```

**What it does:**
- Scans all uploaded files in `backend/uploads/design-engineering/`
- Matches old document names with actual files
- Updates database records with recovered paths
- Shows summary of what was recovered

**Output:**
```
=== Recovery Summary ===
Total records processed: 15
Records with recovered paths: 5
Records skipped (no recovery needed): 10
```

#### Run as Database Migration

```bash
npm run migrate -- --file=1003_recover_legacy_file_paths.js
```

Or run all pending migrations:

```bash
npm run migrate
```

### Option 2: Manual Re-upload

For files that cannot be automatically recovered:

1. Go to the Root Card in Admin Panel (`/admin/root-cards/:id`)
2. Navigate to Step 2: Design Engineering
3. Upload the files again
4. Files will now be stored with proper path information

### Option 3: Batch Recovery with Details

To see detailed recovery information:

```bash
cd backend
node -e "
const recover = require('./recover-file-paths.js');
// Logs detailed information about each recovery
"
```

## How Recovery Matching Works

The recovery process uses filename matching to locate old files:

1. **Exact Match:** If a file exists with the exact same name as in the database
2. **Pattern Match:** If a file starts with the same base name and contains timestamp/random suffix (e.g., `document_1708585200_abc123.pdf` matches record with filename `document.pdf`)

## File Structure Reference

### Upload Directory Location
```
backend/
├── uploads/
│   ├── design-engineering/        # Design documents & CAD files
│   │   ├── IMG-20260221-WA0010 (1).jpg
│   │   ├── Quotation_QUO-2026-001 (8) (1)_1708585242_a1b2c3d.pdf
│   │   └── Sales_Order_SO-2026-0002_1708585300_xyz789.pdf
│   ├── client-po/                 # Purchase order documents
│   └── [other uploads]
```

### Database Field Format
Old records:
```json
{
  "name": "document.pdf",
  "size": 1024,
  "created_at": "2026-02-20T10:30:00Z"
}
```

Recovered records:
```json
{
  "name": "document.pdf",
  "path": "design-engineering/document_1708585200_abc123.pdf",
  "size": 1024,
  "created_at": "2026-02-20T10:30:00Z",
  "recovered": true
}
```

## Troubleshooting

### Files Not Found After Recovery

**Cause:** Files might have been deleted or the filename pattern doesn't match

**Solution:**
- Check if files exist in `backend/uploads/design-engineering/`
- Check the recovery script output for warnings
- Re-upload the missing files

### Recovery Didn't Update My Files

**Cause:** Filenames might be too generic or files were deleted

**Check:**
1. Run recovery script with logging: `node recover-file-paths.js`
2. Look for "Records skipped" - these may need manual upload
3. Re-upload any critical missing files

### Upload Directory Doesn't Exist

**Cause:** First time setup or clean installation

**Solution:**
```bash
cd backend
mkdir -p uploads/design-engineering
mkdir -p uploads/client-po
```

## Manual Database Update (Advanced)

If you need to manually update a record:

```sql
UPDATE design_engineering_details 
SET documents = JSON_SET(
  documents, 
  '$[0].path', 
  'design-engineering/actual_filename_on_disk.pdf'
)
WHERE sales_order_id = 13;
```

## Verification

After recovery, verify files are accessible:

1. Go to Design Engineer Dashboard
2. Navigate to Documents → Raw Designs
3. Select the Root Card
4. Try to View/Download documents
5. Files should now load without "File path not available" error

## Prevention for Future

All new uploads automatically include proper path information:
- File stored as: `document_timestamp_random.ext`
- Database stores: `path: "design-engineering/document_timestamp_random.ext"`
- System can now reliably locate and serve files

## Additional Resources

- View task: `POST /design-engineer/documents/root-cards/:rootCardId`
- Download endpoint: `GET /api/files/download`
- Document approval flow: Design Engineer Dashboard

---

**Last Updated:** February 23, 2026
**Status:** Ready for Production
