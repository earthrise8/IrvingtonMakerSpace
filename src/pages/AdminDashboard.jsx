import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { getAllPrinters, getPrinterQueue } from '../services/firestoreService'
import { usePolling } from '../hooks/usePolling'
import QueueController from '../components/QueueController'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState('queues') // queues or printers
  const [selectedPrinter, setSelectedPrinter] = useState(0)
  const [queueData, setQueueData] = useState({})
  const [sessionTime, setSessionTime] = useState('')

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login')
    }
  }, [navigate])

  // Update session timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      const timeRemaining = authService.getSessionTimeRemaining()
      if (timeRemaining <= 0) {
        authService.clearSession()
        navigate('/admin/login')
      } else {
        setSessionTime(authService.getSessionTimeRemainingFormatted())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [navigate])

  // Fetch all printers data
  const fetcher = useCallback(async () => {
    try {
      const printers = await getAllPrinters()

      // Fetch queue for each printer
      const queues = {}
      for (const printer of printers) {
        try {
          const queue = await getPrinterQueue(printer.id)
          queues[printer.id] = queue
        } catch (err) {
          console.error(`Error fetching queue for ${printer.id}:`, err)
          queues[printer.id] = []
        }
      }

      setQueueData(queues)
      return printers
    } catch (err) {
      console.error('Error fetching admin data:', err)
      throw err
    }
  }, [])

  const { data: printers = [], loading, error } = usePolling(fetcher, 3000) // Refresh every 3 seconds

  function handleLogout() {
    authService.clearSession()
    navigate('/admin/login')
  }

  if (!authService.isAuthenticated()) {
    return null
  }

  if (loading && printers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🔐 Admin Control Panel</h1>
              <p className="text-red-100 mt-1">Manage 3D printer queues and jobs</p>
            </div>
            <div className="text-right">
              <p className="text-red-100">Session expires in:</p>
              <p className={`text-2xl font-bold ${sessionTime === '00:00' ? 'text-red-300 animate-pulse' : ''}`}>
                {sessionTime}
              </p>
              <button
                onClick={handleLogout}
                className="mt-2 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex gap-4">
          <button
            onClick={() => setSelectedTab('queues')}
            className={`py-4 px-6 font-semibold border-b-2 transition ${
              selectedTab === 'queues'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 Queue Management
          </button>
          <button
            onClick={() => setSelectedTab('overview')}
            className={`py-4 px-6 font-semibold border-b-2 transition ${
              selectedTab === 'overview'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📈 Overview
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Queue Management Tab */}
        {selectedTab === 'queues' && (
          <div className="space-y-6">
            {/* Printer Selector */}
            {printers.length > 1 && (
              <div className="bg-white rounded-lg shadow p-6 md:hidden">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Printer
                </label>
                <select
                  value={selectedPrinter}
                  onChange={e => setSelectedPrinter(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {printers.map((printer, idx) => (
                    <option key={printer.id} value={idx}>
                      {printer.name} ({printer.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Printer Grid / List */}
            {printers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-xl">No printers configured</p>
                <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
                  Back to Home
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {printers.map(printer => (
                    <QueueController
                      key={printer.id}
                      printer={printer}
                      queue={queueData[printer.id] || []}
                    />
                  ))}
                </div>

                {/* Mobile Single View */}
                <div className="md:hidden">
                  <QueueController
                    printer={printers[selectedPrinter]}
                    queue={queueData[printers[selectedPrinter]?.id] || []}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">Total Printers</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{printers.length}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">Printing Now</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {printers.filter(p => p.status === 'Printing').length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">Total in Queue</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">
                  {Object.values(queueData).reduce((sum, queue) => sum + (queue?.length || 0), 0)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">Offline</p>
                <p className="text-4xl font-bold text-red-600 mt-2">
                  {printers.filter(p => p.status === 'Offline').length}
                </p>
              </div>
            </div>

            {/* Printer Status Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Printer Status Overview</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Printer</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Queue</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Current Job</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printers.map(printer => {
                      const queue = queueData[printer.id] || []
                      const currentJob = queue[0]
                      const statusColor = {
                        'Idle': 'text-green-600',
                        'Printing': 'text-blue-600',
                        'Error': 'text-red-600',
                        'Offline': 'text-gray-600',
                      }[printer.status] || 'text-gray-600'

                      return (
                        <tr key={printer.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-800">{printer.name}</td>
                          <td className={`px-6 py-4 text-sm font-bold ${statusColor}`}>{printer.status}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{queue.length} jobs</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {currentJob ? currentJob.studentName : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>Syncing...</span>
        </div>
      )}
    </div>
  )
}
