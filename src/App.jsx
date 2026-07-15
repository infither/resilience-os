import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Intelligence from './pages/Intelligence'
import PropertyDetail from './pages/PropertyDetail'
import Mitigation from './pages/Mitigation'
import MitigationRoadmap from './pages/MitigationRoadmap'
import Recovery from './pages/Recovery'

const AUTH_KEY = 'resos-auth'

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1')
  const navigate = useNavigate()

  useEffect(() => {
    if (authed) sessionStorage.setItem(AUTH_KEY, '1')
    else sessionStorage.removeItem(AUTH_KEY)
  }, [authed])

  const handleLogin = () => {
    setAuthed(true)
    navigate('/dashboard')
  }
  const handleLogout = () => {
    setAuthed(false)
    navigate('/login')
  }

  if (!authed) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout onLogout={handleLogout}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/intelligence" element={<Intelligence />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/mitigation" element={<Mitigation />} />
        <Route path="/mitigation/:id" element={<MitigationRoadmap />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}
