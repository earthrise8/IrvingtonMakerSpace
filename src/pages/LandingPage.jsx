import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-12 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
          🖨️ 3D Printer Queue Manager
        </h1>
        <p className="text-lg text-center text-gray-600 mb-8">
          Irvington Makerspace - Submit and track your 3D print jobs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-center transition duration-200 shadow-lg"
          >
            📝 Submit Print Job
          </Link>
          <Link
            to="/status"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-center transition duration-200 shadow-lg"
          >
            🔍 Check Status
          </Link>
          <Link
            to="/dashboard"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-lg text-center transition duration-200 shadow-lg"
          >
            📊 Live Dashboard
          </Link>
          <Link
            to="/admin/login"
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-center transition duration-200 shadow-lg"
          >
            🔐 Admin Panel
          </Link>
        </div>

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>System is ready. All services operational.</p>
        </div>
      </div>
    </div>
  )
}
