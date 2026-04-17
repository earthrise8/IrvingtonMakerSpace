/**
 * Firestore Query Service
 * Helper functions for common Firestore operations
 */

import { db } from './firebaseService'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore'

// ============= PRINTERS =============

/**
 * Fetch all printers
 * @returns {Promise<Array>} Array of printer objects with IDs
 */
export async function getAllPrinters() {
  try {
    const printersRef = collection(db, 'printers')
    const snapshot = await getDocs(printersRef)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching printers:', error)
    throw error
  }
}

/**
 * Get single printer by ID
 * @param {string} printerId
 * @returns {Promise<Object>}
 */
export async function getPrinter(printerId) {
  try {
    const printerRef = doc(db, 'printers', printerId)
    const snapshot = await getDoc(printerRef)
    if (!snapshot.exists()) throw new Error('Printer not found')
    return { id: snapshot.id, ...snapshot.data() }
  } catch (error) {
    console.error('Error fetching printer:', error)
    throw error
  }
}

/**
 * Subscribe to real-time printer updates
 * @param {string} printerId
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export function subscribeToPrinter(printerId, callback) {
  const printerRef = doc(db, 'printers', printerId)
  return onSnapshot(printerRef, snapshot => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() })
    }
  })
}

/**
 * Subscribe to all printers
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export function subscribeToAllPrinters(callback) {
  const printersRef = collection(db, 'printers')
  return onSnapshot(printersRef, snapshot => {
    const printers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(printers)
  })
}

// ============= JOBS =============

/**
 * Create new job (student submission)
 * @param {Object} jobData - Job data
 * @returns {Promise<string>} Job ID
 */
export async function createJob(jobData) {
  try {
    const jobsRef = collection(db, 'jobs')
    const docRef = await addDoc(jobsRef, {
      ...jobData,
      timestamp: Timestamp.now(),
      status: 'Queued',
      queuePosition: 0,
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating job:', error)
    throw error
  }
}

/**
 * Update job status
 * @param {string} jobId
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateJob(jobId, updates) {
  try {
    const jobRef = doc(db, 'jobs', jobId)
    await updateDoc(jobRef, updates)
  } catch (error) {
    console.error('Error updating job:', error)
    throw error
  }
}

/**
 * Get jobs by student name and status
 * @param {string} studentName
 * @param {string[]} statuses - Array of statuses to filter by
 * @returns {Promise<Array>}
 */
export async function getStudentJobs(studentName, statuses = ['Queued', 'Printing']) {
  try {
    const jobsRef = collection(db, 'jobs')
    const q = query(
      jobsRef,
      where('studentName', '==', studentName),
      where('status', 'in', statuses)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching student jobs:', error)
    throw error
  }
}

/**
 * Get all jobs by student name (including completed/failed)
 * @param {string} studentName
 * @returns {Promise<Array>}
 */
export async function getAllStudentJobs(studentName) {
  try {
    const jobsRef = collection(db, 'jobs')
    const q = query(
      jobsRef,
      where('studentName', '==', studentName),
      orderBy('timestamp', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching all student jobs:', error)
    throw error
  }
}

/**
 * Get queue for a printer
 * @param {string} printerId
 * @returns {Promise<Array>} Array of job objects in queue order
 */
export async function getPrinterQueue(printerId) {
  try {
    const printerRef = doc(db, 'printers', printerId)
    const printerSnap = await getDoc(printerRef)
    if (!printerSnap.exists()) throw new Error('Printer not found')

    const printerData = printerSnap.data()
    const queueJobIds = printerData.queue || []

    // Fetch all jobs in queue
    const jobs = []
    for (const jobId of queueJobIds) {
      const jobRef = doc(db, 'jobs', jobId)
      const jobSnap = await getDoc(jobRef)
      if (jobSnap.exists()) {
        jobs.push({ id: jobSnap.id, ...jobSnap.data() })
      }
    }

    return jobs
  } catch (error) {
    console.error('Error fetching printer queue:', error)
    throw error
  }
}

/**
 * Subscribe to printer queue updates
 * @param {string} printerId
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export function subscribeToPrinterQueue(printerId, callback) {
  const printerRef = doc(db, 'printers', printerId)
  return onSnapshot(printerRef, async printerSnap => {
    if (printerSnap.exists()) {
      const queueJobIds = printerSnap.data().queue || []
      const jobs = []
      for (const jobId of queueJobIds) {
        const jobRef = doc(db, 'jobs', jobId)
        const jobSnap = await getDoc(jobRef)
        if (jobSnap.exists()) {
          jobs.push({ id: jobSnap.id, ...jobSnap.data() })
        }
      }
      callback(jobs)
    }
  })
}

// ============= JOB HISTORY =============

/**
 * Get job by ID
 * @param {string} jobId
 * @returns {Promise<Object>}
 */
export async function getJob(jobId) {
  try {
    const jobRef = doc(db, 'jobs', jobId)
    const snapshot = await getDoc(jobRef)
    if (!snapshot.exists()) throw new Error('Job not found')
    return { id: snapshot.id, ...snapshot.data() }
  } catch (error) {
    console.error('Error fetching job:', error)
    throw error
  }
}

/**
 * Subscribe to job updates
 * @param {string} jobId
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export function subscribeToJob(jobId, callback) {
  const jobRef = doc(db, 'jobs', jobId)
  return onSnapshot(jobRef, snapshot => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() })
    }
  })
}

export default {
  getAllPrinters,
  getPrinter,
  subscribeToPrinter,
  subscribeToAllPrinters,
  createJob,
  updateJob,
  getStudentJobs,
  getAllStudentJobs,
  getPrinterQueue,
  subscribeToPrinterQueue,
  getJob,
  subscribeToJob,
}
