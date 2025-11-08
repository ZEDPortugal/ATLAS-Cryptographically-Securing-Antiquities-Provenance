# Authentication System

## User Registration & Login

The ATLAS system uses a hash-based authentication system with QR codes for secure access.

### 🔒 Developer-Only Registration

**Registration is restricted to developers only.** Users cannot self-register.

#### Access the Registration Page

**URL:** `http://localhost:3000/dev-register`

**Developer Access Key:** `ATLAS_DEV_2025`

#### Registration Process (Developers Only)

1. **Navigate to**: `/dev-register`
2. **Enter Developer Access Key**: `ATLAS_DEV_2025`
3. **Create User**:
   - Full Name
   - Username (unique)
   - Company Position (e.g., Curator, Administrator)
4. **Generate Credentials**:
   - A unique hash key is generated
   - QR code is created containing the hash
   - Both are available for download
5. **Provide to User**:
   - Send the QR code image and/or hash key to the user
   - User can now login with these credentials

### Login Process (End Users)

Users receive credentials from developers and can login using **two methods**:

#### Method 1: Manual Entry
1. Enter your **username**
2. Enter your **hash key** (32-character code)
3. Click "Sign in"

#### Method 2: QR Code Upload
1. Enter your **username**
2. Click "Upload QR Code"
3. Select your QR code image
4. The hash will be automatically filled
5. Click "Sign in"

## System Architecture

### Access Levels

1. **Developers** 🔧
   - Access to `/dev-register`
   - Can create new user accounts
   - Generate QR codes and hash keys
   - Require developer access key

2. **End Users** 👤
   - Access to `/login` only
   - Receive credentials from developers
   - Cannot self-register
   - Use username + hash to authenticate

## System Protection

**All pages require authentication except:**
- `/login` - Login page (public)
- `/dev-register` - Developer registration (key-protected)

**Protected pages:**
- Dashboard (home page) - `/`
- Register (artifact registration) - `/register`
- Verify (artifact verification) - `/verify`
- Items (artifact inventory) - `/items`
- Records (provenance ledger) - `/records`
- Preview (registration preview) - `/register/preview`
- QR Code (artifact QR) - `/register/qr`

## How It Works

### Developer Registration Flow
1. Developer visits `/dev-register`
2. Enters access key: `ATLAS_DEV_2025`
3. Fills in user details (name, username, position)
4. System generates unique SHA-256 hash
5. QR code and hash key are displayed
6. Developer downloads and sends to user

### User Login Flow
1. User visits any page → redirected to `/login`
2. Enters username + hash (manual or QR upload)
3. System verifies credentials against `data/users.json`
4. On success, user info is stored in localStorage
5. User is redirected to the dashboard
6. Navigation bar appears with logout button
7. User can access all protected pages
8. Logout clears credentials and returns to login

### Data Storage
- User credentials stored in `data/users.json`
- Each user has: id, name, username, position, hash, createdAt
- Hashes are 32-character SHA-256 strings
- No passwords stored (hash-only authentication)

## Security Features

✅ **Developer-Only Registration** - Users cannot self-register
✅ **Access Key Protection** - Registration requires developer key
✅ **Hash-Based Auth** - Secure 32-char SHA-256 hashes
✅ **QR Code Support** - Easy credential distribution
✅ **Dual Login Methods** - Manual or QR upload
✅ **No Public Registration** - Controlled user creation
✅ **Protected Routes** - All pages require authentication
✅ **Persistent Sessions** - localStorage-based auth state

## Configuration

### Developer Access Key

**Current Key:** `ATLAS_DEV_2025`

**To change the key:**
1. Edit `/dev-register/page.jsx`
2. Update the `DEV_ACCESS_KEY` constant
3. Or use environment variable: `NEXT_PUBLIC_DEV_ACCESS_KEY`

**Production Recommendation:**
```javascript
const DEV_ACCESS_KEY = process.env.NEXT_PUBLIC_DEV_ACCESS_KEY || "your-secure-key";
```

## Security Notes

⚠️ **Important:** This is a demo implementation for development purposes.

In a production environment, you should:

1. **Use environment variables** - Store access key in `.env`
2. **Use a proper database** - PostgreSQL, MongoDB, etc.
3. **Hash the hash keys** - Store hashed versions
4. **Add JWT tokens** - Implement proper token-based auth
5. **Add HTTPS** - Encrypted communication only
6. **Implement rate limiting** - Prevent brute force attacks
7. **Add session timeout** - Auto-logout inactive users
8. **Enable CSRF protection**
9. **Add audit logging** - Track all authentication attempts
10. **Role-based access control** - Different permission levels
11. **Add 2FA/MFA** - Additional security layer
12. **Secure QR codes** - Add encryption or signatures
13. **IP whitelisting** - Restrict developer access by IP
14. **OAuth integration** - Enterprise SSO support

## Files Structure

```
data/
  └── users.json          # User credentials storage
src/app/
  ├── dev-register/       # Developer-only registration
  │   ├── page.jsx        # Registration form (key-protected)
  │   └── qr/
  │       └── page.jsx    # QR code display & download
  ├── user-register/      # Old public registration (deprecated)
  │   └── ...             # Keep for backward compatibility
  ├── login/
  │   └── page.jsx        # Login with hash/QR upload
  └── api/auth/
      ├── register-user/
      │   └── route.js    # User registration API
      └── login/
          └── route.js    # Login verification API
```

## Usage Example

### Developer Workflow

1. **Access Developer Portal**:
   ```
   URL: http://localhost:3000/dev-register
   Access Key: ATLAS_DEV_2025
   ```

2. **Create New User**:
   ```
   Name: Jane Smith
   Username: janesmith
   Position: Lead Curator
   → Generate Credentials
   ```

3. **Distribute Credentials**:
   ```
   - Download QR code: atlas-access-janesmith.png
   - Download key file: atlas-key-janesmith.txt
   - Send securely to Jane Smith
   ```

### User Workflow

1. **Receive Credentials** from developer

2. **Login**:
   ```
   URL: http://localhost:3000/login
   Username: janesmith
   Method 1: Upload QR code
   Method 2: Paste hash key
   → Access granted
   ```

3. **Access System**: All artifact management features available

## Support

For credential issues:
- Contact your system developer/administrator
- Developers can generate new credentials if needed
- Keep QR codes and hash keys secure
