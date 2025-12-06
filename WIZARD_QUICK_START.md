# Sales Order Wizard - Quick Start Guide

## Accessing the Wizard

### Step 1: Navigate to Sales Orders Page
**URL**: `http://localhost:5173/admin/sales-orders-management`

**Or via Menu**:
1. Click on **Admin** in the sidebar
2. Select **Sales Orders**

### Step 2: View Your Sales Orders
- List shows all sales orders with their current status
- See workflow progress for each order
- Filter by status using buttons at the top

### Step 3: Start a Workflow

**For New Orders:**
1. Click **"New Sales Order"** button
2. Fill in basic order details
3. Save the order
4. Click **"Start"** button to begin workflow

**For Existing Orders:**
1. Find the order in the list
2. Click **"Start"** (if not started) or **"Open"** (if in progress)
3. Wizard opens with all 9 steps

## Using the Wizard

### Understanding the Interface

```
[Step 1] → [Step 2] → [Step 3] → ... → [Step 9]
  ✓        ✓         ●          ...     ○
(Done)   (Done)    (Current)   ...   (Pending)
```

- **✓ Green**: Completed step
- **●**: Current step (highlighted)
- **○ Gray**: Pending steps

### For Each Step

1. **View Step Details**
   - Step name and description
   - Current status
   - Assigned employee (if any)

2. **Assign an Employee** (if not assigned)
   - Click the select dropdown
   - Choose employee
   - Employee gets automatic notification

3. **Upload Documents** (for document steps)
   - Click upload area
   - Select files
   - Submit

4. **Add Notes** (optional)
   - Fill in step notes
   - Useful for instructions or comments

5. **Take Action**
   - **"Start Step"**: Move to in-progress
   - **"Complete Step"**: Mark as complete (auto-advances to next step)

### Navigation

- **"Previous"**: Go to previous step
- **"Next"**: Go to next step (if current step is complete)
- **"Cancel"**: Exit wizard without saving

## Employee Perspective

### Receiving a Task Assignment

When assigned to a step:
1. **Notification appears** in notification center
2. **Task shows** in employee dashboard
3. **Contains**: Step name, sales order ID, description

### Completing Your Task

1. Navigate to Sales Orders
2. Find your assigned order
3. Click to open workflow
4. Jump to your assigned step
5. Review requirements
6. Upload documents if needed
7. Click **"Complete Step"**
8. Status automatically updates

## Example Workflow

### Scenario: Processing New Sales Order

**Time: Monday Morning**
1. Admin creates new PO #2025-001 with client details
2. Admin clicks "Start" to initialize workflow
3. Workflow creates all 9 steps

**Time: Monday 9:30 AM**
1. Admin opens Step 1 (PO Details)
2. Assigns to John (PO Coordinator)
3. John receives notification
4. John logs in and completes the PO verification
5. John clicks "Complete Step"
6. System auto-advances to Step 2

**Time: Monday 10:00 AM**
1. Admin reviews Step 2 (Sales Details)
2. Assigns to Sarah (Sales Manager)
3. Sarah gets notification
4. Sarah verifies sales terms and completes step

**Time: Monday 10:30 AM - ... continues for all 9 steps**

## Status Indicators

### Order Status (Left Column)
- `Pending`: Not yet processed
- `Approved`: Ready for production
- `In Progress`: Currently being worked on
- `Completed`: All work done
- `Delivered`: Delivered to customer

### Workflow Status (Middle Column)
- `Not started`: Workflow not initialized
- `In Progress`: Actively being worked on (shows which step)
- `Completed`: All 9 steps finished
- `On Hold`: Paused
- `Cancelled`: Cancelled

### Progress Bar
Shows visual completion percentage:
- 0% = Just started
- 50% = Halfway through
- 100% = All steps complete

## Viewing Completed Steps

After completing a step:
- Step shows with ✓ checkmark
- View: Completion time, assigned employee, notes
- Cannot edit completed steps
- Audit history shows all changes

## Common Tasks

### Reject a Step
```
If an employee's work needs revision:
1. Open the step
2. Click "Reject Step" (in future versions)
3. Add rejection reason
4. Step returns to employee for fixes
5. Employee notified of rejection
```

### View Step History
```
To see all changes for a step:
1. Click "Step History" 
2. See: Old status, new status, timestamp, who changed it
3. View all notes and reasons for changes
```

### Export Workflow Report
```
To get a summary:
1. Click "Download Report"
2. Get PDF with:
   - All step statuses
   - Assignment info
   - Completion times
   - Notes and comments
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `→` | Next step |
| `←` | Previous step |
| `1-9` | Jump to step |
| `Esc` | Close wizard |
| `Ctrl+S` | Save notes |

## Tips & Best Practices

### For Admins
- ✓ Assign clear responsibilities
- ✓ Set realistic timelines
- ✓ Review audit trail regularly
- ✓ Use notes for important instructions
- ✓ Follow up on delayed steps

### For Employees
- ✓ Check notifications regularly
- ✓ Upload required documents promptly
- ✓ Add notes for your work
- ✓ Complete steps thoroughly
- ✓ Ask for clarification if needed

### General
- ✓ Use consistent naming for orders
- ✓ Document all changes via notes
- ✓ Don't skip steps even if empty
- ✓ Verify before completing
- ✓ Keep audit trail clean

## Troubleshooting

### Can't find the wizard?
- Check URL: `/admin/sales-orders-management`
- Make sure you're logged in as admin
- Refresh the page

### Employee didn't receive notification?
- Check if employee exists in system
- Verify employee email is set
- Check notification settings

### Document upload failing?
- Check file size (max 10MB)
- Verify file format is allowed
- Check browser console for errors

### Step won't complete?
- Fill all required fields
- Ensure assignment is made first
- Check for validation errors

### Can't see my task?
- Log out and back in
- Check your dashboard
- Look for notifications
- Contact admin if still missing

## Support

For help:
1. Check the full guide: `SALES_ORDER_WIZARD_GUIDE.md`
2. Review audit trail for step details
3. Check notifications for status updates
4. Contact your system administrator

---

**Ready to use?** Start by visiting: `http://localhost:5173/admin/sales-orders-management`
