# ⚡ Quick Setup Checklist

Use this checklist to get your 3D Printer Queue System running in ~30 minutes.

## Before You Start
- [ ] Firebase account (free tier OK for classrooms)
- [ ] GitHub account
- [ ] Node.js 18+ installed
- [ ] Terminal access
- [ ] Text editor for editing config files

---

## 🚀 Setup Steps (In Order)

### 1. Create Firebase Project (5 min)
- [ ] Go to https://console.firebase.google.com
- [ ] Click "Create Project" 
- [ ] Name: `3d-printer-queue` (or your choice)
- [ ] Click "Create"
- [ ] When ready, click "Web" icon to create web app
- [ ] Copy Firebase config object (you'll need it soon)

### 2. Clone Repository (2 min)
```bash
git clone https://github.com/yourusername/IrvingtonMakerSpace.git
cd IrvingtonMakerSpace
```
- [ ] Cloned successfully

### 3. Install Dependencies (3 min)
```bash
npm install
```
- [ ] All dependencies installed (watch for any errors)

### 4. Create Environment File (3 min)
```bash
cp .env.example .env.local
```
- [ ] `.env.local` file created
- [ ] Edit `.env.local` and paste your Firebase config
- [ ] Set `VITE_ADMIN_PIN=1234` (or your choice)

**Example `.env.local`:**
```
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project
VITE_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_FIREBASE_APP_ID=1:123456:web:abc123
VITE_ADMIN_PIN=1234
```

### 5. Deploy Cloud Functions (5 min)
```bash
npm install -g firebase-tools
firebase init
cd firebase/functions
npm install
cd ../..
firebase deploy --only functions
```
- [ ] Functions deployed (check output for success)
- [ ] Check Firebase Console → Functions tab

### 6. Deploy Firestore Rules (2 min)
```bash
firebase deploy --only firestore:rules
```
- [ ] Rules deployed
- [ ] Go to Firebase Console → Firestore → Rules tab

### 7. Add Sample Printers (3 min)
Go to Firebase Console → Firestore Database:
- [ ] Create collection: `printers`
- [ ] Create documents with IDs: `printer-1`, `printer-2`, etc.
- [ ] For each printer, add fields:
  - [ ] `name`: "Creality Ender 3 Pro #1"
  - [ ] `status`: "Idle"
  - [ ] `materials`: ["PLA", "PETG"]
  - [ ] `colors`: {"PLA": ["Black", "White", "Blue"], "PETG": ["Black", "White"]}
  - [ ] `queue`: []
  - [ ] `currentJob`: null

Or use the template from `firebase/SEED_DATA.js`

### 8. Test Locally (3 min)
```bash
npm run dev
```
- [ ] Opens at http://localhost:3000
- [ ] Landing page loads
- [ ] Can click to Student Submission form
- [ ] Form shows printers and materials (not loading errors)
- [ ] Can access `/admin/login` and enter PIN 1234

### 9. Deploy to GitHub Pages (2 min)

**Option A: Manual**
```bash
npm run build
git add .
git commit -m "Deploy v1"
git push origin main
```

**Option B: Automated (GitHub Actions)**
- [ ] Go to repo Settings → Secrets and variables → Actions
- [ ] Add all `VITE_*` variables from `.env.local` as secrets
- [ ] Push to main branch
- [ ] GitHub Actions auto-deploys

### 10. Verify Live Site (2 min)
- [ ] Visit `https://yourusername.github.io/IrvingtonMakerSpace/`
- [ ] Test student form
- [ ] Test admin login with PIN 1234
- [ ] Visit dashboard

---

## ✅ Verify It's Working

### Student Submission Test
1. [ ] Go to http://localhost:3000/submit (or live URL)
2. [ ] Fill form: Name, Printer, Material, Color, Cubby #
3. [ ] Click Submit
4. [ ] See success message with queue position
5. [ ] Check dashboard — new job appears!

### Admin Control Test
1. [ ] Go to `/admin/login`
2. [ ] Enter PIN: `1234`
3. [ ] See Admin Dashboard
4. [ ] Current job shown
5. [ ] Click "Start Printing" (if job is Queued)
6. [ ] Check dashboard — job status updates

### Dashboard Test
1. [ ] Go to `/dashboard`
2. [ ] Should show all printers as cards
3. [ ] Current job displayed in blue box
4. [ ] Next queue items listed below
5. [ ] Try carousel mode (toggle button)
6. [ ] Page auto-refreshes every 5 seconds

---

## Quick Reference

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Navigation |
| Submit Job | `/submit` | Students enter print requests |
| Check Status | `/status` | Students look up their jobs |
| Dashboard | `/dashboard` | Live monitor display (TV/projector) |
| Admin Login | `/admin/login` | Enter PIN |
| Admin Control | `/admin` | Manage queues & printers |

---

## Default Credentials
- **Admin PIN**: `1234` (set in `.env.local`)
- **Session Timeout**: 30 minutes of inactivity
- **Refresh Rate**: 5 seconds (dashboard), 3 seconds (admin)

---

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| Port 3000 in use | `npm run dev -- --port 3001` |
| Firebase errors | Check `.env.local` credentials |
| Printers not showing | Add printers to Firestore first |
| Admin PIN wrong | Verify `VITE_ADMIN_PIN` in `.env.local` |
| Dashboard not updating | Refresh page or check network tab |

---

## Next: Use in Classroom

1. **Student Devices**: Direct to `/submit` via URL or QR code
2. **Teacher/Admin**: Bookmark `/admin` — enter PIN when needed
3. **Classroom Monitors**: Set `/dashboard` to full-screen, auto-refresh
4. **Projector**: Connect to TV → open dashboard → leave running

---

## ✨ Ready? Let's Go!
Start with Step 1 and you'll be live in ~30 minutes. Questions? Check README.md or IMPLEMENTATION_GUIDE.md

Good luck! 🚀
