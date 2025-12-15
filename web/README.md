# Private Chat - End-to-End Encrypted Web Chat App

A production-ready, full-stack web chat application with end-to-end encryption, built with Next.js and powered by secure APIs ready for future mobile integration.

## Features

- **End-to-End Encryption**: All messages encrypted client-side using AES-256-GCM. Server stores only encrypted data.
- **Web Application**: Modern Next.js web interface with real-time messaging
- **QR Login Ready**: Backend APIs prepared for QR-based mobile authentication (Phase 2)
- **Offline Support**: Messages queue locally and sync automatically when reconnected
- **Backup & Restore**: Export/import full chat history as JSON backup
- **Session Management**: Automatic token refresh every 15 minutes with secure HTTP-only cookies
- **Security**: PBKDF2-SHA256 key derivation, bcryptjs password hashing, secure JWT tokens, Redis-backed QR tokens

## Architecture

### Tech Stack
- **Frontend (Web)**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (user accounts, messages, sessions)
- **Cache**: Redis (QR tokens for future mobile, session management)
- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2-SHA256)
- **Authentication**: JWT + Refresh Tokens, HTTP-only cookies

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Redis instance (local or Upstash)
- npm or yarn

### Installation & Setup

```bash
# Install dependencies
npm install
```
# Create environment file
cp .env.example .env.local
```
# Configure environment variables in .env.local:
# MONGODB_URI=mongodb://localhost:27017/private-chat
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-super-secret-jwt-key
# REFRESH_TOKEN_SECRET=your-super-secret-refresh-key
# NEXT_PUBLIC_API_URL=http://localhost:3000
```
# Run development server
```
npm run dev
```

Access at `http://localhost:3000`

## Usage Guide

### Register a New Account
1. Visit `http://localhost:3000`
2. Click "Get Started" or navigate to `/auth/register`
3. Enter email and password (min 8 characters)
4. Click "Create Account"
5. You'll be redirected to the chat page

### Login
1. Visit `/auth/login`
2. Enter your email and password
3. Click "Sign In"
4. Access your encrypted chat

### Send Messages
1. Navigate to `/chat` after login
2. Type a message in the input box
3. Click Send or press Enter
4. Message is encrypted client-side and sent to server
5. Appears instantly in your chat
6. Works offline - messages queue and sync automatically

### Backup Your Messages
1. Go to `/settings/backup`
2. Click "Export Backup" to download JSON file
3. File contains all decrypted messages with timestamps
4. To restore: Click "Import Backup" and select JSON file

### Auto-Sync & Offline Support
- Messages sync every 30 seconds automatically
- Click refresh button to manually sync
- All messages cached locally in browser
- When offline, messages queue locally
- Auto-sync resumes when back online

## Security & Encryption

### End-to-End Encryption Flow
1. **Master Key Derivation**: 
   - Password + encryption salt → PBKDF2-SHA256 (100,000 iterations) → 256-bit master key
   - Salt generated once per user during registration

2. **Message Encryption**:
   - User's plaintext message → AES-256-GCM with random IV → ciphertext
   - Only ciphertext + IV sent to server

3. **Key Storage**:
   - Master key derived on-the-fly when needed
   - Never stored on server
   - Cached in browser localStorage (encrypted session)

4. **QR Login (Future Mobile)**:
   - Web generates QR token (Redis, 60-second TTL)
   - QR contains: token, master key (base64), API URL
   - Mobile scans QR and logs in instantly
   - Same encryption key used on mobile

### Security Features
- **Passwords**: Hashed with bcryptjs (10 salt rounds)
- **Access Tokens**: 15-minute JWT expiry for security
- **Refresh Tokens**: Stored in HTTP-only cookies (web), hashed in MongoDB
- **Sessions**: One per device, can logout from any device
- **CORS & XSS**: Protected with secure headers
- **QR Tokens**: Single-use, 60-second TTL, Redis-backed

## API Endpoints

All endpoints require `Authorization: Bearer <access_token>` header (except auth routes).

### Authentication Endpoints

**POST /api/auth/register**

Request:
```json
{ "email": "user@example.com", "password": "password123" }
```
Response: 
```json
{ "accessToken": "...", "user": { "id": "...", "email": "...", "encryptionSalt": "..." } }
```

**POST /api/auth/login**

Request: 
```json
{ "email": "user@example.com", "password": "password123" }
```
Response: 
```json
{ "accessToken": "...", "user": { "id": "...", "email": "...", "encryptionSalt": "..." } }
```

**POST /api/auth/refresh**
Request: 
```json
{} (reads refresh token from HTTP-only cookie)
```
Response: 
```json
{ "accessToken": "..." }
```

