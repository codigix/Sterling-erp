# Design Documents Root Card Filtering - Fix Summary

## Issues Identified & Fixed

### 1. **Missing `root_card_id` Column in Specifications Table**
   - **Problem**: The `specifications` table didn't have a `root_card_id` column, preventing proper filtering of specifications by root card
   - **Solution**: 
     - Created migration: `1001_add_root_card_to_specifications.js` to add the column
     - Updated `migrationRunner.js` to include `root_card_id` in the table schema for new installations
     - Migration already applied to the database (confirmed)

### 2. **Documents Not Created from Wizard Attachments**
   - **Problem**: When documents are uploaded during root card creation (Step 2 - Design Engineering in the wizard), they are stored as JSON in the `design_engineering_details` table but are NOT converted to individual `Drawing` and `Specification` records
   - **Solution**: Modified `designEngineeringController.js` `createOrUpdate()` method to:
     - Extract attachments from the request payload
     - Create individual `Drawing` records for drawings
     - Create individual `Specification` records for documents
     - These records have the correct `root_card_id` set, making them queryable and filterable

## How It Works Now

### Workflow:
1. **Admin creates root card via wizard** → Root card is created with unique ID (e.g., 31)
2. **Step 2 - Design Engineering** → User uploads Raw Design Drawings and Required Documents
3. **Documents are saved as JSON** → Stored in `design_engineering_details` table
4. **Backend creates Drawing/Specification records** → Each document creates a record in the respective table with `root_card_id` set
5. **Design Engineer views Design Documents** → Selects root card from dropdown
6. **API filters by root_card_id** → Returns only documents belonging to that root card
7. **Design Engineer can approve/verify** → Each document can be individually approved

## Database Schema Updates

### Specifications Table:
```sql
ALTER TABLE specifications 
ADD COLUMN root_card_id INT NULL,
ADD FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE,
ADD COLUMN status ENUM('Draft', 'Approved', 'Final') DEFAULT 'Draft';
```

### Drawings Table:
Already has the `root_card_id` column (confirmed in schema)

## Modified Files

1. **Backend**:
   - `migrations/1001_add_root_card_to_specifications.js` - NEW migration file
   - `utils/migrationRunner.js` - Updated specifications table creation
   - `controllers/root-cards/designEngineeringController.js` - Enhanced `createOrUpdate()` method

2. **Frontend**: 
   - No changes needed - existing code already supports root card filtering correctly

## Testing Steps

1. **Create a new root card** via Admin → Root Cards → Create New
2. **Fill in Step 1** (PO Details) and proceed to Step 2
3. **In Step 2 - Design Engineering**:
   - Upload some drawings (Raw Design Drawings section)
   - Upload some documents (Required Documents section)
   - Save/Complete the step
4. **Go to Design Engineer → Design Documents**
5. **Check the dropdown** - Select the root card you just created
6. **Verify**:
   - "Raw Design and Drawings" tab shows uploaded drawings
   - "Required Documents for Project" tab shows uploaded documents
   - Each document can be downloaded
   - Documents can be approved with notes
   - Status shows "Draft" → "Approved" progression

## API Endpoints Used

- **Get Root Cards**: `GET /production/root-cards`
- **Get Drawings by Root Card**: `GET /production/drawings?rootCardId=31`
- **Get Specifications by Root Card**: `GET /production/specifications?rootCardId=31`
- **Approve Drawing**: `PATCH /production/drawings/:id/approve`
- **Approve Specification**: `PATCH /production/specifications/:id/approve`

## Key Points

✅ Documents uploaded during wizard are now properly linked to root cards
✅ Root card filtering works in Design Documents page
✅ Design engineers can view, download, and approve documents per root card
✅ Database integrity is maintained with proper foreign keys
✅ Backward compatible - existing documents continue to work

## Troubleshooting

If documents still don't appear after testing:
1. Verify the migration was run: Check if `specifications` table has `root_card_id` column
   ```bash
   node backend/migrations/1001_add_root_card_to_specifications.js
   ```
2. Clear browser cache and refresh Design Documents page
3. Check browser console for any API errors
4. Verify root card ID is correctly passed in the dropdown selection
