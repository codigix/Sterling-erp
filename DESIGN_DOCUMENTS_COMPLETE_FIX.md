# Design Documents - Complete Solution

## Problem Statement
When documents are uploaded during root card creation (Step 2 - Design Engineering in the Admin wizard), they were not appearing in the Design Engineer's Design Documents page when selecting that specific root card.

## Root Causes Identified

### 1. Database Schema Issue
- The `specifications` table was missing the `root_card_id` column, preventing proper filtering by root card

### 2. File Upload Flow Gap  
- Files uploaded during the wizard (before root card creation) were stored locally in the browser as File objects
- After root card creation, these buffered files were NOT being uploaded to the server
- Therefore, no Drawing/Specification records were created

### 3. Missing Attachment Processing
- The `createOrUpdate` method in designEngineeringController wasn't creating individual Drawing/Specification records from wizard attachments

## Complete Solution Implemented

### 1. Backend Database Changes
**File**: `backend/migrations/1001_add_root_card_to_specifications.js`
```sql
ALTER TABLE specifications 
ADD COLUMN root_card_id INT NULL,
ADD FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE,
ADD COLUMN status ENUM('Draft', 'Approved', 'Final') DEFAULT 'Draft';
```

**File**: `backend/utils/migrationRunner.js`
- Updated specifications table creation to include `root_card_id` and `status` columns

### 2. Backend Controller Enhancement
**File**: `backend/controllers/root-cards/designEngineeringController.js`
- Enhanced `createOrUpdate()` method to create Drawing/Specification records from attachments
- The upload endpoint `/root-cards/steps/${rootCardId}/design-engineering/upload` was already correctly creating records

### 3. Frontend File Upload Flow
**File**: `frontend/src/components/admin/RootCardForm/stepDataHandler.js`
- Added `uploadWizardAttachments()` function to upload buffered files after root card creation
- Modified `saveAllStepsToRootCard()` to call the upload function after saving all step data
- This ensures wizard attachments are uploaded to the server with the correct `root_card_id`

## Complete Data Flow

### Step-by-Step Process

**Phase 1: Wizard Upload (Before Root Card Creation)**
1. User opens Admin → Root Cards → Create New
2. Proceeds to Step 2 - Design Engineering
3. Uploads files (drawings and documents)
4. Files are stored locally as File objects with `isLocal: true`
5. User completes the form and clicks "Save & Submit"

**Phase 2: Root Card Creation**
6. Root card is created with a new `id` (e.g., 31, 25, etc.)
7. `saveAllStepsToRootCard()` is called with the new `rootCardId`

**Phase 3: Step Data Persistence**
8. All 7 steps' data are saved via POST requests to respective endpoints
9. Step 2 data includes the design engineering information

**Phase 4: File Upload & Record Creation**
10. `uploadWizardAttachments()` is called
11. Local files are identified (files with `isLocal: true` and `file` property)
12. FormData objects are created for each file type
13. Files are POSTed to `/root-cards/steps/${rootCardId}/design-engineering/upload`
14. Backend receives files and creates:
    - **Drawing** records for drawing files with `root_card_id = 31`
    - **Specification** records for document files with `root_card_id = 31`

**Phase 5: Design Engineer Views Documents**
15. Design Engineer navigates to Design Engineer → Design Documents
16. Selects the root card from dropdown (e.g., "LR-ASHM Load Simulation Dummy")
17. Frontend calls: `GET /production/drawings?rootCardId=31`
18. Frontend calls: `GET /production/specifications?rootCardId=31`
19. Backend filters records where `root_card_id = 31` 
20. Documents appear in the respective tabs:
    - "Raw Design and Drawings" → Shows Drawing records
    - "Required Documents for Project" → Shows Specification records

**Phase 6: Document Management**
21. Design Engineer can:
    - View document details
    - Download documents
    - Approve documents (status changes from Draft to Approved)
    - Delete documents
    - Add approval notes

## Files Modified

### Backend
1. `backend/migrations/1001_add_root_card_to_specifications.js` - NEW
2. `backend/utils/migrationRunner.js` - UPDATED
3. `backend/controllers/root-cards/designEngineeringController.js` - ENHANCED

### Frontend
1. `frontend/src/components/admin/RootCardForm/stepDataHandler.js` - ENHANCED

## Database Tables Involved

### drawings
- **Columns**: id, root_card_id, name, drawing_number, type, version, status, remarks, file_path, format, size, uploaded_by, created_at, updated_at
- **Filter by**: `root_card_id` ✅

### specifications  
- **Columns**: id, root_card_id, title, description, version, file_name, file_path, status, uploaded_by, created_at, updated_at
- **Filter by**: `root_card_id` ✅

## API Endpoints

### Fetch Documents
```
GET /production/drawings?rootCardId=31
GET /production/specifications?rootCardId=31
GET /production/technical-files?rootCardId=31
```

### Upload Documents (Wizard)
```
POST /root-cards/steps/:rootCardId/design-engineering/upload
Body: FormData with files and type ('drawings' or 'documents')
```

### Approve Document
```
PATCH /production/drawings/:id/approve
PATCH /production/specifications/:id/approve
Body: { status: 'Approved', notes: '...' }
```

### Upload Document (After Creation)
```
POST /production/drawings
POST /production/specifications
Body: FormData with file and metadata
```

## Testing Verification Checklist

- [ ] Run migration: `node backend/migrations/1001_add_root_card_to_specifications.js`
- [ ] Restart backend server
- [ ] Create new root card via Admin wizard
- [ ] In Step 2 (Design Engineering), upload at least one drawing and one document
- [ ] Complete the wizard and create the root card
- [ ] Verify root card is created successfully
- [ ] Navigate to Design Engineer → Design Documents
- [ ] Check dropdown shows the newly created root card
- [ ] Select the root card and verify:
  - [ ] "Raw Design and Drawings" tab shows uploaded drawings
  - [ ] "Required Documents for Project" tab shows uploaded documents
  - [ ] Documents have version, status (Draft), and date
  - [ ] Can download documents
  - [ ] Can approve documents (status changes)
  - [ ] Can delete documents
  - [ ] Can add approval notes

## Browser Console Debugging

Look for these success messages:
```
Wizard attachments uploaded successfully: [...]
✓ Created Drawing record from attachment: filename.pdf
✓ Created Specification record from attachment: filename.pdf
```

## Troubleshooting

**Issue**: Documents don't appear after selecting root card
- **Solution 1**: Clear browser cache and refresh page
- **Solution 2**: Verify migration was run on database
- **Solution 3**: Check browser console for API errors
- **Solution 4**: Check server logs for upload errors

**Issue**: Upload fails during wizard completion
- **Solution**: Check browser console for network errors
- **Solution**: Verify file sizes are within limits (50MB for design files)
- **Solution**: Check server disk space

**Issue**: Documents appear but are associated with wrong root card
- **Solution**: Verify rootCardId is correctly passed to upload endpoint
- **Solution**: Check database records have correct root_card_id values

## Performance Notes

- Files are uploaded after root card creation, not during
- Large file uploads don't block the wizard completion
- Multiple file uploads are processed in parallel
- Database queries are optimized with proper indexes

## Security Considerations

- All file uploads are server-side validated
- Only authenticated design engineers can access documents
- File paths are not exposed to frontend
- Documents are associated with specific root cards (access control)
- File type validation on upload

## Future Enhancements

- Batch upload multiple files
- File preview functionality
- Version history tracking
- Document collaboration/comments
- OCR for document scanning
- Digital signatures for approvals
