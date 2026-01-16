# Deployment Security Guide

## 1. Infrastructure
- **Hosting**: Firebase Hosting (CDN, SSL default).
- **Backend**: Firebase Cloud Functions v2.
- **Database**: Firestore (Native Mode).

## 2. Environment Variables
### Frontend (`.env`)
- `VITE_FIREBASE_*`: Safe to expose (public config).
- **CRITICAL**: Do NOT put `VITE_GEMINI_API_KEY` here.

### Backend (Functions)
Set secrets using the CLI:
```bash
firebase functions:secrets:set GEMINI_API_KEY
```
Verify they are accessed via `process.env.GEMINI_API_KEY` or `defineSecret`.
Our function uses `secrets: ["GEMINI_API_KEY"]` configuration.

## 3. Source Maps
To prevent exposing source code, ensure `vite.config.js` disables source maps in production:
```js
export default defineConfig({
  build: {
    sourcemap: false // Default is false, but explicit is better
  }
})
```
