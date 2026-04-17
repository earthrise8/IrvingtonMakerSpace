# 3D Printer Queue Management System

A web-based queue management system for high school maker spaces, built with React + Firebase. Allows students to submit print jobs, track queue position, and helps admins manage multiple 3D printers efficiently.

## Features

- ✅ **Student Job Submission**: Simple form to submit print jobs with material, color, and cubby number
- ✅ **Real-time Queue Tracking**: Live queue position updates
- ✅ **Live Dashboard**: Full-screen monitoring view for printer room displays
- ✅ **Admin Control Panel**: Manage job statuses, reorder queues, configure printers
- ✅ **Job History**: Track completed and failed jobs
- ✅ **Responsive Design**: Works on phones, tablets, and large monitors

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Firebase (Firestore + Cloud Functions)
- **Hosting**: GitHub Pages
- **Authentication**: PIN-based admin access

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account (free tier sufficient)
- GitHub account with Pages enabled

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/IrvingtonMakerSpace.git
   cd IrvingtonMakerSpace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Firestore database
   - Set up Cloud Functions
   - Copy Firebase config to `.env.local`

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_ADMIN_PIN=1234
   ```

5. **Deploy Cloud Functions**
   ```bash
   cd firebase/functions
   npm install
   firebase deploy --only functions
   ```

6. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

7. **Run locally**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000`

8. **Build for production**
   ```bash
   npm run build
   ```

### GitHub Pages Configuration

1. **Enable GitHub Actions Secrets** (for automated deployment)
   - Go to Settings → Secrets and variables → Actions
   - Add all `VITE_*` environment variables as secrets

2. **Push to main branch**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```
   - GitHub Actions automatically builds and deploys to Pages
   - Access at `https://yourusername.github.io/IrvingtonMakerSpace`

## Data Model

### Collections

#### `printers/`
```javascript
{
  id: "printer-1",
  name: "Creality E3 Pro",
  status: "Idle", // Idle, Printing, Offline, Error
  materials: ["PLA", "PETG", "ABS"],
  colors: {
    "PLA": ["Black", "White", "Blue", "Red"],
    "PETG": ["Black", "White", "Clear"]
  },
  queue: ["job-1", "job-2", "job-3"],
  currentJob: "job-1", // Active printing job ID
  timestamp: Date
}
```

#### `jobs/`
```javascript
{
  id: "job-1",
  studentName: "Alice Johnson",
  printerId: "printer-1",
  material: "PLA",
  color: "Blue",
  cubbySNumber: 42,
  estimatedTime: 120, // minutes
  status: "Queued", // Queued, Printing, Completed, Failed
  queuePosition: 1,
  failureReason: null, // Set when status = Failed
  timestamp: Date
}
```

#### `config/admin`
```javascript
{
  adminPinHash: "hashed_pin",
  lastUpdated: Date
}
```

## Firestore Security Rules

Rules are located in `firebase/firestore.rules`. Key permissions:

- **Public read** to `printers` (for dashboards)
- **Public write** to `jobs` (students submit jobs)
- **Admin write** to `printers` and `jobs` (manage queue)
- **Authentication**: PIN validated on client; typically admin claims set via Cloud Functions

## Cloud Functions

### `onJobSubmitted` (Firestore trigger)
Fires when new job created:
- Checks for duplicate active jobs per student
- Adds job to printer queue
- Sets initial queue position

### `onJobStatusChange` (Firestore trigger)
Fires when job status updated:
- Removes completed/failed jobs from queue
- Recalculates queue positions
- Updates printer's `currentJob`

**Deployment:**
```bash
cd firebase/functions
npm install
firebase deploy --only functions
```

## Admin Panel

### Access
- Navigate to `/admin/login`
- Enter shared PIN (configured in `VITE_ADMIN_PIN`)

### Controls
- **Start Next Job**: Advance queue, mark current as printing
- **Mark Complete**: Finish job, auto-advance queue
- **Mark Failed**: Fail job with reason, auto-advance queue
- **Reorder Queue**: Drag jobs or use arrow buttons
- **Configure Printers**: Edit materials, colors, status

### Session
- 30-minute timeout after last activity
- Stored in localStorage
- Auto-logout redirects to login

## Usage Workflows

### Student Submission
1. Go to `/submit`
2. Enter name, select printer
3. Choose material (updates available colors)
4. Select color
5. Enter USB cubby number
6. Submit
7. See queue position on confirmation screen

### Live Dashboard
1. Go to `/dashboard`
2. View all printers and current jobs
3. See next 2-3 students in queue per printer
4. Auto-refreshes every 5-10 seconds
5. Color-coded status badges

### Admin Management
1. Login with PIN
2. View all printers and queues
3. Start printing next job
4. Mark complete or failed
5. Reorder queue if needed
6. Manage printer configurations

## Project Structure

```
IrvingtonMakerSpace/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── StudentSubmission.jsx
│   │   ├── StudentStatus.jsx
│   │   ├── Dashboard.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AdminDashboard.jsx
│   ├── components/
│   │   ├── PrinterCard.jsx
│   │   ├── QueueController.jsx
│   │   ├── PrinterConfiguration.jsx
│   │   └── FormFields/
│   ├── services/
│   │   ├── firebaseService.js
│   │   └── authService.js
│   ├── hooks/
│   │   └── useRealtimeUpdates.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── firebase/
│   ├── firestore.rules
│   ├── functions/
│   │   ├── onJobSubmitted.js
│   │   ├── onJobStatusChange.js
│   │   └── package.json
├── .github/workflows/
│   └── deploy.yml
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── package.json
├── .env.example
└── README.md
```

## Development

- `npm run dev` - Start dev server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Firestore database initialized
- [ ] Cloud Functions deployed
- [ ] Security rules deployed
- [ ] GitHub Actions secrets added
- [ ] Build passes locally
- [ ] Test student job submission
- [ ] Test admin controls
- [ ] Test dashboard real-time updates
- [ ] Verify job failure and resubmission flow

## Troubleshooting

### Build fails with Firebase config errors
- Ensure all `VITE_FIREBASE_*` variables in `.env.local`
- Firebase config must be public (API keys are client-side)

### GitHub Pages not updating
- Check GitHub Actions log for build failures
- Verify `gh-pages` branch exists
- Confirm Pages source is set to `github-actions`

### Real-time updates not working
- Check Firestore connection in browser console
- Verify security rules allow reads
- Check network tab for Firestore requests

### Cloud Functions not triggering
- Deploy functions: `firebase deploy --only functions`
- Check Firebase Console for function logs
- Verify trigger collection names match

## Optional Features (Phase 2+)

- Auto-estimated wait times
- Student notifications (email/SMS)
- QR code for quick access
- Print history analytics
- Time tracking and reports
- Printer maintenance logs
- Material inventory tracking

## License

MIT - Use freely in your makerspace

## Support

For issues or questions, open GitHub Issue or contact the development team.
