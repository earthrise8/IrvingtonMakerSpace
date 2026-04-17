import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createJob, getAllPrinters } from '../services/firestoreService'

export default function StudentSubmission() {
  const navigate = useNavigate()

  // Form state
  const [studentName, setStudentName] = useState('')
  const [selectedPrinter, setSelectedPrinter] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [cubbyNumber, setCubbyNumber] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [successData, setSuccessData] = useState(null)

  // Data state
  const [printers, setPrinters] = useState([])
  const [loadingPrinters, setLoadingPrinters] = useState(true)
  const [printerError, setPrinterError] = useState('')

  // Load printers on mount
  useEffect(() => {
    loadPrinters()
  }, [])

  // Update available materials when printer changes
  useEffect(() => {
    setSelectedMaterial('')
    setSelectedColor('')
  }, [selectedPrinter])

  // Update available colors when material changes
  useEffect(() => {
    setSelectedColor('')
  }, [selectedMaterial])

  async function loadPrinters() {
    try {
      setLoadingPrinters(true)
      const data = await getAllPrinters()
      setPrinters(data)
      setPrinterError('')
    } catch (error) {
      setPrinterError('Failed to load printers. Please refresh and try again.')
      console.error('Error loading printers:', error)
    } finally {
      setLoadingPrinters(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    // Validation
    if (!studentName.trim()) {
      setSubmitError('Please enter your name')
      return
    }
    if (!selectedPrinter) {
      setSubmitError('Please select a printer')
      return
    }
    if (!selectedMaterial) {
      setSubmitError('Please select a material')
      return
    }
    if (!selectedColor) {
      setSubmitError('Please select a color')
      return
    }
    if (!cubbyNumber.trim()) {
      setSubmitError('Please enter your USB cubby number')
      return
    }

    // Validate cubby number is numeric
    if (!/^\d+$/.test(cubbyNumber)) {
      setSubmitError('Cubby number must be numeric (e.g., 42)')
      return
    }

    setIsSubmitting(true)

    try {
      // Create job
      const jobId = await createJob({
        studentName: studentName.trim(),
        printerId: selectedPrinter,
        material: selectedMaterial,
        color: selectedColor,
        cubbyNumber: parseInt(cubbyNumber),
        cubbySNumber: parseInt(cubbyNumber), // Legacy compatibility for existing UI/data
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
      })

      // Get printer name for display
      const printer = printers.find(p => p.id === selectedPrinter)

      setSuccessData({
        jobId,
        printerName: printer?.name || 'Unknown Printer',
        queuePosition: 1, // Will be updated by Cloud Function
        material: selectedMaterial,
        color: selectedColor,
      })

      setSubmitted(true)
    } catch (error) {
      setSubmitError('Failed to submit job. Please try again. ' + error.message)
      console.error('Error submitting job:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentPrinter = printers.find(p => p.id === selectedPrinter)
  const availableMaterials = currentPrinter?.materials || []
  const availableColors = selectedMaterial && currentPrinter?.colors
    ? currentPrinter.colors[selectedMaterial] || []
    : []

  if (submitted && successData) {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-green-500">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Job Submitted!</h1>
              <p className="text-lg text-green-600 font-semibold">Your print job is now in the queue</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Job Details</h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Printer:</span>
                  <span className="font-semibold">{successData.printerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Material:</span>
                  <span className="font-semibold">{successData.material}</span>
                </div>
                <div className="flex justify-between">
                  <span>Color:</span>
                  <span className="font-semibold">{successData.color}</span>
                </div>
                <div className="flex justify-between border-t pt-3 mt-3">
                  <span className="text-lg">Queue Position:</span>
                  <span className="font-bold text-lg text-blue-600">{successData.queuePosition}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6 text-center">
              Check the <Link to="/status" className="text-blue-500 hover:underline">status page</Link> to track your job or visit the <Link to="/dashboard" className="text-blue-500 hover:underline">dashboard</Link> to see live updates.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSubmitted(false)
                  setStudentName('')
                  setSelectedPrinter('')
                  setSelectedMaterial('')
                  setSelectedColor('')
                  setCubbyNumber('')
                  setEstimatedTime('')
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Submit Another Job
              </button>
              <Link
                to="/"
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-center transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <Link to="/" className="text-blue-100 hover:text-white mb-4 block font-semibold">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-2">Submit Print Job</h1>
            <p className="text-blue-100">Add your 3D print to the queue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {submitError}
              </div>
            )}

            {/* Printer Error */}
            {printerError && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex justify-between items-center">
                <span>{printerError}</span>
                <button
                  type="button"
                  onClick={loadPrinters}
                  className="text-yellow-700 hover:text-yellow-900 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Student Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                maxLength={50}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Printer Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Printer <span className="text-red-500">*</span>
              </label>
              {loadingPrinters ? (
                <div className="text-gray-500 text-center py-4">Loading printers...</div>
              ) : (
                <select
                  value={selectedPrinter}
                  onChange={e => setSelectedPrinter(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Choose a printer...</option>
                  {printers.map(printer => (
                    <option key={printer.id} value={printer.id}>
                      {printer.name} ({printer.status})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Material Selection */}
            {selectedPrinter && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Material <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMaterial}
                  onChange={e => setSelectedMaterial(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Choose a material...</option>
                  {availableMaterials.map(material => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Color Selection */}
            {selectedMaterial && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Choose a color...</option>
                  {availableColors.map(color => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Cubby Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                USB Cubby Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cubbyNumber}
                onChange={e => setCubbyNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g., 42"
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">Where your USB file is stored</p>
            </div>

            {/* Estimated Print Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Print Time (minutes) <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                value={estimatedTime}
                onChange={e => setEstimatedTime(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g., 120"
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loadingPrinters}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Print Job'}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-gray-700">
          <h3 className="font-semibold text-lg mb-2">ℹ️ How It Works</h3>
          <ul className="space-y-2 text-sm list-disc list-inside">
            <li>Fill out this form with your print details</li>
            <li>Your job is added to the selected printer's queue</li>
            <li>Watch the live dashboard to see when your job starts printing</li>
            <li>Retrieve your print when the admin marks it complete</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