**POST /api/auth/logout**
Request: 
```json
{}
```
Response:
```json
{ "success": true }
```

**POST /api/auth/qr-init** (For future mobile)

Request: 
```json
{}
```

Response: 
```json
{ "qrToken": "...", "qrData": "..." }
```

**POST /api/auth/qr-login** (For future mobile)
Request: 
```json
{ "token": "qr_token_here", "masterKey": "..." }
```
Response: 
```json
{ "accessToken": "...", "refreshToken": "...", "user": {...} }
```

### Message Endpoints

**POST /api/messages/send**
Request: 
```json
{ "ciphertext": "base64_encrypted_text", "iv": "base64_iv", "sentAt": "2025-01-01T12:00:00Z" }
```
Response: 
```json
{ "id": "message_id", "sentAt": "2025-01-01T12:00:00Z" }
```

**GET /api/messages/since?timestamp=2025-01-01T12:00:00Z**
Response:
```json
{ 
  "messages": [
    { "id": "...", "ciphertext": "...", "iv": "...", "sentAt": "...", "deviceId": "web" }
  ] 
}
```

## Database Schema

### users collection
```javascript
{
  _id: ObjectId,
  email: string,                 // unique
  passwordHash: string,          // bcryptjs hash
  encryptionSalt: string,        // base64 hex, used for PBKDF2
  createdAt: Date
}
```

### sessions collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,              // reference to users
  deviceId: string,              // "web" or "mobile"
  refreshTokenHash: string,      // bcryptjs hash
  createdAt: Date,
  expiresAt: Date                // 7 days
}
```

### messages collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,              // reference to users
  deviceId: string,              // "web" or "mobile"
  ciphertext: string,            // base64 AES-256-GCM ciphertext
  iv: string,                    // base64 IV
  sentAt: Date,
  createdAt: Date
}
```

### Redis keys
- `qr_login:{token}` → `{ userId, createdAt }` (TTL: 60 seconds)

## Environment Variables

Create `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/private-chat
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-change-this
REFRESH_TOKEN_SECRET=your-refresh-secret-change-this
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## How It Works: Token Refresh

1. User logs in → receives 15-minute access token + refresh token (HTTP-only cookie)
2. Every 13-14 minutes, browser silently calls `POST /api/auth/refresh`
3. Server validates refresh token from cookie
4. Returns new access token
5. User never sees the refresh, continues seamlessly
6. If refresh fails, user redirected to login

## How It Works: Offline Sync

1. User types and sends message while offline
2. Message encrypted and stored in browser localStorage (marked as "unsynced")
3. When online, message automatically sent to server
4. Message marked as "synced"
5. Every 30 seconds, app fetches new messages from server
6. New messages decrypted and added to chat

## Backup & Restore

### Export
- Downloads JSON file with all messages (decrypted)
- Format: `{ version, exportedAt, messages: [...] }`
- Used for local backup or data portability

### Restore
- Imports JSON backup file
- Merges with existing messages (deduplicates by ID)
- Sorts chronologically
- Useful for device migration or recovery

## Future: React Native Mobile App

APIs are ready for mobile integration:
- QR login endpoints implemented and tested
- Same encryption on mobile using Web Crypto API equivalents
- Message sync uses same `messages/` endpoints
- All auth flows support mobile deviceId

To add React Native mobile (Phase 2):
1. Create React Native app with Expo
2. Use same APIs pointing to web backend
3. Implement QR scanner with `expo-camera`
4. Use same encryption library for key derivation
5. AsyncStorage for local caching

## Development

### Build for Production
```bash
npm run build
npm run start
```

### Environment for Production
- Use production MongoDB and Redis instances
- Generate strong JWT secrets (min 32 chars)
- Set `NEXT_PUBLIC_API_URL` to your domain
- Use HTTPS only
- Set `NODE_ENV=production`

## Performance Optimizations
- Messages cached in localStorage to reduce API calls
- Automatic 30-second sync reduces real-time overhead
- HTTP-only cookies prevent XSS token theft
- JWT short expiry (15m) limits token exposure
- Redis TTL prevents QR token proliferation

## Technologies Used
- **Next.js 16**: Full-stack React framework
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **MongoDB**: NoSQL document database
- **Redis**: In-memory cache
- **jsonwebtoken**: JWT creation/verification
- **bcryptjs**: Password hashing
- **Web Crypto API**: Client-side encryption

## Debugging

Enable debug logs by setting in browser console:
```javascript
localStorage.setItem('DEBUG', '1')
```

Check Network tab in DevTools for API calls and response times.

## Support & Feedback

For issues, feature requests, or contributions, please open an issue on the repository.

---

**Last Updated**: December 2025  
**Version**: 1.0  
**Status**: Production Ready - Web Version Complete  
