# 🧪 Testing & Verification Guide

Complete this checklist to verify your 3D Printer Queue System is working correctly before deploying to production.

## Pre-Testing Checklist

- [ ] Firebase project created and Firestore database initialized
- [ ] Cloud Functions deployed: `firebase deploy --only functions`
- [ ] Firestore security rules deployed: `firebase deploy --only firestore:rules`
- [ ] Sample printers added to Firestore (at least 2-3 printers with materials/colors)
- [ ] `.env.local` configured with Firebase credentials
- [ ] Local dev server runs: `npm run dev`
- [ ] No errors in browser console

---

## Unit Testing Flows

### Test 1: Student Job Submission

**Setup:**
- [ ] Have at least 2 printers in Firestore with different materials
- [ ] Browser open to http://localhost:3000/submit

**Test Steps:**
1. [ ] Enter student name: "Alice Test"
2. [ ] Select first printer from dropdown
3. [ ] Verify material dropdown populates based on printer config
4. [ ] Select a material (e.g., "PLA")
5. [ ] Verify color dropdown updates to show colors for that material
6. [ ] Select a color
7. [ ] Enter cubby number: "42"
8. [ ] Leave estimated time empty (optional field)
9. [ ] Click "Submit Print Job"
10. [ ] Verify success screen appears with:
    - [ ] Queue position shown
    - [ ] Printer name displayed
    - [ ] Selected material and color shown
    - [ ] "Submit Another Job" and "Back to Home" buttons present

**Expected Results:**
- [ ] Job appears in Firestore under `jobs` collection
- [ ] Job has correct student name, printer, material, color, cubby
- [ ] Queue position = 1 (first job in queue)
- [ ] Job status = "Queued"
- [ ] Printer document's `queue` array includes this job's ID

**Failure Scenarios to Test:**
- [ ] Submit without student name → error message
- [ ] Submit without printer → error message
- [ ] Submit without cubby number → error message
- [ ] Cubby number with letters → rejected/sanitized to numbers only
- [ ] Submit same student name twice → should fail if first job still active

---

### Test 2: Student Status Lookup

**Setup:**
- [ ] Browser open to http://localhost:3000/status
- [ ] At least one job from Test 1 exists in Firestore

**Test Steps:**
1. [ ] Enter "Alice Test" in search box
2. [ ] Click "Search"
3. [ ] Verify results show the job submitted in Test 1 with:
    - [ ] Job ID
    - [ ] Status: "Queued"
    - [ ] Queue position: 1
    - [ ] Material and color from submission
    - [ ] Cubby number: 42
    - [ ] Submission timestamp
4. [ ] Change status in Firestore to "Printing" (via Firebase Console)
5. [ ] Search again → status should update to "Printing"
6. [ ] Change status to "Completed"
7. [ ] Search again → status shows "Completed" with green checkmark message

**Expected Results:**
- [ ] All job details display correctly
- [ ] Status updates reflect changes from admin panel
- [ ] Failed jobs show failure reason
- [ ] Failed jobs show "Resubmit Job" button (can resubmit)

---

### Test 3: Live Dashboard (Grid Mode)

**Setup:**
- [ ] Browser open to http://localhost:3000/dashboard
- [ ] At least one printer with queued jobs

**Test Steps:**
1. [ ] Verify page loads without errors
2. [ ] Check all printers display as cards
3. [ ] Verify each printer card shows:
    - [ ] Printer name (bold, large)
    - [ ] Status badge (Idle, Printing, Offline, Error)
    - [ ] Color-coded left border matching status
    - [ ] Current job info if job is printing/queued
    - [ ] Next 2-3 jobs in queue
4. [ ] Verify status colors are correct:
    - [ ] Green = Idle
    - [ ] Blue = Printing
    - [ ] Red = Error
    - [ ] Gray = Offline
5. [ ] Click "Switch to Carousel" button
6. [ ] Verify single printer displays full-screen
7. [ ] Verify carousel auto-advances every 15 seconds (observe tick changes)
8. [ ] Click "Next" / "Previous" buttons to navigate
9. [ ] Click "Switch to Grid" to return to grid view
10. [ ] Observe auto-refresh indicator (bottom right should update every 5 seconds)

