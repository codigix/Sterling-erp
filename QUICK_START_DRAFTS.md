# Sales Order Drafts - Quick Start

## 🚀 3-Step Setup

### Step 1: Create Database Table
Open terminal in `backend` folder and run:

```bash
node createDraftsTable.js
```

You should see:
```
✓ sales_order_drafts table created successfully!
```

### Step 2: Restart Backend
```bash
npm run dev
```

### Step 3: Test It!
1. Go to **Sales Orders** page
2. Click **"Create Sales Order"**
3. Fill in **Step 1** details (PO Number, Client Name, etc.)
4. Click **Next** 
5. You should see **"Saving..."** indicator appear in the header
6. After 3 seconds, it changes to **"Saved"** ✓

## ✨ Features Now Available

### Auto-Save (Every 30 seconds)
- Form auto-saves while you fill it
- See "Saving..." indicator in header

### Manual Save (On any step after Step 1)
- Click **"Save Draft"** button
- Saves immediately

### Draft Recovery (Form Load)
- If draft exists, see popup dialog
- Choose: **"Continue Draft"** or **"Start Fresh"**
- Resumes from exact step you left off

### Auto-Delete (On Submit)
- When you submit the order
- Draft is automatically deleted

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Route not found" error | Backend wasn't restarted. Run `npm run dev` |
| Table doesn't exist | Run `node createDraftsTable.js` |
| No "Saving..." indicator | Check browser console (F12) for errors |
| Draft not loading | Clear browser cache and refresh |

## 📚 More Details
See `DRAFT_FEATURE_SETUP.md` for detailed API documentation and advanced configuration.

## ✅ You're All Set!
The draft feature is now fully integrated. Users can now save their progress and resume anytime!
