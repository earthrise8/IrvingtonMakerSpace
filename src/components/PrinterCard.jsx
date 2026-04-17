/**
 * PrinterCard Component
 * Displays printer status, current job, and queue preview
 * Optimized for large monitor displays
 */

export default function PrinterCard({ printer, queue = [] }) {
  if (!printer) {
    return (
      <div className="dashboard-card queued p-8 min-h-64 flex items-center justify-center">
        <p className="text-gray-500 text-center">Printer data unavailable</p>
      </div>
    )
  }

  const statusClass = {
    'Idle': 'idle',
    'Printing': 'printing',
    'Error': 'error',
    'Offline': 'queued',
  }[printer.status] || 'queued'

  const statusColor = {
    'Idle': 'bg-status-idle text-white',
    'Printing': 'bg-status-printing text-white',
    'Error': 'bg-status-error text-white',
    'Offline': 'bg-gray-400 text-white',
  }[printer.status] || 'bg-status-queued text-white'

  const currentJob = queue.length > 0 ? queue[0] : null
  const nextJobs = queue.slice(1, 3)

  return (
    <div className={`dashboard-card ${statusClass} p-8 h-full flex flex-col`}>
      {/* Printer Name */}
      <h2 className="text-dashboard-title font-bold text-gray-800 mb-6 line-clamp-2">
        {printer.name}
      </h2>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-block px-4 py-2 rounded-full font-bold text-dashboard-text ${statusColor}`}>
          {printer.status}
        </span>
      </div>

      {/* Current Job */}
      <div className="mb-8 pb-6 border-b border-gray-200 flex-grow">
        <p className="text-dashboard-label text-gray-600 font-semibold mb-2">Now Printing:</p>
        {currentJob ? (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-status-printing">
            <p className="text-dashboard-name font-bold text-gray-800 line-clamp-1">
              {currentJob.studentName}
            </p>
            <p className="text-dashboard-label text-gray-600 mt-2">
              📁 Cubby #{currentJob.cubbyNumber ?? currentJob.cubbySNumber ?? 'N/A'}
            </p>
            <p className="text-dashboard-label text-gray-600 mt-1">
              {currentJob.material} • {currentJob.color}
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-dashboard-label">
            Queue is empty - ready for next job
          </div>
        )}
      </div>

      {/* Queue Preview */}
      {queue.length > 1 && (
        <div>
          <p className="text-dashboard-label text-gray-600 font-semibold mb-3">
            Next in Queue:
          </p>
          <div className="space-y-2">
            {nextJobs.map((job, index) => (
              <div
                key={job.id}
                className="bg-gray-50 p-3 rounded border-l-4 border-status-queued"
              >
                <p className="text-dashboard-text font-semibold text-gray-800">
                  #{index + 2}. {job.studentName}
                </p>
              </div>
            ))}
          </div>

          {queue.length > 3 && (
            <p className="text-dashboard-text text-gray-500 mt-3 pt-3 border-t border-gray-200">
              +{queue.length - 3} more in queue
            </p>
          )}
        </div>
      )}

      {queue.length === 1 && currentJob && (
        <p className="text-dashboard-text text-gray-500">
          No jobs queued - next job starts when current completes
        </p>
      )}
    </div>
  )
}
