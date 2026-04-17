/**
 * Cloud Function: On Job Submitted
 * Triggers when a new job is created in the jobs collection
 * 
 * Responsibilities:
 * - Check if student already has an active job (Queued/Printing)
 * - Add job to printer's queue
 * - Calculate and set queue position
 * - Return success/error response
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.onJobSubmitted = functions.firestore
  .document('jobs/{jobId}')
  .onCreate(async (snap, context) => {
    const jobData = snap.data();
    const jobId = context.params.jobId;
    const printerId = jobData.printerId;
    const studentName = jobData.studentName;

    try {
      // Check if student already has active job
      const existingJobsQuery = await db.collection('jobs')
        .where('studentName', '==', studentName)
        .where('status', 'in', ['Queued', 'Printing'])
        .get();

      if (!existingJobsQuery.empty && existingJobsQuery.docs[0].id !== jobId) {
        // Student already has active job - reject this submission
        await snap.ref.update({ status: 'Failed', failureReason: 'Already has active job' });
        return;
      }

      // Get printer document
      const printerRef = db.collection('printers').doc(printerId);
      const printerSnap = await printerRef.get();

      if (!printerSnap.exists) {
        await snap.ref.update({ status: 'Failed', failureReason: 'Printer not found' });
        return;
      }

      const printerData = printerSnap.data();
      const currentQueue = printerData.queue || [];

      // Calculate queue position
      const queuePosition = currentQueue.length + 1;

      // Update job with queue position
      await snap.ref.update({
        queuePosition: queuePosition,
        status: 'Queued'
      });

      // Add job to printer's queue
      await printerRef.update({
        queue: admin.firestore.FieldValue.arrayUnion(jobId)
      });

      console.log(`Job ${jobId} added to printer ${printerId} at position ${queuePosition}`);
    } catch (error) {
      console.error('Error in onJobSubmitted:', error);
      await snap.ref.update({ status: 'Failed', failureReason: 'System error' });
    }
  });
