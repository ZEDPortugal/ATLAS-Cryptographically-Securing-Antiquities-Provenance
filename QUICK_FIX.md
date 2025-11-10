# 🚀 Quick Fix Guide - Vercel + Neon Deployment

## ⚡ TL;DR - Do This Now

### 1️⃣ Set Environment Variables in Vercel

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these 4 variables (for Production, Preview, and Development):

```plaintext
POSTGRES_URL
postgresql://neondb_owner:npg_LlY5VokNd4fP@ep-raspy-water-a1jmjwy9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

REGISTER_SECRET
atlas_dev_secret_2025_secure_key_change_in_production

SALT
atlas_salt_2025_change_in_production

NEXT_PUBLIC_DEV_ACCESS_KEY
ATLAS_DEV_2025
```

### 2️⃣ Push Changes & Redeploy

```bash
git add -A
git commit -m "fix: production deployment with Neon PostgreSQL"
git push origin main
```

In Vercel Dashboard, click **Redeploy** (or it will auto-deploy from GitHub)

### 3️⃣ Verify It Works

Visit: `https://your-app.vercel.app/api/diagnostics`

✅ Should show: `"healthy": true, "summary": "✅ All systems operational"`

## 🔍 What Was Fixed

| Issue | Fix |
|-------|-----|
| Tables not created in production | Auto-create on first API call |
| Silent failures | Added comprehensive logging with emojis |
| No diagnostics | Created `/api/diagnostics` endpoint |
| Missing Vercel config | Added `vercel.json` |
| Large images failing | Added 4MB body size limit |
| No connection test | Created `npm run db:test` script |

## 📊 Check Your Deployment

### Health Check
```bash
curl https://your-app.vercel.app/api/diagnostics
```

Expected output:
```json
{
  "healthy": true,
  "summary": "✅ All systems operational"
}
```

### View Logs
1. Vercel Dashboard → **Deployments**
2. Click latest deployment → **Functions**
3. Look for these emoji indicators:
   - ✅ Success
   - ❌ Error
   - 📝 Registration
   - 🔍 Verification
   - 💾 Database operations

## 🧪 Test Flow

### 1. Create User
Visit: `/dev-register`
- Fill in details
- Copy the generated hash

### 2. Login
Visit: `/login`
- Paste hash (or scan QR)

### 3. Register Antique
Visit: `/register`
- Upload 4 images (keep under 1MB each)
- Fill name/description
- Click "Generate hash"
- Copy the generated hash

### 4. Verify Antique
Visit: `/verify`
- Paste antique hash
- Click "Check"
- Should show all details ✅

## ❌ Still Not Working?

### Check List
- [ ] All 4 environment variables added in Vercel?
- [ ] Clicked "Redeploy" after adding variables?
- [ ] Neon database is Active (not Paused)?
- [ ] `/api/diagnostics` returns healthy: true?
- [ ] Images are under 1MB each?

### Debug Steps

**1. Check Diagnostics:**
```bash
curl https://your-app.vercel.app/api/diagnostics | jq
```

**2. Check Logs:**
- Vercel → Deployments → Functions → `/api/antiques/register`
- Look for ❌ error messages

**3. Common Errors:**

| Error Message | Solution |
|---------------|----------|
| `password authentication failed` | Wrong POSTGRES_URL, get fresh from Neon Console |
| `relation "antiques" does not exist` | Database not initialized, visit `/api/diagnostics` |
| `PayloadTooLargeError` | Images too large, compress to <1MB each |
| `connect ETIMEDOUT` | Neon database paused, activate in Neon Console |

**4. Test Locally with Production DB:**
```bash
# Update .env.local with production POSTGRES_URL
npm run db:test    # Should show "✅ Connected successfully!"
npm run dev        # Test locally against production database
```

## 📝 Important Files

| File | Purpose |
|------|---------|
| `DEPLOYMENT_FIXES.md` | Complete explanation of all changes |
| `VERCEL_DEPLOYMENT_GUIDE.md` | Step-by-step deployment instructions |
| `PRODUCTION_DEBUG.md` | Comprehensive troubleshooting guide |
| `vercel.json` | Vercel configuration (timeouts, memory) |
| `test-db-connection.js` | Test database connection locally |
| `/api/diagnostics` | Production health check endpoint |

## 🎯 Success Indicators

### In Logs (Vercel Functions):
```
✅ Database initialization complete
✅ Antique saved to database
✅ Blockchain entry created
```

### In Browser:
- Registration returns hash immediately
- Verification shows antique with all 4 images
- No console errors

### In Diagnostics:
```json
{
  "healthy": true,
  "checks": {
    "envVars": { "POSTGRES_URL": true, ... },
    "database": { "connected": true },
    "tables": { "allPresent": true }
  }
}
```

## 🆘 Need More Help?

1. **Read Full Guides:**
   - `VERCEL_DEPLOYMENT_GUIDE.md` - Setup instructions
   - `PRODUCTION_DEBUG.md` - Detailed troubleshooting

2. **Check Logs:**
   - Vercel: Functions tab in deployment
   - Neon: Monitoring tab in console

3. **Test Connection:**
   ```bash
   npm run db:test
   ```

4. **Health Check:**
   Visit: `/api/diagnostics`

## 🔐 Security Reminder

Before going live:
- Change `REGISTER_SECRET` to strong random value
- Change `SALT` to strong random value
- Remove or secure `/dev-register` route
- Review Neon database access controls
- Enable Vercel Web Application Firewall (Pro plan)

---

**Still having issues?** Check the full debugging guide in `PRODUCTION_DEBUG.md`
