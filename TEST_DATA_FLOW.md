# Testing Data Flow - Debugging Guide

## Step 1: Start Backend with Logging

```bash
cd d:\passion\Sterling-erp
npm run dev
```

Watch the console output for `[ClientPO]`, `[SalesOrderDetail]`, and `[MaterialRequirements]` logs.

## Step 2: Create a New Order

1. Open Frontend: `http://localhost:5173/admin/sales-orders/new-order`
2. **Step 1**: Fill **Client Info** section ONLY:
   - PO Number: `TEST-001`
   - PO Date: `12-01-2026`
   - Client Name: `Test User`
   - Client Email: `test@example.com`
   - Client Phone: `9999999999`
3. Click "Next"
4. **Check Backend Console**: Look for logs starting with `[ClientPO]`

## Step 3: Check Logs

Expected output when Step 1 is submitted:
```
[ClientPO] Received data: {
  "poNumber": "TEST-001",
  "poDate": "12-01-2026",
  "clientName": "Test User",
  "clientEmail": "test@example.com",
  ...
  "projectRequirements": {
    "application": "...",
    "dimensions": "...",
    ...
  }
}
[ClientPO] projectRequirements type: object
[ClientPO] projectRequirements: { application: '...', dimensions: '...', ... }
```

If you see `"[object Object]"` in the logs, the issue is in frontend sending.

## Step 4: Check Database

After submitting Step 1, run:
```bash
node backend/check-order-data.js
```

Check if `project_requirements` shows as JSON or "[object Object]" string.

## Debugging Checklist

- [ ] Backend started with `npm run dev`
- [ ] Form submitted (Step 1)
- [ ] Backend logs show data being received
- [ ] Check if `projectRequirements` is object or string "[object Object]"
- [ ] Check database with `check-order-data.js`
- [ ] Identify where conversion happens

## Key Points to Check

1. **Frontend Sending**: Does axios send proper JSON objects?
2. **Backend Receiving**: Does req.body contain objects or strings?
3. **Model Storing**: Does stringifyJsonField convert properly?
4. **Database Storage**: Is data "[object Object]" or valid JSON?

## Next Steps

Once you identify where the issue is:
- If frontend: Fix axios/form state
- If backend: Fix request parsing
- If model: Fix stringifyJsonField logic

Report the backend logs and we'll fix the issue!
