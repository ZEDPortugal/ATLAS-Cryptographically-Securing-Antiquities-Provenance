# Dashboard Overview Fix

## Problem
The dashboard overview was showing "—" or "..." for all statistics because the API was calling non-existent functions:
- `getAllAntiques()` - didn't exist in any module
- `getChainHeight()` - didn't exist in db.js

The API route was also importing from the wrong module (`@/lib/antiqueStore` which is a legacy file for file-based storage).

## Solution

### 1. Added Missing Functions to `src/lib/db.js`

#### `getAllAntiques()`
```javascript
export async function getAllAntiques() {
  const result = await sql`
    SELECT hash, name, description, created_at, combined_hash, image_phash, text_sig, provenance_digest
    FROM antiques
    ORDER BY created_at DESC
  `;
  return result.rows.map(row => ({
    hash: row.hash,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    combinedHash: row.combined_hash,
    imagePhash: row.image_phash,
    textSig: row.text_sig,
    provenanceDigest: row.provenance_digest,
  }));
}
```

#### `getAntiqueCount()`
```javascript
export async function getAntiqueCount() {
  const result = await sql`
    SELECT COUNT(*) as count FROM antiques
  `;
  return parseInt(result.rows[0].count, 10);
}
```

#### `getChainHeight()`
```javascript
export async function getChainHeight() {
  const result = await sql`
    SELECT COUNT(*) as count FROM blockchain
  `;
  return parseInt(result.rows[0].count, 10);
}
```

### 2. Updated Dashboard Stats API Route

**File:** `src/app/api/dashboard-stats/route.js`

**Before:**
```javascript
import { getAllAntiques } from '@/lib/antiqueStore'  // Wrong - legacy file
import { getChainHeight } from '@/lib/db'  // Function didn't exist

// Complex filtering logic that didn't work
const antiques = await getAllAntiques()
const totalAntiques = antiques.length
const verifiedItems = antiques.filter(/* complex filter */).length
```

**After:**
```javascript
import { getAntiqueCount, getChainHeight } from '@/lib/db'  // Correct

// Simple, direct database queries
const totalAntiques = await getAntiqueCount()
const chainHeight = await getChainHeight()
const verifiedItems = totalAntiques  // All registered antiques are on blockchain
```

## Testing

✅ Server starts successfully: `npm run dev`
✅ Dashboard API responds: `GET /api/dashboard-stats 200`
✅ Statistics now display actual counts from PostgreSQL database

### Expected Dashboard Display:
- **Total Antiques**: Count of all rows in `antiques` table
- **Verified Items**: Same as total (all registered items are on blockchain)
- **Chain Height**: Count of all blocks in `blockchain` table
- **Pending**: Still showing "—" (placeholder for future feature)

## Database Queries Used

The dashboard now uses these efficient SQL queries:

```sql
-- Total Antiques
SELECT COUNT(*) as count FROM antiques;

-- Chain Height (number of blockchain blocks)
SELECT COUNT(*) as count FROM blockchain;
```

## Future Enhancements

Consider adding:
1. **Recent Activity** - Query last N blockchain entries with timestamps
2. **Pending Verification** - Add a status field to track verification states
3. **User-specific Stats** - Filter antiques by owner
4. **Time-based Analytics** - Group by day/week/month
5. **Performance Metrics** - Track registration/verification times

## Files Modified

1. ✅ `src/lib/db.js` - Added 3 new export functions
2. ✅ `src/app/api/dashboard-stats/route.js` - Fixed imports and logic

## Status

✅ **FIXED** - Dashboard overview now displays live data from PostgreSQL database
✅ **TESTED** - API returns successful 200 responses with correct data structure
✅ **VERIFIED** - No console errors, clean compile and render
