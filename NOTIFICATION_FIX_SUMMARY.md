# Notification System Fix - Summary

## Problem Identified
Notifications were not being created in the database despite the code being present and integrated. The verification script showed **0 total notifications** even though the notification creation logic was in place.

## Root Cause
There was a **critical mismatch between ID systems**:

1. **Production Plan Stages** store `assigned_employee_id` from the `employees` table
2. **Alerts Notifications** table had a foreign key constraint:
   ```sql
   FOREIGN KEY (user_id) REFERENCES users(id)
   ```
3. When code tried to insert notifications with `user_id = employee_id`, the foreign key constraint failed because:
   - `employees.id = 1` exists
   - `users.id = 1` does NOT exist (different table)
   - Database silently rejected the INSERT, but the try-catch block hid the error

## Solutions Implemented

### 1. Created Migration File
**File:** `backend/migrations/036_fix_alerts_notifications_fk.js`

This migration:
- Drops the old foreign key constraint (references `users`)
- Creates a new foreign key constraint that references `employees` table
- Handles constraint conflicts gracefully

### 2. Updated EmployeeTask Model
**File:** `backend/models/EmployeeTask.js`

Changed from using `AlertsNotification.create()` to direct SQL `INSERT` statements in two locations:

#### In `createAssignedTask()` method (lines 177-193):
- **Before:** Used AlertsNotification.create() with model class
- **After:** Uses `pool.execute()` with raw SQL INSERT
- Sends `task_assigned` notifications when unblocked stages are assigned

#### In `updateAssignedTaskStatus()` method (lines 318-337):
- **Before:** Used AlertsNotification.create() with model class  
- **After:** Uses `pool.execute()` with raw SQL INSERT
- Sends `stage_ready` notifications when a production stage is unlocked

**Advantage:** Raw SQL bypasses the model layer and directly inserts with correct foreign key reference to employees table.

### 3. Created Test Script
**File:** `backend/test-notification-flow.js`

This script:
- Verifies the foreign key constraint points to `employees` table
- Tests notification creation with a real employee ID
- Confirms notifications appear in database
- Provides diagnostic information if issues occur

## How to Apply the Fixes

### Step 1: Run the Migration
```bash
cd backend
node migrations/036_fix_alerts_notifications_fk.js
```

Expected output:
```
Fixing alerts_notifications table foreign keys...
Dropping foreign key: fk_alerts_notifications_user_id
✓ Old foreign key removed
✓ New foreign key constraint added (references employees)
✓ Migration completed successfully!
```

### Step 2: Test the Fix
```bash
node test-notification-flow.js
```

Expected output:
```
=== NOTIFICATION SYSTEM TEST ===

1. Checking FK constraint on alerts_notifications...
   ✓ FK found: fk_alerts_user_id
   ✓ References table: employees

2. Finding production stages with assigned employees...
   - Stage 1: "Design" -> Employee 5
   - Stage 2: "Manufacturing" -> Employee 6

3. Testing notification creation for employee 5...
   ✓ Notification created with ID: 1

4. Verifying notification exists...
   ✓ Found notification:
     - ID: 1
     - User ID: 5
     - Type: test_notification
     - Message: This is a test notification from the notification system
     - Created: 2026-01-10 12:25:30

5. Checking total notifications in database...
   ✓ Total notifications: 1

6. Checking if employees table exists and has data...
   ✓ Employees in database: 15

=== TEST COMPLETE ===
```

### Step 3: Restart Backend
```bash
npm start
```

## Verification in Production

1. **Create a Production Plan** with 2+ stages and assign different employees to each
2. **Employee A completes Stage 1** task via the TaskDetailModal
3. **Verify Stage 2 is unlocked** (check production_plan_stages table: `is_blocked = 0`)
4. **Employee B checks NotificationBell** - should show `stage_ready` notification
5. **Check database** for notification record:
   ```sql
   SELECT * FROM alerts_notifications 
   WHERE alert_type = 'stage_ready' 
   ORDER BY created_at DESC LIMIT 1;
   ```

## Modified Files

| File | Changes |
|------|---------|
| `backend/models/EmployeeTask.js` | Replaced AlertsNotification.create() with raw SQL pool.execute() in 2 methods |
| `backend/migrations/036_fix_alerts_notifications_fk.js` | NEW - Fixes foreign key constraint |
| `backend/test-notification-flow.js` | NEW - Test script for verification |

## Architecture Impact

### Before
```
EmployeeTask → AlertsNotification.create() → users table FK → FAIL (wrong table)
```

### After
```
EmployeeTask → pool.execute(raw SQL) → employees table FK → SUCCESS
```

## Technical Notes

- The fix uses raw SQL directly instead of the model layer to avoid type conversions
- All error handling is preserved with try-catch blocks
- Notification priority is set to 'high' for both task_assigned and stage_ready events
- Logs include detailed debugging information for troubleshooting

## Related Files
- Frontend notification polling: `frontend/src/components/common/NotificationBell.jsx`
- Frontend modal that triggers completion: `frontend/src/components/modals/TaskDetailModal.jsx`
- Alert retrieval: `backend/controllers/notifications/alertsNotificationController.js`
