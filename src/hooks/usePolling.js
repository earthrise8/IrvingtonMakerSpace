/**
 * usePolling Hook
 * Handles periodic data fetching with auto-refresh
 */

import { useEffect, useState } from 'react'

/**
 * Hook for polling data at regular intervals
 * @param {Function} fetcher - Async function that fetches data
 * @param {number} interval - Polling interval in milliseconds (default: 5000)
 * @returns {Object} - { data, loading, error, refresh }
 */
export function usePolling(fetcher, interval = 5000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = async () => {
    try {
      setError(null)
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err)
      console.error('Polling error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    refresh()

    // Set up polling
    const pollInterval = setInterval(refresh, interval)

    return () => clearInterval(pollInterval)
  }, [fetcher, interval])

  return { data, loading, error, refresh }
}

export default { usePolling }
