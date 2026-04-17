/**
 * QueueController Component
 * Manages job statuses and queue operations for a single printer
 */

import { useState } from 'react'
import { updateJob } from '../services/firestoreService'

export default function QueueController({ printer, queue }) {
  const [failureReasons, setFailureReasons] = useState({}) // jobId -> reason
  const [showFailureModal, setShowFailureModal] = useState(null) // jobId or null
  const [isUpdating, setIsUpdating] = useState(null) // jobId being updated
  const [error, setError] = useState('')

  const currentJob = queue && queue.length > 0 ? queue[0] : null
  const upcomingJobs = queue ? queue.slice(1) : []

  async function handleStartJob() {
    if (!currentJob) return

    setIsUpdating(currentJob.id)
    setError('')
    try {
      await updateJob(currentJob.id, { status: 'Printing' })
    } catch (err) {
      setError(err.message)
      console.error('Error starting job:', err)
    } finally {
      setIsUpdating(null)
    }
  }

  async function handleCompleteJob() {
    if (!currentJob) return

    setIsUpdating(currentJob.id)
    setError('')
    try {
      await updateJob(currentJob.id, { status: 'Completed' })
    } catch (err) {
      setError(err.message)
      console.error('Error completing job:', err)
    } finally {
      setIsUpdating(null)
    }
  }

  async function handleFailJob() {
    if (!currentJob) return

    const reason = failureReasons[currentJob.id] || 'Unknown error'

    setIsUpdating(currentJob.id)
    setError('')
    try {
      await updateJob(currentJob.id, {
        status: 'Failed',
        failureReason: reason,
      })
      setShowFailureModal(null)
      setFailureReasons({})
    } catch (err) {
      setError(err.message)
      console.error('Error failing job:', err)
    } finally {
      setIsUpdating(null)
    }
  }

  if (!printer) {
    return <div className="text-gray-500">Printer not found</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Printer Header */}
      <div className="border-b pb-4">
        <h3 className="text-2xl font-bold text-gray-800">{printer.name}</h3>
        <p className="text-gray-600 mt-1">
          Status: <span className="font-semibold">{printer.status}</span> • 
          Queue: <span className="font-semibold">{queue?.length || 0} jobs</span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Current Job */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-4 text-lg">Currently Printing</h4>
        {currentJob ? (
          <>
            <div className="space-y-2 mb-6">
              <p className="text-xl font-bold text-gray-800">{currentJob.studentName}</p>
              <p className="text-gray-600">Material: {currentJob.material} • Color: {currentJob.color}</p>
              <p className="text-gray-600">Cubby: #{currentJob.cubbyNumber ?? currentJob.cubbySNumber ?? 'N/A'}</p>
              {currentJob.estimatedTime && (
                <p className="text-gray-600">Est. Time: {currentJob.estimatedTime} min</p>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {currentJob.status === 'Queued' && (
                <button
                  onClick={handleStartJob}
                  disabled={isUpdating === currentJob.id}
                  className="flex-1 min-w-32 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition"
                >
                  {isUpdating === currentJob.id ? 'Starting...' : 'Start Printing'}
                </button>
              )}

              {currentJob.status === 'Printing' && (
                <>
                  <button
                    onClick={handleCompleteJob}
                    disabled={isUpdating === currentJob.id}
                    className="flex-1 min-w-32 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    {isUpdating === currentJob.id ? 'Completing...' : '✅ Mark Complete'}
                  </button>
                  <button
                    onClick={() => setShowFailureModal(currentJob.id)}
                    disabled={isUpdating === currentJob.id}
                    className="flex-1 min-w-32 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    ❌ Mark Failed
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-500">No active job - queue is idle</p>
        )}
      </div>

      {/* Failure Modal */}
      {showFailureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h4 className="text-xl font-bold text-gray-800 mb-4">Mark Job as Failed</h4>
            <p className="text-gray-600 mb-4">Select or enter a failure reason:</p>

            <div className="space-y-3 mb-6">
              {[
                'Nozzle clog',
                'Print detached/warping',
                'Material jam',
                'Printer error',
                'Power loss',
                'Other',
              ].map(reason => (
                <label key={reason} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="failure-reason"
                    value={reason}
                    checked={failureReasons[currentJob.id] === reason}
                    onChange={e => setFailureReasons({ ...failureReasons, [currentJob.id]: e.target.value })}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            {failureReasons[currentJob.id] === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom reason..."
                value={
                  failureReasons[currentJob.id] === 'Other'
                    ? ''
                    : failureReasons[currentJob.id]
                }
                onChange={e => setFailureReasons({ ...failureReasons, [currentJob.id]: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowFailureModal(null)
                  setFailureReasons({})
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFailJob}
                disabled={!failureReasons[currentJob.id] || isUpdating === currentJob.id}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
              >
                {isUpdating === currentJob.id ? 'Failing...' : 'Confirm Failure'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queue List */}
      {upcomingJobs.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-4 text-lg">Upcoming Queue</h4>
          <div className="space-y-2">
            {upcomingJobs.map((job, idx) => (
              <div key={job.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">#{idx + 2} {job.studentName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {job.material} • {job.color} • Cubby #{job.cubbyNumber ?? job.cubbySNumber ?? 'N/A'}
                    </p>
                  </div>
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {queue && queue.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          Queue is empty - no jobs waiting
        </div>
      )}
    </div>
  )
}
