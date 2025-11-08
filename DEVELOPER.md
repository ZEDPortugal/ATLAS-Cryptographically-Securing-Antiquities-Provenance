# Developer Guide - User Registration

## 🔒 Developer Access

This page is **restricted to developers only**. Users cannot self-register.

### Access Information

**URL:** `http://localhost:3000/dev-register`

**Access Key:** `ATLAS_DEV_2025`

## How to Register New Users

### Step 1: Access the Developer Portal

1. Navigate to: `http://localhost:3000/dev-register`
2. Enter the developer access key: `ATLAS_DEV_2025`
3. Click "Verify Access"

### Step 2: Create User Account

Fill in the user details:
- **Full Name**: User's complete name
- **Username**: Unique identifier (lowercase recommended)
- **Company Position**: Job title or role

Click "Register User"

### Step 3: Download Credentials

After registration, you'll see:
- **QR Code**: Visual representation of the hash
- **Hash Key**: 32-character alphanumeric string
- **Username**: Confirmed username

Download both:
- **QR Code Image** (PNG) - `atlas-access-{username}.png`
- **Key File** (TXT) - `atlas-key-{username}.txt`

### Step 4: Distribute to User

Securely send the credentials to the user via:
- Email (encrypted)
- Secure messaging platform
- In-person delivery
- Password-protected file share

## Key File Contents

The downloaded key file contains:
```
ATLAS Access Credentials
Username: {username}
Hash Key: {32-character-hash}
Generated: {timestamp}

Instructions:
1. Keep this hash key secure
2. Use it with your username to login
3. You can scan the QR code or enter the hash manually

Login: http://localhost:3000/login
```

## User Login Instructions (to provide to users)

Send these instructions to new users:

---

**Welcome to ATLAS!**

You've been granted access to the ATLAS Artifact Management System.

**Your Credentials:**
- Username: `{username}`
- Hash Key: `{hash}` or use the attached QR code

**To Login:**

1. Go to: `http://localhost:3000/login`
2. Enter your username
3. **Option A**: Upload the QR code image
4. **Option B**: Paste your hash key
5. Click "Sign in"

**Keep your credentials secure!** Do not share your hash key or QR code with anyone.

---

## Managing the Access Key

### Current Configuration

The access key is hardcoded in `/dev-register/page.jsx`:

```javascript
const DEV_ACCESS_KEY = "ATLAS_DEV_2025";
```

### Change the Access Key

**Option 1: Edit the file**
1. Open `/src/app/dev-register/page.jsx`
2. Update line 7: `const DEV_ACCESS_KEY = "YOUR_NEW_KEY";`
3. Save and restart the server

**Option 2: Use environment variable (recommended for production)**
1. Create `.env.local` file:
   ```
   NEXT_PUBLIC_DEV_ACCESS_KEY=your-secure-key-here
   ```
2. Update `/src/app/dev-register/page.jsx`:
   ```javascript
   const DEV_ACCESS_KEY = process.env.NEXT_PUBLIC_DEV_ACCESS_KEY || "ATLAS_DEV_2025";
   ```
3. Restart the server

## Security Best Practices

### For Developers

1. **Keep the access key secret** - Don't commit it to public repositories
2. **Use strong access keys** - Mix of letters, numbers, symbols
3. **Rotate keys regularly** - Change every 3-6 months
4. **Use environment variables** - Never hardcode in production
5. **Audit registrations** - Track who creates accounts
6. **Secure credential delivery** - Use encrypted channels
7. **Verify user identity** - Confirm before creating accounts

### For Users

Instruct users to:
1. **Keep hash keys private** - Never share with others
2. **Store QR codes securely** - Treat like passwords
3. **Use secure devices** - Login only on trusted computers
4. **Report issues immediately** - Contact if credentials compromised
5. **Don't email credentials** - Use secure storage

## Troubleshooting

### Access Key Not Working

- Verify you're using the correct key: `ATLAS_DEV_2025`
- Check for extra spaces or typos
- Ensure the key hasn't been changed in the code
- Clear browser cache and try again

### User Registration Fails

- **Username already exists**: Choose a different username
- **Missing fields**: Fill in all required fields
- **Server error**: Check terminal for error messages
- **File permissions**: Ensure `data/users.json` is writable

### QR Code Not Generating

- Check console for errors
- Ensure `qrcode` package is installed: `npm install qrcode`
- Verify hash is being passed correctly in URL
- Try refreshing the page

### User Can't Login

- Verify username is correct (case-sensitive)
- Ensure hash matches exactly (all 32 characters)
- Check if user exists in `data/users.json`
- Try generating new credentials

## Developer Commands

### View All Users
```bash
cat data/users.json
```

### Count Users
```bash
# PowerShell
(Get-Content data/users.json | ConvertFrom-Json).Count

# Linux/Mac
cat data/users.json | jq 'length'
```

### Find User by Username
```bash
# PowerShell
Get-Content data/users.json | ConvertFrom-Json | Where-Object { $_.username -eq "johndoe" }

# Linux/Mac
cat data/users.json | jq '.[] | select(.username=="johndoe")'
```

### Reset All Users (⚠️ Danger)
```bash
echo "[]" > data/users.json
```

## Production Considerations

Before deploying to production:

1. **Move to database** - Use PostgreSQL/MongoDB instead of JSON file
2. **Add authentication** - Protect `/dev-register` with proper auth
3. **Implement RBAC** - Role-based access control for developers
4. **Add audit logs** - Track all registration activities
5. **Email integration** - Automatically send credentials to users
6. **Multi-factor auth** - Require 2FA for developer access
7. **Rate limiting** - Prevent abuse of registration endpoint
8. **Input validation** - Sanitize all user inputs
9. **Backup strategy** - Regular backups of user data
10. **Monitoring** - Alert on suspicious activities

## Support

For developer support:
- Check the main `LOGIN.md` for authentication details
- Review `README.md` for project setup
- Check server logs in terminal for errors
- Ensure all dependencies are installed: `npm install`

## Quick Reference

| Action | URL | Required |
|--------|-----|----------|
| Register Users | `/dev-register` | Access Key |
| View QR Code | `/dev-register/qr` | Auto-redirect |
| User Login | `/login` | Username + Hash |
| Dashboard | `/` | Authentication |

---

**Remember:** With great power comes great responsibility. Only create accounts for authorized users!
