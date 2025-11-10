# Production Debugging Checklist

## Quick Diagnostics

Visit your deployed site at: `/api/diagnostics`

This endpoint will show:
- ✅ Environment variables present
- ✅ Database connection status
- ✅ Tables existence
- ✅ Record counts

## Step-by-Step Debugging

### Step 1: Check Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify these variables exist:
   - `POSTGRES_URL` ✓
   - `REGISTER_SECRET` ✓
   - `SALT` ✓
   - `NEXT_PUBLIC_DEV_ACCESS_KEY` ✓

5. Click **Redeploy** after adding variables

### Step 2: Check Neon Database

1. Go to https://console.neon.tech
2. Select your database
3. Check status - should be **Active** (not paused)
4. Go to **Connection Details**
5. Verify connection string matches `POSTGRES_URL` in Vercel

### Step 3: View Function Logs

1. Vercel Dashboard → Your Project
2. Click **Deployments**
3. Click on latest deployment
4. Click **Functions** tab
5. Look for these messages:

#### Registration Success:
```
📝 Antique registration request received
🔐 Computing multi-modal hash...
✅ Hash computed: 1a2b3c4d...
🔄 Initializing database...
✅ Database initialization complete
💾 Saving antique to database...
✅ Antique saved to database
📦 Adding blockchain entry for owner: [name]
✅ Blockchain entry created, block index: X
```

#### Verification Success:
```
🔍 Verification request received
🔍 Verifying hash: 1a2b3c4d...
🔄 Ensuring database is initialized...
✅ Database initialization complete
🔎 Searching blockchain for hash...
Blockchain entry found: YES
✅ Found blockchain entry, fetching antique details...
Antique found: YES
```

### Step 4: Common Error Messages

#### Error: "Database initialization failed"

**Logs show:**
```
❌ Error initializing database:
relation "antiques" does not exist
```

**Solution:**
The build script didn't run. Manually trigger:
1. Add a file to force rebuild
2. Redeploy from Vercel Dashboard
3. Or SSH and run: `npm run db:init` (not available on Vercel Hobby)

**Alternative:**
The `/api/diagnostics` or any API call will auto-create tables now.

#### Error: "foreign key constraint"

**Logs show:**
```
insert or update on table "blockchain" violates foreign key constraint
```

**Cause:** Blockchain entry created before antique saved

**Solution:** Already fixed in latest code. Redeploy.

#### Error: "Request body too large"

**Logs show:**
```
PayloadTooLargeError: request entity too large
```

**Solution:**
- Images are too large (>4.5MB total)
- Compress images before upload
- Use JPEG instead of PNG
- Target 500KB per image

#### Error: "connect ETIMEDOUT"

**Logs show:**
```
Error: connect ETIMEDOUT
at Connection._handleConnectTimeout
```

**Cause:** Cannot reach Neon database

**Solutions:**
1. Check Neon database is not paused
2. Verify connection string includes `sslmode=require`
3. Check Neon IP allowlist (if set)
4. Wait and retry (temporary network issue)

#### Error: "password authentication failed"

**Logs show:**
```
error: password authentication failed for user "neondb_owner"
```

**Solution:**
- Connection string password is wrong
- Update `POSTGRES_URL` in Vercel
- Get fresh connection string from Neon Console
- Redeploy

### Step 5: Test with Minimal Data

Use this curl command to test with tiny images:

```bash
curl -X POST https://your-app.vercel.app/api/antiques/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "description": "Test",
    "images": {
      "front": {"data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "type": "image/png"},
      "back": {"data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "type": "image/png"},
      "left": {"data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "type": "image/png"},
      "right": {"data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "type": "image/png"}
    },
    "owner": "Test Owner"
  }'
```

Expected response:
```json
{
  "status": "ok",
  "hash": "f5a5fd42d16a20302798ef6ed309979b43003d2320d9f0e8ea9831a92759fb4b",
  "block": {
    "index": 0,
    "timestamp": 1699632000000,
    "antiqueHash": "...",
    "owner": "Test Owner",
    "previousHash": "",
    "hash": "..."
  }
}
```

### Step 6: Browser Developer Tools

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Attempt registration
4. Click on the failed request
5. Check:
   - **Status code** (should be 200)
   - **Response body** (error details)
   - **Request payload** (is it complete?)

### Step 7: Verify Database State

If you have Neon's SQL Editor access:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check antiques
SELECT hash, name, created_at FROM antiques;

-- Check blockchain
SELECT index, antique_hash, owner FROM blockchain;

-- Check for orphaned entries
SELECT b.antique_hash 
FROM blockchain b 
LEFT JOIN antiques a ON b.antique_hash = a.hash 
WHERE a.hash IS NULL;
```

## Image Size Optimization

### Before Upload (Client-Side)

Add this to the registration page:

```javascript
function compressImage(file, maxSizeMB = 0.5) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Resize if too large
        const maxDim = 1920;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height *= maxDim / width;
            width = maxDim;
          } else {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.8);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```

## Final Checklist

- [ ] Environment variables set in Vercel
- [ ] Neon database is active (not paused)
- [ ] Connection string includes `sslmode=require`
- [ ] `/api/diagnostics` shows all green
- [ ] Tables exist (check via diagnostics)
- [ ] Images are compressed (<1MB each)
- [ ] Function logs show successful operations
- [ ] Browser console has no errors
- [ ] Registration returns hash successfully
- [ ] Verification finds the registered hash

## Still Not Working?

1. **Delete and recreate deployment**
   - Sometimes Vercel caches issues
   - Go to Deployments → [...] → Delete
   - Push code again to trigger new deployment

2. **Check build logs**
   - Vercel Dashboard → Deployments → [Deployment] → Building
   - Look for migration script errors

3. **Test in development**
   - Clone repo fresh
   - Run `npm install`
   - Create `.env.local` with Neon connection string
   - Run `npm run dev`
   - Test locally with production database

4. **Create new Neon database**
   - Sometimes databases get corrupted
   - Create fresh database in Neon Console
   - Update `POSTGRES_URL` in Vercel
   - Redeploy

## Contact Support

If all else fails:
- Vercel Support: https://vercel.com/support
- Neon Support: https://neon.tech/docs/introduction/support
- Check Vercel Status: https://www.vercel-status.com
- Check Neon Status: https://neonstatus.com
