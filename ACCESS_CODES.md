# Access Code System - Documentation

## Overview

The ATLAS Access Code System provides **time-limited, secure verification access for buyers and collectors** without requiring full system accounts. Staff can generate temporary access codes that buyers use to access the verification portal.

---

## 🎯 Key Features

- ✅ **No buyer accounts needed** - Frictionless verification
- ✅ **Time-limited codes** - Automatic expiration (1 hour to 1 week)
- ✅ **Easy to share** - Format: `XXXX-XXXX` (no confusing characters)
- ✅ **Usage tracking** - Monitor how often codes are used
- ✅ **Staff-controlled** - Only authenticated staff can generate codes
- ✅ **Session persistence** - Buyers stay authorized during browser session

---

## 📋 How It Works

### For Museum Staff

1. **Navigate to Access Codes Panel**
   - Go to `/admin/access-codes` or click "Staff Control" in the navigation
   - Requires staff login

2. **Generate a New Code**
   - Select expiration time (default: 48 hours)
   - Click "Generate Code"
   - Copy the generated code (e.g., `K7M9-P3XY`)

3. **Share with Buyer**
   - Send the verification portal link: `https://atlas-cryptographically-securing-an.vercel.app/verify-secure`
   - Provide the access code via email, SMS, or in person
   - Code can be used multiple times until expiration

4. **Monitor Usage**
   - View all active and expired codes
   - See usage count for each code
   - Track when codes were last used
   - Cleanup expired codes with one click

### For Buyers/Collectors

1. **Receive Access**
   - Get link and access code from museum staff
   - Example: Link: `https://atlas-cryptographically-securing-an.vercel.app/verify-secure` + Code: `K7M9-P3XY`

2. **Enter Portal**
   - Click the link
   - Enter the access code in the form
   - Click "Access Portal"

