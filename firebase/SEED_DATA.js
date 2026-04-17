/**
 * Firebase Seed Data Documentation
 * 
 * This file documents the initial data structure needed in Firestore.
 * You can either:
 * 1. Upload this data manually in the Firebase Console
 * 2. Run a setup script to populate automatically
 * 3. Enter data manually through an admin interface
 * 
 * Sample printer configurations below
 */

// ============= SAMPLE PRINTERS =============

const samplePrinters = [
  {
    name: "Creality Ender 3 Pro #1",
    status: "Idle", // Idle, Printing, Offline, Error
    materials: ["PLA", "PETG"],
    colors: {
      "PLA": ["Black", "White", "Blue", "Red", "Green", "Yellow"],
      "PETG": ["Black", "White", "Clear"]
    },
    queue: [],
    currentJob: null,
  },
  {
    name: "Anycubic i3 Mega #2",
    status: "Idle",
    materials: ["PLA", "PETG", "ABS"],
    colors: {
      "PLA": ["Black", "Red", "Blue"],
      "PETG": ["Black", "White"],
      "ABS": ["Black", "White"]
    },
    queue: [],
    currentJob: null,
  },
  {
    name: "Ultimaker 3 #3",
    status: "Idle",
    materials: ["PLA", "ABS", "Nylon"],
    colors: {
      "PLA": ["Black", "White", "Blue", "Red", "Gold"],
      "ABS": ["Black", "White", "Gray"],
      "Nylon": ["Black", "Natural"]
    },
    queue: [],
    currentJob: null,
  },
  {
    name: "Formlabs Form 3 #4",
    status: "Offline",
    materials: ["Resin"],
    colors: {
      "Resin": ["Clear", "Gray", "Black", "White"]
    },
    queue: [],
    currentJob: null,
  },
]

// ============= SETUP INSTRUCTIONS =============

/*
TO POPULATE FIRESTORE WITH INITIAL DATA:

Option 1: Manual Upload via Firebase Console
--------------------------------------------
1. Go to Firebase Console → Firestore Database
2. Create a new collection called "printers"
3. For each printer above, click "Add Document"
4. Set the document ID to something like "printer-1", "printer-2", etc.
5. Copy the fields from above into each document
6. Click "Save"

Option 2: Use Firebase Admin SDK (Node.js)
-------------------------------------------
Save this as `scripts/seed-firestore.js` and run with:
  node scripts/seed-firestore.js

--- BEGIN SCRIPT ---
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const samplePrinters = [ ... ];

async function seedDatabase() {
  const batch = db.batch();
  
  samplePrinters.forEach((printer, index) => {
    const docRef = db.collection('printers').doc(`printer-${index + 1}`);
    batch.set(docRef, printer);
  });
  
  await batch.commit();
  console.log('Database seeded successfully!');
}

seedDatabase().catch(console.error);
--- END SCRIPT ---

Option 3: Manual JSON Upload
----------------------------
Some Firebase SDKs support bulk import via JSON files.
Check Firebase documentation for your specific version.

HOW YOUR TEACHERS WILL MANAGE PRINTERS:
--------------------------------------
After setup, teachers can manage printers via the Admin Panel:
- Add new printers
- Edit materials and colors
- Set printer status (Idle/Printing/Offline/Error)
- The system will auto-generate printer documents in Firestore

FIRESTORE DOCUMENT STRUCTURE:
----------------------------

Collection: printers
  Document ID: printer-1
  {
    name: "Creality Ender 3 Pro #1",
    status: "Idle",
    materials: ["PLA", "PETG"],
    colors: {
      "PLA": ["Black", "White", "Blue", ...],
      "PETG": ["Black", "White", ...]
    },
    queue: ["job-123", "job-456"],
    currentJob: "job-123"
  }

Collection: jobs (auto-created with student submissions)
  Document ID: job-1 (auto-generated)
  {
    studentName: "Alice Smith",
    printerId: "printer-1",
    material: "PLA",
    color: "Blue",
    cubbyNumber: 42,
    estimatedTime: 120,
    status: "Queued",
    queuePosition: 2,
    failureReason: null,
    timestamp: <Firestore Timestamp>
  }

Collection: config (optional, for admin settings)
  Document ID: admin
  {
    masterPin: "1234",
    sessionTokens: {}
  }
*/

export { samplePrinters }