**Expected Results:**
- [ ] Dashboard responsive on desktop, tablet, and phone
- [ ] Fonts readable from 10+ feet away (on large monitor)
- [ ] Auto-refresh happening every 5 seconds (check by adding job in another tab)
- [ ] Carousel smoothly cycles through printers
- [ ] No console errors

---

### Test 4: Admin Login

**Setup:**
- [ ] Browser open to http://localhost:3000/admin/login

**Test Steps:**
1. [ ] Attempt login with wrong PIN: "0000"
2. [ ] Verify error message: "Invalid PIN. Please try again."
3. [ ] PIN field should clear
4. [ ] Enter correct PIN: "1234" (or your custom PIN from `.env.local`)
5. [ ] Click "Login"
6. [ ] Verify redirect to admin dashboard
7. [ ] Verify session timer shows in top-right (MM:SS format)
8. [ ] Wait 5 minutes, verify timer counts down
9. [ ] Interact with page, verify timer resets
10. [ ] Log out, verify redirect back to login page

**Expected Results:**
- [ ] Only valid PIN grants access
- [ ] Session timeout = 30 minutes inactivity
- [ ] Session stores in sessionStorage (ephemeral, clears on browser close)
- [ ] Cannot access admin dashboard without valid session
- [ ] Direct URL navigation to `/admin` without session redirects to login

---

### Test 5: Admin Queue Management

**Setup:**
- [ ] Logged in as admin
- [ ] At least 3 jobs in queue for one printer
- [ ] Admin Dashboard "Queue Management" tab active

**Test Steps:**

#### Start Job:
1. [ ] Locate printer with queued jobs
2. [ ] Verify current job shows topmost queued job
3. [ ] Click "Start Printing" button
4. [ ] Verify job status changes to "Printing"
5. [ ] Refresh page → job still shows as "Printing"
6. [ ] Check Firestore → printer.currentJob updated to this job ID

#### Mark Complete:
1. [ ] While job is "Printing", click "✅ Mark Complete" button
2. [ ] Verify job status changes to "Completed"
3. [ ] Verify next job in queue automatically becomes current
4. [ ] Check Firestore:
    - [ ] Job removed from printer.queue array
    - [ ] Next job now has queuePosition = 1
    - [ ] All other jobs' positions decreased by 1

#### Mark Failed:
1. [ ] With a queued job, click "❌ Mark Failed"
2. [ ] Modal appears with failure reason options
3. [ ] Select a reason: "Nozzle clog"
4. [ ] Click "Confirm Failure"
5. [ ] Verify job status = "Failed"
6. [ ] Verify failureReason = "Nozzle clog" in Firestore
7. [ ] Verify queue advanced (next job is now current)
8. [ ] Search student status → can see failure reason and resubmit button

**Expected Results:**
- [ ] Queue management smooth and instant
- [ ] Queue automatically advances after Complete/Failed
- [ ] All clients see updates within 5-10 seconds
- [ ] Failure reasons captured for troubleshooting

---

### Test 6: Real-Time Sync

**Setup:**
- [ ] Two browser windows open: one showing dashboard, one showing admin
- [ ] Printer with active job

**Test Steps:**
1. [ ] Dashboard window shows current job "Alice Test - Cubby #42"
2. [ ] In admin window, mark job as Complete
3. [ ] Wait up to 10 seconds
4. [ ] Dashboard window updates to show next job
5. [ ] Cubby # and student name change
6. [ ] Repeat with "Mark Failed" — failure reason captured and user can see it

**Expected Results:**
- [ ] Cross-browser sync works
- [ ] Updates propagate across all open tabs
- [ ] No need to manually refresh
- [ ] Latency acceptable (5-10 seconds)

---

### Test 7: Mobile Responsiveness

**Setup:**
- [ ] Desktop browser with developer tools (F12)
- [ ] Enable device emulation (iPhone 12, iPad, Android)

**Test Steps:**

#### Student Form on Mobile:
1. [ ] Navigate to `/submit`
2. [ ] Form should stack vertically
3. [ ] All inputs accessible (not cut off)
4. [ ] Select dropdowns work on mobile
5. [ ] Submission works and shows success

