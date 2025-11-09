# ATLAS Quick Reference Card

## 🌐 Production URLs

### Staff Access
- **Login:** https://atlas-cryptographically-securing-an.vercel.app/login
- **Staff Control Panel:** https://atlas-cryptographically-securing-an.vercel.app/admin/access-codes
- **Dashboard:** https://atlas-cryptographically-securing-an.vercel.app/

### Buyer Verification
- **Secure Portal:** https://atlas-cryptographically-securing-an.vercel.app/verify-secure
- *(Share this link with buyers along with their access code)*

---

## 📋 Quick Staff Actions

### Generate Access Code
1. Login at the staff portal
2. Click **"Staff Control"** in navigation
3. Select expiration time (default: 48 hours)
4. Click **"Generate Code"**
5. Copy code (format: `XXXX-XXXX`)

### Share with Buyer
Copy and send:
```
Verification Link: https://atlas-cryptographically-securing-an.vercel.app/verify-secure
Access Code: [PASTE CODE HERE]
```

---

## ⏰ Expiration Time Guide

| Duration | Use Case |
|----------|----------|
| 1 hour | Quick viewing appointment |
| 6 hours | Same-day auction preview |
| 24 hours | Day-of-sale verification |
| 48 hours | **Default** - Most buyers |
| 72 hours | Multi-day auction event |
| 1 week | Extended exhibition/research |

---

## 📱 SMS Template
```
ATLAS artifact verification:
https://atlas-cryptographically-securing-an.vercel.app/verify-secure
Code: [PASTE CODE]
Expires: 48hrs
```

## 📧 Email Template
```
Subject: ATLAS Verification Access

Hello,

You've been granted access to verify artifacts in our ATLAS system.

Verification Link:
https://atlas-cryptographically-securing-an.vercel.app/verify-secure

Access Code: [PASTE CODE HERE]

Instructions:
1. Click the link above
2. Enter the access code
3. Scan QR codes or enter artifact hashes to verify authenticity

This code expires in 48 hours.

Questions? Contact us at [YOUR EMAIL]

Best regards,
[YOUR ORGANIZATION]
```

---

## 🔐 Security Reminders

✅ **DO:**
- Generate new codes for different buyers
- Use shorter expiration for sensitive items
- Monitor usage statistics in Staff Control
- Clean up expired codes regularly

❌ **DON'T:**
- Share codes publicly or on social media
- Reuse old/expired codes
- Share your staff login credentials
- Give indefinite access

---

## 🆘 Troubleshooting

**Buyer says code doesn't work:**
1. Check if code expired (view in Staff Control panel)
2. Verify they're using the correct URL (`/verify-secure`)
3. Generate a new code if needed

**Can't generate codes:**
1. Ensure you're logged in as staff
2. Check your internet connection
3. Clear browser cache and try again

---

## 📞 Support

For technical issues, check:
- Staff Control Panel: `/admin/access-codes`
- Full Documentation: `ACCESS_CODES.md`
- Quick Guide: `STAFF_QUICK_GUIDE.md`

---

*Print or bookmark this page for quick reference*
*Last Updated: November 9, 2025*
