# Registration Testing Guide

## Quick Test Page

Visit: **`http://localhost:3000/test-registration`**

This comprehensive test page will automatically:

### ✅ What It Tests

1. **Authentication Check**
   - Verifies you're logged in
   - Shows current user information

2. **Sample Image Creation**
   - Creates 4 colored test images (front, back, left, right)
   - Calculates total image size

3. **Session Storage Test**
   - Tests storing draft with images
   - Verifies read/write operations work
   - Shows storage size

4. **Draft Creation**
   - Creates a complete draft with provenance
   - Tests JSON serialization
   - Validates all fields

5. **API Registration**
   - Sends actual registration request
   - Tests hash generation
   - Shows detailed error messages if fails

6. **Verification Test**
   - Verifies the newly registered antique
   - Checks if provenance was saved
   - Confirms blockchain entry

### 🎯 How to Use

1. Make sure dev server is running: `npm run dev`
2. Navigate to `/test-registration`
3. Click **"Run Full Test Suite"**
4. Watch the test results appear
5. Expand "Show Details" for more information

### 🔍 Reading Results

- ✅ **Green** = Test passed
- ⚠️ **Yellow** = Warning (may not be critical)
- ❌ **Red** = Test failed (this is the problem!)

### 📊 What to Look For

If registration fails, check which test shows ❌:

- **Sample Images Failed** → Browser canvas API issue
- **Session Storage Failed** → Storage quota exceeded or disabled
- **Draft Creation Failed** → JSON serialization issue
- **API Registration Failed** → Check the error details:
  - "storage error" → Database connection issue
  - "missing image" → Image data not sent correctly
  - "invalid json" → Request format issue
  - Check the "detail" field for specific error

### 🛠️ Debug Pages

**Two debug tools available:**

1. **`/test-registration`** - Full automated test suite (use this first!)
2. **`/debug-storage`** - Inspect session storage details

### 📝 After Testing

If tests pass but normal registration fails:
1. Check browser console (F12 → Console)
2. Check Network tab (F12 → Network → Filter: Fetch/XHR)
3. Check server terminal for errors
4. Compare test request with your actual request

### 🧹 Cleanup

Click **"Clear Test Data"** to remove test antiques from storage.

Note: Test will create a REAL antique in your database with name like "Test Antique 1731234567890"

### 💡 Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Session Storage Failed | Quota exceeded | Clear storage or use smaller images |
| API Registration - "storage error" | Database connection | Check .env.local has correct POSTGRES_URL |
| API Registration - "missing image" | Image data format | Check base64 encoding is correct |
| Verification Failed | Blockchain entry missing | Check database constraints |

### 🔗 Related Files

- Test Page: `src/app/test-registration/page.jsx`
- Debug Page: `src/app/debug-storage/page.jsx`
- API Route: `src/app/api/antiques/register/route.js`
- Database: `src/lib/db.js`
- Hash: `src/lib/hash.js`

### 📞 Need Help?

After running tests, provide:
1. Screenshot of test results
2. Browser console errors (if any)
3. Server terminal output (if any)
4. Any red ❌ test details (click "Show Details")
