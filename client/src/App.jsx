import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './hooks/useAuth'
import { AppLayout } from './layouts/AppLayout'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { PortalPage } from './pages/PortalPage'
import './App.css'

function ProtectedRoute({ children }) {
  const { participant, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="loading-screen"><span className="spinner" />Checking your session</div>
  return participant ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

function AppRoutes() {
  const { participant, logout } = useAuth()
  const [notice, setNotice] = useState('')
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={participant ? <Navigate to="/portal" replace /> : <LoginPage />} />
      <Route path="/register" element={participant ? <Navigate to="/portal" replace /> : <RegisterPage />} />
      <Route path="/portal/*" element={
        <ProtectedRoute>
          <AppLayout participant={participant} onLogout={logout} notice={notice} setNotice={setNotice}>
            <Routes>
              <Route index element={<PortalPage section="Dashboard" participant={participant} />} />
              <Route path="profile" element={<PortalPage section="My Profile" participant={participant} setNotice={setNotice} />} />
              <Route path="team" element={<PortalPage section="My Team" participant={participant} setNotice={setNotice} />} />
              <Route path="problems" element={<PortalPage section="Problem Statements" participant={participant} setNotice={setNotice} />} />
              <Route path="submission" element={<PortalPage section="Project Submission" participant={participant} setNotice={setNotice} />} />
              <Route path="announcements" element={<PortalPage section="Announcements" participant={participant} />} />
              <Route path="leaderboard" element={<PortalPage section="Leaderboard" participant={participant} />} />
              <Route path="help" element={<PortalPage section="Help & Rules" participant={participant} />} />
              <Route path="*" element={<Navigate to="/portal" replace />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>
}
