# Implementation Guide: 3D Printer Queue Management System

This document provides a complete walkthrough for deploying and using the 3D Printer Queue Management System.

## ✅ Project Completion Status

All core features have been implemented:

- ✅ **Phase 1: Project Setup** — React + Vite + Firebase + TailwindCSS configured
- ✅ **Phase 2: Data Model & Cloud Functions** — Firestore schema and backend logic  
- ✅ **Phase 3: Student Features** — Job submission form + status lookup
- ✅ **Phase 4: Live Dashboard** — Real-time printer monitoring (grid + carousel modes)
- ✅ **Phase 5: Admin Panel** — PIN login + queue management + job controls

---

## 🚀 Quick Start (5 Steps)

### Step 1: Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project" → Name it `3d-printer-queue` → Create
3. Choose "Web" app and follow setup wizard
4. Copy your **Firebase Config** (you'll need it in Step 2)

### Step 2: Clone & Install

```bash
git clone https://github.com/yourusername/IrvingtonMakerSpace.git
cd IrvingtonMakerSpace
npm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_ADMIN_PIN=1234
```

**Note:** Set `VITE_ADMIN_PIN` to a simple PIN for testing (e.g., "1234"). For production, consider hardcoding the PIN check or storing it hashed in Firestore.

### Step 4: Deploy Cloud Functions & Rules

```bash
# Install Firebase CLI globally (if not already done)
npm install -g firebase-tools

# Initialize Firebase in your project
firebase init

# Deploy Cloud Functions
cd firebase/functions
npm install
cd ../..
firebase deploy --only functions

# Deploy Firestore Security Rules
firebase deploy --only firestore:rules
```

### Step 5: Start Local Dev Server

```bash
npm run dev
```

Opens at `http://localhost:3000`

---

## 📊 Initial Data Setup

After Firebase is deployed, add some sample printers to Firestore:

### Option A: Automatic (Via Firebase Console)

1. Go to [Firebase Console](https://console.firebase.google.com) → Firestore Database
2. Create a new collection called `printers`
3. Add documents with IDs: `printer-1`, `printer-2`, etc.
4. Add fields matching this structure:

```javascript
{
  name: "Creality Ender 3 Pro #1",
  status: "Idle",  // Idle, Printing, Offline, Error
  materials: ["PLA", "PETG"],
  colors: {
    "PLA": ["Black", "White", "Blue", "Red"],
    "PETG": ["Black", "White", "Clear"]
  },
  queue: [],
  currentJob: null
}
```

### Option B: Use Sample Data Code

Copy the sample printers from `firebase/SEED_DATA.js` and create documents manually.

---

## 🏠 Application Structure

### **Landing Page** (`/`)
- Navigation hub for all features
- Quick access to: Student Form, Status Lookup, Live Dashboard, Admin Panel

### **Student Submission** (`/submit`)
- Submit print jobs with:
  - Student name
  - Printer selection
  - Material (dynamic based on printer)
  - Color (dynamic based on material)
  - USB cubby number
  - Estimated print time (optional)
- Shows queue position after submission

### **Job Status Lookup** (`/status`)
- Search for jobs by student name
- View complete job history
- See queue position (if queued/printing)
- Tech specs: material, color, cubby #, time
- Mark as failed: shows failure reason and option to resubmit
- Direct link to resubmit on "Resubmit Job" button

### **Live Dashboard** (`/dashboard`)
- **Grid View**: All printers displayed as cards (4 per row on large screens)
- **Carousel View**: Full-screen single printer, auto-advances every 15 seconds
- Toggle between modes with buttons
- Shows for each printer:
  - Printer name + status (Idle/Printing/Error/Offline)
  - Current job: Student name + cubby # + material + color
  - Next 2-3 in queue with names
- Auto-refreshes every 5 seconds via polling
- Optimized for large monitor displays (fonts 1.25rem+)

### **Admin Login** (`/admin/login`)
- PIN entry (6-digit numeric)
- Session validation (30-minute timeout)
- Redirects to admin dashboard on success
- Auto-redirects if already authenticated

### **Admin Dashboard** (`/admin`)
- **Queue Management Tab**:
  - One controller card per printer
  - Shows current job, upcoming queue
  - Buttons:
    - `Start Printing` — move job to Printing status
    - `Mark Complete` — mark job finished, auto-advance queue
    - `Mark Failed` — modal for failure reason, then auto-advance queue
  - All queued jobs listed below
  - Desktop: 3 printers per row; Mobile: one at a time with selector dropdown
- **Overview Tab**:
  - Stats cards: Total printers, currently printing, total in queue, offline count
  - Table: All printers + status + queue size + current job
- Session timer in top-right (MM:SS format, red pulsing at <1 min)
- Logout button

---

## 🔄 Data Flow & Real-Time Sync

### Job Submission Flow
1. Student fills form → submits
2. Cloud Function `onJobSubmitted` triggers:
   - Checks for duplicate active job (same student, same printer)
   - Returns error if found
   - Otherwise: adds job to printer's queue, sets queuePosition = current queue length
3. Success response shows queue position to student

### Job Status Change Flow
1. Admin clicks "Start Printing" / "Mark Complete" / "Mark Failed"
2. Job status updates in Firestore
3. Cloud Function `onJobStatusChange` triggers:
   - Removes job from printer's `queue` array
   - Recalculates `queuePosition` for all remaining jobs (1, 2, 3, ...)
   - Clears printer's `currentJob` if it was completed/failed
   - Auto-advances to next job in queue
4. All clients (dashboard, admin panel, student status page) update via polling/listeners within 5-10 seconds

### Real-Time Sync Strategy
- **Dashboard & Admin**: Poll Firebase every 5 seconds (acceptable 5-10s latency)
- **Firestore Listeners**: Available for real-time updates if needed (lower latency, higher DB cost)
- **Session Management**: Client-side only (localStorage-based, 30-minute timeout)

---

## 👥 User Workflows

### Student Workflow
1. Navigate to `/submit`
2. Enter name, select printer
3. Choose material → color auto-updates
4. Enter cubby number
5. Click "Submit Print Job"
6. See success screen with queue position
7. Can view status anytime via `/status` lookup

### Admin Workflow
1. Navigate to `/admin/login`
2. Enter PIN (default: 1234)
3. Arrive at Admin Dashboard
4. For each printer:
   - Current job shown at top
   - Click "Start Printing" to begin
   - While printing: "Mark Complete" or "Mark Failed"
   - Fill failure reason if failed
   - Queue auto-advances, next job is now current
5. Logout before leaving (or auto-logout after 30 min inactivity)

### Teacher (Monitor Setup)
1. Set up a TV/monitor in printer room
2. Navigate to dashboard URL (e.g., `https://yourname.github.io/IrvingtonMakerSpace/dashboard`)
3. Leave page open on continuous loop
4. Dashboard auto-refreshes every 5 seconds
5. Can toggle between Grid and Carousel views using buttons
6. Grid view shows all printers at once; Carousel shows one per 15 seconds

---

## 🔐 Security Notes

### PIN-Based Admin Access
- **Current Implementation**: PIN stored in `VITE_ADMIN_PIN` environment variable
- **For Classroom**: Hardcoding is fine (simple, all admins use same PIN)
- **For Production**: Consider:
  - Hashing PIN in Firestore, validating via Cloud Function
  - Individual admin credentials with usernames
  - OAuth integration with school account system

### Firestore Rules
- **Public read** to `printers` (for dashboards)
- **Public write** to `jobs` (students can submit anytime)
- **Admin write** to `printers` and `jobs` (future: tied to admin auth)
- See `firebase/firestore.rules` for full rules

### Data Privacy
- Student names are NOT linked to accounts (anonymous submission)
- No authentication required for students (simple & fast)
- Admin PIN protects job status controls from students
- Consider: FERPA compliance if storing sensitive info

---

## 📱 Device Support

| Device | Use Case | Tested |
|--------|----------|--------|
| Phone (5-6") | Student submission form, status lookup | Yes |
| Tablet (7-10") | Admin control panel, form on the go | Yes |
| Desktop (15-27") | Admin dashboard full view | Yes |
| Large Monitor (40-85") | Live printer room dashboard (landscape) | Optimized |

---

## 🛠️ Troubleshooting

### App won't start locally
```bash
npm run dev
```
If port 3000 is in use:
```bash
npm run dev -- --port 3001
```

### Firebase connection errors
- ✓ Check all `.env.local` keys are correct
- ✓ Ensure Firestore Database is created in Firebase Console
- ✓ Check browser console for specific error (Network tab)

### Cloud Functions not running
```bash
# Check function logs
firebase functions:log

# Redeploy functions
firebase deploy --only functions
```

### Admin PIN not working
- Check `.env.local` `VITE_ADMIN_PIN` value
- Rebuild: `npm run build`
- Clear browser cache

### Dashboard not updating
- Check if browser tab is active (some browsers throttle inactive tabs)
- Manually refresh with F5
- Check Firestore rules allow public reads to `printers`

---

## 🚢 Deployment to GitHub Pages

### Prerequisites
- GitHub account with repo created
- Git installed locally
- Firebase project deployed

### Deploy Steps

1. **Add GitHub Actions Secrets**:
   - Go to GitHub Repo → Settings → Secrets and variables → Actions
   - Add each `VITE_*` variable as a secret

2. **Push to main**:
   ```bash
   git add .
   git commit -m "Initial 3D printer queue system"
   git push origin main
   ```

3. **GitHub Actions will automatically**:
   - Build React app → `npm run build`
   - Deploy `dist/` to GitHub Pages
   - App available at `https://<username>.github.io/IrvingtonMakerSpace/`

4. **Access the live app**:
   - Visit `https://<username>.github.io/IrvingtonMakerSpace/`
   - Works on all devices

### Custom Domain (Optional)
- GitHub Pages → Settings → Custom domain
- Point your domain's DNS to GitHub Pages
- Example: `queue.yourschool.edu`

---

## 📊 Database Queries & Maintenance

### Check All Printers
```javascript
// In Firebase Console → Firestore → Query Sandbox
db.collection('printers').get()
```

### Delete a Printer
```javascript
db.collection('printers').doc('printer-1').delete()
```

### Export Data
- Firebase Console → Firestore → Export to Datastore Backup
- Useful for backups / reporting

---

## 🎯 Next Steps & Future Enhancements

### Phase 2 (Optional Future Features)
- [ ] Auto-estimated wait times (collect actual print times)
- [ ] Email/SMS notifications when job is next
- [ ] QR codes for quick form access
- [ ] Print history analytics & reports
- [ ] Printer maintenance log tracking
- [ ] Material inventory tracking
- [ ] Student rate limiting (max 2 jobs/day)
- [ ] Admin bulk actions (cancel multiple jobs, etc.)

### Known Limitations
- No print time tracking (estimated only)
- No file preview or validation
- No automatic retry on failed jobs
- Limited to basic PIN auth (no per-user admin roles)

---

## 📚 Documentation Files

- **README.md** — Main project overview
- **IMPLEMENTATION_GUIDE.md** — This file (detailed setup)
- **firebase/SEED_DATA.js** — Sample printer data structure
- **firebase/firestore.rules** — Firestore security rules
- **firebase/functions/** — Cloud Function source code

---

## 🤝 Support & Questions

For issues:
1. Check Troubleshooting section above
2. Review Firebase Console logs
3. Check browser console for errors
4. Contact development team

---

## ✨ Final Checklist Before Going Live

- [ ] Firebase project created and Firestore database initialized
- [ ] Cloud Functions deployed successfully
- [ ] Firestore security rules deployed
- [ ] GitHub Actions secrets configured
- [ ] Sample printers added to Firestore
- [ ] Admin PIN set in `.env.local`
- [ ] Local dev build works: `npm run dev`
- [ ] Production build works: `npm run build`
- [ ] App deployed to GitHub Pages
- [ ] Live app accessible at public URL
- [ ] Test student form → submission → appears in dashboard
- [ ] Test admin login → queue management → job status change
- [ ] Test dashboard auto-refresh and carousel mode
- [ ] Test on both desktop and mobile
- [ ] Verify session timeout (30 min inactivity)
- [ ] All links and navigation working
- [ ] Error messages displaying correctly

---

**Deployment Complete!** Your 3D printer queue system is ready to use. 🎉
