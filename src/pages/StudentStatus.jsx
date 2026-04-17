import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllStudentJobs } from '../services/firestoreService'

export default function StudentStatus() {
  const [studentName, setStudentName] = useState('')
  const [jobs, setJobs] = useState([])
  const [searched, setSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    setSearched(true)
    setError('')
    setJobs([])

    if (!studentName.trim()) {
      setError('Please enter a student name')
      return
    }

    setIsLoading(true)
    try {
      const results = await getAllStudentJobs(studentName.trim())
      setJobs(results)
      if (results.length === 0) {
        setError('No jobs found for this student')
      }
    } catch (err) {
      setError('Failed to search. Please try again.')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  function getStatusBadge(status) {
    const badgeClass = {
      'Queued': 'bg-status-queued',
      'Printing': 'bg-status-printing',
      'Completed': 'bg-status-idle',
      'Failed': 'bg-status-error',
    }[status]

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${badgeClass}`}>
        {status}
      </span>
    )
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'N/A'
    let date = timestamp
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate()
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp)
    }
    return new Date(date).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white">
            <Link to="/" className="text-green-100 hover:text-white mb-4 block font-semibold">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold">Check Job Status</h1>
            <p className="text-green-100 mt-2">Search for your print jobs by name</p>
          </div>

          {/* Search Form */}
          <div className="p-8 border-b border-gray-200">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                maxLength={50}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition whitespace-nowrap"
              >
                {isLoading ? '🔍 Searching...' : '🔍 Search'}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="p-8">
            {searched && error && !isLoading && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {jobs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}
                </h2>

                {jobs.map(job => (
                  <div
                    key={job.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                  >
                    {/* Job Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Job ID: {job.id}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Submitted: {formatDate(job.timestamp)}
                        </p>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Printer</p>
                        <p className="font-semibold text-gray-800">{job.printerId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Material</p>
                        <p className="font-semibold text-gray-800">{job.material}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Color</p>
                        <p className="font-semibold text-gray-800">{job.color}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">USB Cubby</p>
                        <p className="font-semibold text-gray-800">#{job.cubbyNumber ?? job.cubbySNumber ?? 'N/A'}</p>
                      </div>
                    </div>

                    {/* Queue Info */}
                    {(job.status === 'Queued' || job.status === 'Printing') && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                        <p className="text-sm text-blue-600">
                          <span className="font-semibold">Queue Position:</span> #{job.queuePosition}
                        </p>
                        {job.estimatedTime && (
                          <p className="text-sm text-blue-600 mt-1">
                            <span className="font-semibold">Est. Time:</span> {job.estimatedTime} minutes
                          </p>
                        )}
                      </div>
                    )}

                    {/* Failure Info */}
                    {job.status === 'Failed' && job.failureReason && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <p className="text-sm text-red-700">
                          <span className="font-semibold">Failure Reason:</span> {job.failureReason}
                        </p>
                      </div>
                    )}

                    {/* Completion Info */}
                    {job.status === 'Completed' && (
                      <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                        <p className="text-sm text-green-700">
                          ✅ Your print is complete! Please collect it from the cubby.
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {job.status === 'Failed' && (
                      <Link
                        to="/submit"
                        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition"
                      >
                        Resubmit Job
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}

            {searched && jobs.length === 0 && !error && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No jobs found</p>
                <Link
                  to="/submit"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
                >
                  Submit a New Job
                </Link>
              </div>
            )}

            {!searched && (
              <div className="text-center py-12 text-gray-500">
                <p>Enter your name and click search to view your jobs</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
