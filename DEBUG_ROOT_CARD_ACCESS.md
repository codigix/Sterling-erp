# Root Card 21 Access Debugging

## Issue
Root card 21 appears in dropdown but returns 403 when selected

## Root Causes Fixed
1. ✅ Type mismatch: `userId` converted to int throughout
2. ✅ Null safety: Added checks for null assigned_to/assigned_worker values
3. ✅ Project name: Now displays in dropdown
4. ✅ Access logic: Now checks both sales order steps AND manufacturing stages

## Remaining Investigation

To find the real cause, check your database:

### Check Current User ID
```javascript
// Your current user ID can be found in browser DevTools:
// Open Console and check localStorage
console.log(localStorage.getItem('user')); // or similar auth storage
```

### Check Root Card 21 Data
```sql
-- 1. Does root card 21 exist and have a project?
SELECT id, project_id, code, title FROM root_cards WHERE id = 21;

-- 2. Does the project have a sales order?
SELECT id, name, sales_order_id FROM projects WHERE id = (SELECT project_id FROM root_cards WHERE id = 21);

-- 3. What sales order steps exist for this project's sales order?
SELECT id, step_id, assigned_to, status FROM sales_order_steps 
WHERE sales_order_id = (SELECT sales_order_id FROM projects WHERE id = (SELECT project_id FROM root_cards WHERE id = 21));

-- 4. What manufacturing stages are assigned to root card 21?
SELECT id, assigned_worker, stage_name FROM manufacturing_stages WHERE root_card_id = 21;

-- 5. Your current user ID
SELECT id, username FROM users WHERE username = 'your_username';
```

## Hypothesis
Root card 21 might:
- Have no manufacturing stages assigned to you
- Have a project with no sales_order_id
- Have unassigned sales order steps
- Be filtered into dropdown due to a query bug, but no actual assignment exists

## Next Steps
1. Run the SQL queries above
2. Share the results
3. We can then pinpoint the exact cause
