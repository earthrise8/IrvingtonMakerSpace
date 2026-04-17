import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getAllPrinters, getPrinterQueue } from '../services/firestoreService'
import { usePolling } from '../hooks/usePolling'
import PrinterCard from '../components/PrinterCard'

export default function Dashboard() {
  const [viewMode, setViewMode] = useState('grid') // grid or carousel
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [queueData, setQueueData] = useState({}) // printerId -> queue
  const [lastUpdate, setLastUpdate] = useState(new Date())

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
      setLastUpdate(new Date())
      return printers
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      throw err
    }
  }, [])

  const { data: printers = [], loading, error } = usePolling(fetcher, 5000) // Refresh every 5 seconds

  // Auto-advance carousel every 15 seconds
  useEffect(() => {
    if (viewMode !== 'carousel' || printers.length === 0) return

    const timer = setTimeout(() => {
      setCarouselIndex(prev => (prev + 1) % printers.length)
    }, 15000)

    return () => clearTimeout(timer)
  }, [viewMode, printers.length, carouselIndex])

  function handlePrevious() {
    setCarouselIndex(prev => (prev - 1 + printers.length) % printers.length)
  }

  function handleNext() {
    setCarouselIndex(prev => (prev + 1) % printers.length)
  }

  if (loading && printers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-2xl">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && printers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900 text-white p-8 rounded-lg max-w-md text-center">
          <p className="text-2xl font-bold mb-4">Error Loading Dashboard</p>
          <p className="mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-red-900 font-bold py-2 px-6 rounded hover:bg-gray-100"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Carousel Mode
  if (viewMode === 'carousel' && printers.length > 0) {
    const currentPrinter = printers[carouselIndex]
    const queue = queueData[currentPrinter.id] || []

    return (
      <div className="min-h-screen bg-gray-900 p-6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Printer Queue Dashboard</h1>
            <p className="text-gray-400 mt-1">Full-screen carousel mode • Auto-rotating every 15 seconds</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Last updated: {lastUpdate.toLocaleTimeString()}</p>
            <button
              onClick={() => setViewMode('grid')}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Switch to Grid
            </button>
          </div>
        </div>

        {/* Main Printer Display */}
        <div className="flex-grow mb-6">
          <PrinterCard printer={currentPrinter} queue={queue} />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
          <button
            onClick={handlePrevious}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded text-xl"
          >
            ← Previous
          </button>

          <div className="text-white text-center flex-grow">
            <p className="text-2xl font-bold">
              Printer {carouselIndex + 1} of {printers.length}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {printers.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-2 rounded-full transition ${
                    idx === carouselIndex ? 'bg-white w-6' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded text-xl"
          >
            Next →
          </button>
        </div>
      </div>
    )
  }

  // Grid Mode
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Printer Queue Dashboard</h1>
            <p className="text-gray-400 mt-2">
              {printers.length} printer{printers.length !== 1 ? 's' : ''} online •
              Auto-refreshing every 5 seconds
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-400 text-sm mb-2">Last updated: {lastUpdate.toLocaleTimeString()}</p>
            <button
              onClick={() => setViewMode('carousel')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded mr-2"
            >
              Switch to Carousel
            </button>
            <Link
              to="/"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="bg-gray-800 rounded-lg p-4 flex gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-status-idle rounded"></div>
            <span className="text-gray-300">Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-status-printing rounded"></div>
            <span className="text-gray-300">Printing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-status-error rounded"></div>
            <span className="text-gray-300">Error</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-gray-300">Offline</span>
          </div>
        </div>
      </div>

      {/* Printer Grid */}
      {printers.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400 text-xl">No printers configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {printers.map(printer => (
            <PrinterCard key={printer.id} printer={printer} queue={queueData[printer.id] || []} />
          ))}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && printers.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>Updating...</span>
        </div>
      )}
    </div>
  )
}