3. **Verify Antiques**
   - Once authorized, full verification interface is available
   - Upload QR codes from certificates
   - Enter antique hashes manually
   - View complete blockchain records and images
   - No time limit during session (as long as code hasn't expired)

---

## 🔧 Technical Details

### File Structure

```
src/
├── lib/
│   └── accessCodes.js           # Core access code management logic
├── app/
    ├── api/
    │   └── access-codes/
    │       ├── generate/route.js  # Generate new codes
    │       ├── validate/route.js  # Validate codes
    │       └── list/route.js      # List & cleanup codes
    ├── admin/
    │   └── access-codes/
    │       └── page.jsx           # Staff management panel
    └── verify-secure/
        └── page.jsx               # Buyer verification portal

data/
└── access-codes.json              # Code storage (auto-created)
```

### API Endpoints

#### `POST /api/access-codes/generate`
Generate a new access code.

**Request:**
```json
{
  "expirationHours": 48,
  "createdBy": "staff-username"
}
```

**Response:**
```json
{
  "success": true,
  "code": "K7M9-P3XY",
  "expiresAt": 1731366529000,
  "expirationHours": 48
}
```

#### `POST /api/access-codes/validate`
Validate an access code.

**Request:**
```json
{
  "code": "K7M9-P3XY"
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "code": {
    "code": "K7M9-P3XY",
    "createdAt": 1731193729000,
    "expiresAt": 1731366529000,
    "createdBy": "staff",
    "usageCount": 1,
    "lastUsed": 1731193800000
  }
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "reason": "Code not found"
}
```

#### `GET /api/access-codes/list`
List all access codes (staff only).

**Response:**
```json
{
  "success": true,
  "codes": [
    {
      "code": "K7M9-P3XY",
      "createdAt": 1731193729000,
      "expiresAt": 1731366529000,
      "createdBy": "staff",
      "usageCount": 5,
      "lastUsed": 1731200000000
    }
  ]
}
```

#### `DELETE /api/access-codes/list`
Cleanup expired codes.

**Response:**
```json
{
  "success": true,
  "removed": 3
}
```

---

## 🔒 Security Features

### Code Generation
- **Random generation** using cryptographically secure random integers
- **No confusing characters** (excludes I, O, 0, 1, L)
- **8 characters + hyphen** format for easy typing and reading

### Expiration
- **Automatic validation** - Expired codes are instantly rejected
- **Configurable duration** - 1 hour to 1 week
- **No manual intervention** - System handles expiration automatically

### Session Management
- **Browser session persistence** - Authorized buyers don't re-enter code on refresh
- **Automatic cleanup** - SessionStorage cleared when browser closes
- **Re-validation** - Checks code validity on page load

### Access Control
- **Staff-only generation** - Code creation requires authentication
- **Public validation** - Buyers can validate codes without login
- **Usage tracking** - Monitor suspicious activity

---

## 📊 Use Cases

### 1. Auction Houses
- Generate codes for potential bidders
- Share verification link (`https://atlas-cryptographically-securing-an.vercel.app/verify-secure`) in auction catalog
- Buyers verify authenticity before bidding
- Codes expire after auction ends

### 2. Private Sales
- Create code for specific buyer
- Send code via secure channel
- Buyer verifies during negotiation period
- Code expires after sale window

### 3. Museum Exhibitions
- Generate codes for visitors/researchers
- Display link at exhibition
- Visitors verify antiques on-site
- Codes valid for exhibition duration

### 4. Collector Networks
- Share codes with verified collectors
- Enable peer-to-peer verification
- Track which collectors verify items
- Maintain exclusivity through controlled access

---

## 🎨 Customization Options

### Expiration Times
Edit in `/admin/access-codes/page.jsx`:
```jsx
<option value={1}>1 hour</option>
<option value={24}>24 hours</option>
<option value={168}>1 week</option>
// Add more options
```

### Code Format
Edit in `/lib/accessCodes.js`:
```javascript
function generateCode() {
  // Modify character set
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  // Modify length
  for (let i = 0; i < 8; i++) {
    // Your logic
  }
}
```

### Single-Use Codes
Modify validation logic in `/lib/accessCodes.js`:
```javascript
export async function validateAccessCode(code) {
  // ...existing logic...
  
  // Add single-use restriction
  if (accessCode.used) {
    return { valid: false, reason: 'Code already used' };
  }
  
  // Mark as used
  accessCode.used = true;
  // ...
}
```

---

## 🚀 Future Enhancements

### Potential Features
- [ ] **Email integration** - Auto-send codes to buyers
- [ ] **QR codes** - Generate QR for verification link + code
- [ ] **Rate limiting** - Prevent brute-force attempts
- [ ] **IP restrictions** - Limit access to specific networks
- [ ] **Notifications** - Alert staff when codes are used
- [ ] **Analytics** - Detailed usage reports
- [ ] **Code pools** - Pre-generate codes for events
- [ ] **Custom expiration** - Per-code expiration times

---

## 🧪 Testing

Run automated tests:
```bash
node test-access-codes.js
```

Manual testing:
1. Login as staff at `/login`
2. Navigate to `/admin/access-codes`
3. Generate a test code
4. Open `/verify-secure` in incognito window
5. Enter the code
6. Verify an antique

---

## 📞 Support

### Common Issues

**Q: Code not working for buyer?**
- Check if code has expired
- Verify code was typed correctly (case-insensitive)
- Ensure buyer is at `/verify-secure` not `/verify`

**Q: Can't generate codes?**
- Ensure you're logged in as staff
- Check browser console for errors
- Verify `data/` directory exists and is writable

**Q: Codes not persisting?**
- Check `data/access-codes.json` exists
- Verify file permissions
- Check server logs for write errors

---

## 🔗 URLs Reference

- **Staff Panel:** `/admin/access-codes`
- **Buyer Portal:** `/verify-secure`
- **Staff Login:** `/login`
- **Regular Verify:** `/verify` (requires login)

---

*Last Updated: November 9, 2025*
