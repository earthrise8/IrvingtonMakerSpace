import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import StudentSubmission from './pages/StudentSubmission'
import StudentStatus from './pages/StudentStatus'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import LandingPage from './pages/LandingPage'
import TopNav from './components/TopNav'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-slate-100">
        <TopNav />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/submit" element={<StudentSubmission />} />
          <Route path="/status" element={<StudentStatus />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
