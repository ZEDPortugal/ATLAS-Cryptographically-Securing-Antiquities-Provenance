# Provenance Implementation Debug Guide

## Overview
This document outlines the provenance tracking implementation and debugging steps.

## Changes Made

### 1. Registration Form (`src/app/register/page.jsx`)
**Status:** ✅ Complete
- Added 6 new state variables for provenance fields
- Added provenance form section with inputs
- **FIXED:** Images now stored in the draft object in session storage (prevents "storage error")

### 2. Preview Page (`src/app/register/preview/page.jsx`)
**Status:** ✅ Complete
- Updated draft state to include provenance fields
- Added provenance display section
- Sends provenance data to API endpoint
- **IMPROVED:** Better error messages with details from API

### 3. API Route (`src/app/api/antiques/register/route.js`)
**Status:** ✅ Complete
- Accepts provenance parameter from request body
- Passes provenance to saveAntique function
- **IMPROVED:** Better logging with provenance field details

### 4. Database Layer (`src/lib/db.js`)
**Status:** ✅ Complete
- Added `provenance JSONB` column to antiques table
- Updated saveAntique to handle provenance parameter
- Updated getAntique to return provenance field

### 5. Hash Library (`src/lib/hash.js`)
**Status:** ✅ Complete
- computeMultiModalHash accepts provenance parameter
- Generates provenance_digest using SHA3-256
- Includes provenance in combined hash

### 6. Verify Page (`src/app/verify/page.jsx`)
**Status:** ✅ Complete
- Added provenance display section
- Shows all 6 provenance fields when available
- Styled with emerald theme matching blockchain aesthetic

## Data Flow

```
Registration Form
  ↓ (Session Storage with images)
Preview Page
  ↓ (POST /api/antiques/register)
API Route
  ↓ (computeMultiModalHash + saveAntique)
Database (Postgres)
  ↓ (Query by hash)
Verify Page
```

## Common Issues & Solutions

### Issue 1: "storage error" in preview
**Cause:** Session storage quota exceeded (usually ~5-10MB limit)
**Solution:** 
- ✅ FIXED: Images now stored in the draft object directly
- If still occurring: Try smaller image files or compress them

### Issue 2: Provenance not showing on verify page
**Possible Causes:**
1. Antique registered before provenance implementation
2. Database migration not run
3. provenance field is null/empty

**Debug Steps:**
1. Visit `/debug-storage` to check session storage
2. Check browser console for API errors
3. Check server console for database errors
4. Verify database has provenance column

### Issue 3: Cannot register antique at all
**Debug Steps:**
1. Open browser DevTools → Console tab
2. Open preview page
3. Click "Generate hash"
4. Check for errors in console
5. Check Network tab → Look for `/api/antiques/register` request
6. Check Response tab for error details

## Debug Tools

### 1. Storage Debug Page
Navigate to `/debug-storage` to see:
- Storage quota and usage
- Draft information and size
- Provenance fields status
- All session storage keys

### 2. Browser Console
Check for JavaScript errors:
- Right-click → Inspect
- Console tab
- Look for red error messages

### 3. Network Tab
Monitor API requests:
- Right-click → Inspect
- Network tab
- Filter by "Fetch/XHR"
- Click on request to see details

### 4. Server Logs
Check terminal running `npm run dev`:
- Look for 📝, 🔐, 💾, ✅, ❌ emoji markers
- Error details include stack traces in development

## Testing Checklist

### ✅ Before Registering
- [ ] Browser DevTools open (Console + Network tabs)
- [ ] Terminal with `npm run dev` visible
- [ ] Images are reasonable size (< 1MB each recommended)

### ✅ During Registration
- [ ] Fill all required fields (name + 4 images)
- [ ] Fill optional provenance fields
- [ ] Click "Next" → Should navigate to preview
- [ ] Verify provenance shows on preview
- [ ] Click "Generate hash"
- [ ] Watch console and network for errors

### ✅ After Registration
- [ ] Should redirect to QR page with hash
- [ ] Test verification with the hash
- [ ] Provenance should appear on verify page

## Database Schema

### Antiques Table
```sql
CREATE TABLE antiques (
  hash VARCHAR(255) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  images JSONB NOT NULL,
  created_at BIGINT NOT NULL,
  combined_hash VARCHAR(128),
  image_phash VARCHAR(128),
  text_sig TEXT,
  provenance_digest VARCHAR(128),
  provenance JSONB  -- NEW FIELD
)
```

### Provenance Structure
```json
{
  "origin": "Estate Sale",
  "previousOwners": "John Doe\nJane Smith",
  "dateAcquired": "2025-11-01",
  "materialAge": "Bronze, 18th century",
  "condition": "excellent",
  "authenticity": "Certified by expert"
}
```

## Next Steps for Debugging

1. **Visit `/debug-storage`** - Check if draft data is being stored
2. **Clear storage if needed** - Use the clear buttons on debug page
3. **Try registering with small images** - Test with compressed JPEGs
4. **Check server console** - Look for database errors or hash computation errors
5. **Check browser console** - Look for JavaScript errors or failed requests

## Environment Variables

Ensure you have:
```env
POSTGRES_URL=your_vercel_postgres_url
POSTGRES_PRISMA_URL=your_prisma_url
POSTGRES_URL_NON_POOLING=your_non_pooling_url
POSTGRES_USER=default
POSTGRES_HOST=your_host
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=verceldb
```

## Contact Points

If still stuck, check:
1. `/debug-storage` page output
2. Browser console error messages  
3. Server terminal error messages
4. Network tab request/response details

Provide these details when asking for help!
