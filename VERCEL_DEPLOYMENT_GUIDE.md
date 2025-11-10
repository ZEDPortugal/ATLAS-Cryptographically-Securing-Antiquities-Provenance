# Vercel Deployment Guide for ATLAS with Neon PostgreSQL

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **Neon PostgreSQL Database** - Already configured in your project
3. **GitHub Repository** - Push your code to GitHub

## Step 1: Connect to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository: `ZEDPortugal/ATLAS-Cryptographically-Securing-Antiquities-Provenance`
3. Configure project settings

## Step 2: Environment Variables

⚠️ **CRITICAL**: You must add these environment variables in Vercel Dashboard

Go to: `Project Settings` → `Environment Variables`

Add the following variables:

```plaintext
POSTGRES_URL=postgresql://neondb_owner:npg_LlY5VokNd4fP@ep-raspy-water-a1jmjwy9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

REGISTER_SECRET=atlas_dev_secret_2025_secure_key_change_in_production

SALT=atlas_salt_2025_change_in_production

NEXT_PUBLIC_DEV_ACCESS_KEY=ATLAS_DEV_2025
```

### Important Notes:
- Use your Neon connection string for `POSTGRES_URL`
- The connection string should include `sslmode=require`
- Change secrets in production!
- All variables should be added for **Production**, **Preview**, and **Development** environments

## Step 3: Build Configuration

Vercel should automatically detect Next.js. Ensure these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

## Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. Once deployed, click on your domain to test

## Step 5: Initialize Database

The database tables will be created automatically on first API request. However, you can verify by:

1. Visit `/dev-register` to create first user
2. Check Vercel Function Logs for database initialization messages

## Common Issues & Solutions

### Issue 1: "Database initialization failed"

**Solution:**
1. Check that `POSTGRES_URL` is set correctly in Vercel
2. Verify Neon database is active (not paused)
3. Check Vercel Function Logs for detailed error

### Issue 2: "Cannot register antique" / "Storage error"

**Possible causes:**
1. **Database not initialized** - Tables don't exist
2. **Connection string wrong** - Check environment variables
3. **Image too large** - Vercel has 4.5MB body limit
4. **Foreign key constraint** - Antique must be saved before blockchain entry

**Solutions:**
- Check Vercel Function Logs (`Project` → `Deployments` → Click deployment → `Functions`)
- Verify environment variables are set
- Compress images before upload (keep under 1MB each)
- Ensure database tables exist

### Issue 3: "Cannot verify antique" / "Not found"

**Possible causes:**
1. Hash was never registered (registration failed silently)
2. Database connection issues
3. Hash normalization mismatch

**Solutions:**
- Check that registration completed successfully
- Verify hash is exactly 128 characters (SHA3-512)
- Check Vercel logs for database connection errors

### Issue 4: "Internal Server Error" (500)

**Debug steps:**
1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments**
4. Click on the latest deployment
5. Click **Functions** tab
6. Find the failing API route and check logs

### Issue 5: Works locally but not in production

**Common differences:**
1. **Environment variables** - Local uses `.env.local`, production uses Vercel env vars
2. **File system** - Production doesn't have writable file system
3. **PostgreSQL vs Local DB** - Ensure production uses Neon, not localhost
4. **Build-time vs Runtime** - Some code may run differently

## Debugging in Production

### View Real-Time Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click **Deployments** → Latest deployment
4. Click **Functions** tab
5. Select the function (e.g., `/api/antiques/register`)
6. View console.log output

### Test API Endpoints Directly

Using curl or Postman:

```bash
# Test registration (with small test data)
curl -X POST https://your-app.vercel.app/api/antiques/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Antique",
    "description": "Test",
    "images": {
      "front": {"data": "base64...", "type": "image/jpeg"},
      "back": {"data": "base64...", "type": "image/jpeg"},
      "left": {"data": "base64...", "type": "image/jpeg"},
      "right": {"data": "base64...", "type": "image/jpeg"}
    },
    "owner": "Test Owner"
  }'

# Test verification
curl -X POST https://your-app.vercel.app/api/antiques/verify \
  -H "Content-Type: application/json" \
  -d '{"hash": "your-hash-here"}'
```

## Performance Optimization

### Image Size Limits

Vercel has a **4.5MB request body limit**. Recommendations:

1. Compress images before upload
2. Use JPEG instead of PNG when possible
3. Resize images to reasonable dimensions (e.g., 1920x1080 max)
4. Target ~500KB per image

### Function Timeout

Default: 10 seconds on Hobby plan, 30 seconds on Pro

If hashing takes too long:
- Optimize image processing
- Reduce image size
- Consider upgrading Vercel plan

## Monitoring

### Check Database Health

1. Go to Neon Console: https://console.neon.tech
2. Select your project
3. Check **Monitoring** tab for:
   - Active connections
   - Query performance
   - Storage usage

### Check Function Metrics

1. Vercel Dashboard → Project → Analytics
2. Monitor:
   - Function invocations
   - Error rates
   - Execution duration

## Security Checklist

- [ ] Change `REGISTER_SECRET` from default
- [ ] Change `SALT` from default
- [ ] Restrict access to `/dev-register` (or remove in production)
- [ ] Enable Vercel Authentication for admin pages
- [ ] Review and secure Neon database access
- [ ] Set up proper CORS if needed
- [ ] Enable Vercel Web Application Firewall (WAF)

## Post-Deployment Testing

1. **Create User**: Visit `/dev-register`
2. **Login**: Visit `/login` with generated hash
3. **Register Antique**: Visit `/register`, fill form, upload images
4. **Verify Antique**: Visit `/verify`, paste hash from registration
5. **Check Logs**: Verify no errors in Vercel Function Logs

## Need Help?

If issues persist:
1. Check all environment variables are set correctly
2. Review Vercel Function Logs for specific errors
3. Verify Neon database is not paused
4. Test with smaller images
5. Check that build completed successfully

## Quick Reference

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Console**: https://console.neon.tech
- **Function Logs**: Project → Deployments → [Deployment] → Functions
- **Environment Variables**: Project → Settings → Environment Variables