#### Dashboard on Tablet:
1. [ ] Navigate to `/dashboard` on iPad (7-10" viewport)
2. [ ] Grid shows 1-2 printers per row
3. [ ] Cards readable
4. [ ] Carousel mode works well on tablet

#### Admin on Phone:
1. [ ] Navigate to `/admin` on iPhone (5-6" viewport)
2. [ ] Dropdown to select printer
3. [ ] Queue controller card fits on screen
4. [ ] Buttons accessible (not cramped)

**Expected Results:**
- [ ] All pages responsive and usable on phones/tablets
- [ ] No horizontal scrolling needed
- [ ] Text readable (no tiny fonts)

---

### Test 8: Error Handling

**Setup:**
- [ ] Local dev server running
- [ ] Network devtools open (F12 → Network tab)

**Test Steps:**

#### Simulate Network Error:
1. [ ] Go to dashboard
2. [ ] Throttle network to "Offline" (DevTools)
3. [ ] Verify page still shows last data
4. [ ] Verify loading indicator or error message appears
5. [ ] Restore network
6. [ ] Verify data syncs again

#### Invalid Firebase Config:
1. [ ] Temporarily change one Firebase env var
2. [ ] Reload page
3. [ ] Verify error in console (not crash)
4. [ ] Revert env var

#### Missing Firestore Rules:
1. [ ] (Don't do this in production setup!)
2. [ ] If rules not deployed, jobs won't create
3. [ ] Verify error message or graceful fail

**Expected Results:**
- [ ] App gracefully handles network issues
- [ ] Errors logged to console
- [ ] Users see helpful error messages
- [ ] No console exceptions

---

### Test 9: Data Persistence

**Setup:**
- [ ] App running with real Firebase
- [ ] Jobs created in test scenarios

**Test Steps:**
1. [ ] Create a job for "Bob Student"
2. [ ] Close all browser windows
3. [ ] Reopen and navigate to status lookup
4. [ ] Search for "Bob Student"
5. [ ] Verify job still there with correct data
6. [ ] Mark job complete via admin
7. [ ] Student looks up job again → shows as "Completed"

**Expected Results:**
- [ ] All data persists in Firestore
- [ ] No data loss across sessions
- [ ] Completions and failures recorded permanently

---

### Test 10: Security

**Setup:**
- [ ] Firestore rules deployed

**Test Steps:**

#### Public Read/Write:
1. [ ] Students can create jobs without auth ✓
2. [ ] Dashboard can read printers without auth ✓

#### Admin-Only Write:
1. [ ] Try to update printer status from public page → should fail
2. [ ] Try to delete job from public page → should fail
3. [ ] Only admin (with auth) can modify

**Expected Results:**
- [ ] Security rules working
- [ ] Public operations allowed (submit, read)
- [ ] Admin operations require auth

---

## Performance Checks

- [ ] Dashboard loads in < 2 seconds
- [ ] Student form submits in < 1 second
- [ ] Admin controls respond instantly
- [ ] Dashboard updates within 5-10 seconds
- [ ] No memory leaks (keep dev console open for 10 min, check memory)

---

## Deployment Testing (Before Going Live)

### Test on GitHub Pages:
1. [ ] Build locally: `npm run build`
2. [ ] Deploy to GitHub Pages (auto via Actions or manually)
3. [ ] Visit live URL: `https://yourname.github.io/IrvingtonMakerSpace/`
4. [ ] Repeat all tests above on live site
5. [ ] Test on mobile using live site (not localhost)

---

## Final Sign-Off

- [ ] All 10 tests passed
- [ ] No console errors during testing
- [ ] Mobile devices work (phone, tablet)
- [ ] Live deployment works
- [ ] Team trained on how to use

**Status:** ⬜ Ready for Production | ⬜ Needs Fixes | ⬜ Approved

---

## Post-Launch Monitoring

Monitor these first week:
- [ ] Check Firebase quotas (Settings → Quotas)
- [ ] Monitor function costs
- [ ] Collect user feedback
- [ ] Log any errors reported
- [ ] Verify PIN security not compromised

**Issue Tracking:**
Document any bugs found in production and report to development team.
