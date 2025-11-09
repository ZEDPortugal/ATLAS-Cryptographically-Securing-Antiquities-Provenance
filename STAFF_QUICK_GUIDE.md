# Quick Reference: Sharing Verification Access with Buyers

## 🎯 Quick Steps

### 1. Generate Code (30 seconds)
1. Login to ATLAS staff portal
2. Click **"Staff Control"** in navigation
3. Select expiration time (default: 48 hours)
4. Click **"Generate Code"**
5. Copy the code (e.g., `K7M9-P3XY`)

### 2. Share with Buyer
Send them these two things:

**📧 Email Template:**
```
Subject: ATLAS Verification Access

Hello,

You've been granted access to verify artifacts in our ATLAS system.

Verification Link: https://atlas-cryptographically-securing-an.vercel.app/verify-secure
Access Code: K7M9-P3XY

Instructions:
1. Click the link above
2. Enter the access code
3. You can now scan QR codes or enter artifact hashes to verify authenticity

This code expires in 48 hours.

If you have any questions, please contact us.

Best regards,
[Museum Name]
```

**📱 SMS Template:**
```
ATLAS verification access:
Link: atlas-cryptographically-securing-an.vercel.app/verify-secure
Code: K7M9-P3XY
Expires: 48hrs
```

### 3. That's It!
- Buyer can use the code multiple times
- No account creation needed
- Code automatically expires
- You can see usage in the staff panel

---

## 💡 Tips

### When to Use Different Expiration Times

- **1 hour** - Quick viewing appointment
- **6 hours** - Same-day auction preview
- **24 hours** - Day-of-sale verification
- **48 hours** - Default for most buyers
- **72 hours** - Multi-day auction event
- **1 week** - Extended exhibition or research period

### Security Best Practices

✅ **DO:**
- Generate new codes for different buyers
- Use shorter expiration for sensitive items
- Clean up expired codes regularly
- Monitor usage statistics

❌ **DON'T:**
- Share codes publicly (social media, websites)
- Reuse old codes
- Give indefinite access
- Share staff login credentials

---

## 🔄 Common Workflows

### Auction House
```
1. Buyer requests to verify lot #123
2. Staff generates 6-hour code
3. Send code via email
4. Buyer verifies during preview
5. Code expires after preview period
```

### Private Sale
```
1. Potential buyer interested in item
2. Staff generates 48-hour code
3. Share code during negotiation
4. Buyer verifies at their convenience
5. Code expires after sale window
```

### Museum Exhibition
```
1. Visitor asks about artifact authenticity
2. Staff generates 1-hour code
3. Give code on-site
4. Visitor verifies immediately
5. Code expires after visit
```

---

## 📊 Monitoring Usage

Check your access codes panel to see:
- ✅ How many times a code was used
- ⏰ When it was last accessed
- 📅 Time remaining before expiration
- ❌ Which codes have expired

**Pro tip:** High usage count might indicate the code was shared with multiple people.

---

## 🆘 Troubleshooting

### Buyer says "Invalid or expired access code"

**Check:**
1. Has the code expired? (Check expiration time)
2. Did they type it correctly? (Send again to copy-paste)
3. Are they at the right URL? (`/verify-secure` not `/verify`)

**Solution:**
- Generate a new code if expired
- Send the code via copy-paste method (email, not phone dictation)
- Verify they're using the correct link

### Code not working immediately after generation

**Wait 1-2 seconds** - The system needs a moment to save the code. If it still doesn't work, check browser console for errors.

---

## 📞 Quick Contact

Having issues? Check:
- `/admin/access-codes` - Code management panel
- `ACCESS_CODES.md` - Full documentation
- System logs - For technical errors

---

*Keep this guide handy for quick reference when sharing verification access!*
