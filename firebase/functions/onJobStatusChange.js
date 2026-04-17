/**
 * Cloud Function: On Job Status Change
 * Triggers when a job's status is updated
 * 
 * Responsibilities:
 * - When job marked as Completed/Failed: remove from queue, advance queue
 * - Update queuePosition for remaining jobs
 * - Update printer's currentJob if needed
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.onJobStatusChange = functions.firestore
  .document('jobs/{jobId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const jobId = context.params.jobId;
    const printerId = after.printerId;

    try {
      const printerRef = db.collection('printers').doc(printerId);
      const printerSnap = await printerRef.get();
      const printerData = printerSnap.data();

      // If job status changed to Completed or Failed from Printing/Queued
      if (
        (before.status !== 'Completed' && before.status !== 'Failed') &&
        (after.status === 'Completed' || after.status === 'Failed')
      ) {
        // Remove job from queue
        const updatedQueue = (printerData.queue || []).filter(id => id !== jobId);

        // Update all remaining jobs' queue positions
        for (let i = 0; i < updatedQueue.length; i++) {
          await db.collection('jobs').doc(updatedQueue[i]).update({
            queuePosition: i + 1
          });
        }

        // Update printer's queue and clear currentJob if this was the current job
        await printerRef.update({
          queue: updatedQueue,
          currentJob: after.status === 'Completed' || after.status === 'Failed' ? null : printerData.currentJob
        });

        console.log(`Queue advanced for printer ${printerId}, job ${jobId} marked as ${after.status}`);
      }
      // If job marked as Printing, update printer's currentJob
      else if (before.status !== 'Printing' && after.status === 'Printing') {
        await printerRef.update({
          currentJob: jobId
        });
        console.log(`Printer ${printerId} now printing job ${jobId}`);
      }
    } catch (error) {
      console.error('Error in onJobStatusChange:', error);
    }
  });
