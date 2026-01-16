# Security Launch Checklist

## 1. Secrets & Env Vars
- [ ] **Scan**: Verified no secrets in `src/` or `git history`.
- [ ] **.env**: `VITE_GEMINI_API_KEY` removed. `GEMINI_API_KEY` set in Functions environment secrets.
- [ ] **.gitignore**: Includes `.env`, `firebase-debug.log`, `*.pem`, `serviceAccountKey.json`.

## 2. API Security
- [ ] **Gemini Proxy**: All AI calls go through `functions/index.js`.
- [ ] **Auth Check**: Proxy verifies `request.auth` before calling AI.
- [ ] **Input Validation**: Proxy checks prompt length and type.

## 3. Database Rules (Firestore)
- [ ] **Least Privilege**: `read/write` restricted to owner (`request.auth.uid`).
- [ ] **Schema Validation**: `isValidTool()` enforces types and string lengths.
- [ ] **Shared Stacks**: Public read, but authenticaticated create with schema checks.

## 4. Frontend Hardening
- [ ] **XSS**: No `dangerouslySetInnerHTML` usage found.
- [ ] **Deps**: `npm audit` passing (0 vulnerabilities).
- [ ] **Build**: Source maps disabled in `vite.config.js` (TODO).

## 5. Deployment
- [ ] **Functions**: Deploy with `firebase deploy --only functions`.
- [ ] **Secrets**: Set secret with `firebase functions:secrets:set GEMINI_API_KEY`.
- [ ] **Hosting**: Deploy app with `firebase deploy --only hosting`.
