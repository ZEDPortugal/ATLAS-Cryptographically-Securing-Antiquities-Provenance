# Bug Fixes for Antique Registration and Verification

## Issues Found and Fixed

### 1. **Database Schema Parameter Mismatch in `db.js`**
**Problem:** The `Block` class constructor received `antique_hash` (snake_case) but the `appendBlock` function was passing `antiqueHash` (camelCase) directly to the constructor without the proper parameter mapping.

**Fix:** Updated `appendBlock` to explicitly pass the parameter with the correct snake_case naming:
```javascript
const block = new Block({ 
  index, 
  timestamp, 
  antique_hash: antiqueHash,  // Use snake_case parameter name
  owner, 
  previousHash 
});
```

### 2. **Missing Owner Information in Registration**
**Problem:** The registration API route was using the antique's `name` as the blockchain `owner`, which is incorrect. The owner should be the authenticated user who is registering the antique.

**Fixes Applied:**
- Updated `src/app/api/antiques/register/route.js` to accept an `owner` parameter
- Modified `src/app/register/preview/page.jsx` to:
  - Import `useAuth` hook
  - Extract authenticated user information
  - Pass user's name as `owner` in the registration request

### 3. **Base64 Image Data Parsing Improvement**
**Problem:** The image hash computation in `hash.js` used `split(',')[1]` which would throw an error if the comma wasn't present (already pure base64).

**Fix:** Added conditional check:
```javascript
const base64Data = imageData.includes(',') 
  ? imageData.split(',')[1] 
  : imageData;
```

### 4. **Data Consistency Issues**
**Problems Identified:**
- Old `artifacts.json` vs new `antiques.json` naming
- Legacy `blockchain.js` file using `artifactHash` instead of `antiqueHash`
- Mixed terminology throughout the codebase

**Status:** These are legacy files that aren't currently used (the app uses PostgreSQL), but should be cleaned up for clarity.

## Verification Checklist

Before registering an antique, ensure:
1. ✅ PostgreSQL database is running
2. ✅ Database tables are initialized (`npm run db:init` or automatic on first API call)
3. ✅ User is logged in (AuthContext provides user information)
4. ✅ All 4 images (front, back, left, right) are uploaded
5. ✅ Images are valid base64-encoded data
6. ✅ Environment variables in `.env.local` are correct

## Testing the Fixes

### Test Registration Flow:
1. Login with a user account
2. Navigate to `/register`
3. Upload all 4 required images
4. Fill in name and description
5. Click "Next" to preview
6. Click "Generate hash" to submit
7. Check console for any errors
8. Verify QR code is generated with the hash

### Test Verification Flow:
1. Navigate to `/verify`
2. Paste the hash from registration OR upload QR code image
3. Click "Check"
4. Verify that:
   - Block information is displayed
   - Antique name and description match
   - All 4 images are shown correctly
   - Owner name matches the user who registered it

## Database Schema Reference

### `antiques` table:
- `hash` (PRIMARY KEY) - Combined multi-modal hash
- `name` - Antique name
- `description` - Antique description
- `images` - JSONB containing all 4 images with data and type
- `created_at` - Timestamp (bigint)
- `combined_hash`, `image_phash`, `text_sig`, `provenance_digest` - Hash components

### `blockchain` table:
- `id` (SERIAL PRIMARY KEY)
- `index` - Block index
- `timestamp` - Block timestamp (bigint)
- `antique_hash` - Foreign key to antiques(hash)
- `owner` - Name of user who registered
- `previous_hash` - Previous block's hash
- `hash` - Current block hash

### Foreign Key Constraint:
The blockchain table has a foreign key constraint requiring the antique to exist before a blockchain entry can be created. This is why `saveAntique` must be called BEFORE `appendBlock`.

## Common Errors and Solutions

### Error: "Missing image(s): front, back, left, right"
**Cause:** Images not properly loaded from draft cache or sessionStorage
**Solution:** Ensure all images are uploaded before clicking Next

### Error: "storage error" / Database constraint violation
**Cause:** Foreign key constraint fails or duplicate hash
**Solution:** 
- Check database connection
- Verify antique doesn't already exist
- Check that saveAntique completes before appendBlock

### Error: "Unable to cache the draft"
**Cause:** SessionStorage quota exceeded (usually with large images)
**Solution:** Compress images or use smaller file sizes (< 2MB per image recommended)

### Verification returns "not_found"
**Cause:** Hash doesn't exist in database
**Solution:** 
- Verify hash is correct (128 characters hex string)
- Check if registration completed successfully
- Query database directly to verify: `SELECT * FROM antiques WHERE hash = 'YOUR_HASH';`

## Next Steps

1. ✅ All critical bugs fixed
2. 🔄 Test registration with real images
3. 🔄 Test verification flow
4. 📝 Consider adding better error messages for users
5. 📝 Add loading states during hash computation (can take a few seconds with Jimp)
6. 🧹 Clean up legacy files (blockchain.js, antiqueStore.js) if not needed
