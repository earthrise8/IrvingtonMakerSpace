import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/admin')
    }
  }, [navigate])

  function handlePinChange(e) {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    setPin(value.slice(0, 6)) // Max 6 digits
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!pin) {
      setError('Please enter a PIN')
      return
    }

    setIsSubmitting(true)

    try {
      if (authService.validatePin(pin)) {
        // Create session
        authService.createSession()
        // Navigate to admin dashboard
        navigate('/admin')
      } else {
        setError('Invalid PIN. Please try again.')
        setPin('')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-12 max-w-md w-full">
        <Link to="/" className="text-blue-500 hover:text-blue-700 mb-6 block font-semibold">
          ← Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-2">Enter your PIN to access the control panel</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Admin PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={handlePinChange}
              placeholder="●●●●●●"
              maxLength={6}
              disabled={isSubmitting}
              autoFocus
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center text-2xl tracking-widest disabled:bg-gray-100 transition"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              {pin.length}/6 digits
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || pin.length === 0}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
          >
            {isSubmitting ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            📞 Forgot PIN? Contact your system administrator.
          </p>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold mb-2">What is this?</p>
          <p>This admin panel allows authorized users to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
            <li>Start and complete print jobs</li>
            <li>Mark jobs as failed</li>
            <li>Reorder printer queues</li>
            <li>Manage printer configurations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
