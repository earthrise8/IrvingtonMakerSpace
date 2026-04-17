/**
 * useRealtimeUpdates Hook
 * Manages real-time Firestore listeners with cleanup
 */

import { useEffect, useState } from 'react'

/**
 * Hook for real-time printer updates
 * @param {string} printerId - Printer ID to listen to
 * @param {Function} subscription - Firestore subscription function
 * @returns {Object} - { data: Printer, loading: bool, error: Error }
 */
export function useRealtimePrinter(printerId, subscription) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!printerId || !subscription) return

    setLoading(true)
    let unsubscribe
    try {
      unsubscribe = subscription(printerId, data => {
        setData(data)
        setLoading(false)
      })
    } catch (err) {
      setError(err)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [printerId, subscription])

  return { data, loading, error }
}

/**
 * Hook for real-time all printers updates
 * @param {Function} subscription - Firestore subscription function
 * @returns {Object} - { data: Printers[], loading: bool, error: Error }
 */
export function useRealtimePrinters(subscription) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!subscription) return

    setLoading(true)
    let unsubscribe
    try {
      unsubscribe = subscription(data => {
        setData(data)
        setLoading(false)
      })
    } catch (err) {
      setError(err)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [subscription])

  return { data, loading, error }
}

/**
 * Hook for real-time queue updates
 * @param {string} printerId - Printer ID
 * @param {Function} subscription - Firestore subscription function
 * @returns {Object} - { data: Queue[], loading: bool, error: Error }
 */
export function useRealtimeQueue(printerId, subscription) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!printerId || !subscription) return

    setLoading(true)
    let unsubscribe
    try {
      unsubscribe = subscription(printerId, data => {
        setData(data)
        setLoading(false)
      })
    } catch (err) {
      setError(err)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [printerId, subscription])

  return { data, loading, error }
}

/**
 * Hook for real-time job updates
 * @param {string} jobId - Job ID to listen to
 * @param {Function} subscription - Firestore subscription function
 * @returns {Object} - { data: Job, loading: bool, error: Error }
 */
export function useRealtimeJob(jobId, subscription) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!jobId || !subscription) return

    setLoading(true)
    let unsubscribe
    try {
      unsubscribe = subscription(jobId, data => {
        setData(data)
        setLoading(false)
      })
    } catch (err) {
      setError(err)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [jobId, subscription])

  return { data, loading, error }
}

export default {
  useRealtimePrinter,
  useRealtimePrinters,
  useRealtimeQueue,
  useRealtimeJob,
}
