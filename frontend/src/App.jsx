import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import NotFound from './components/NotFound'
import { Friends } from './components/Friends'
import './App.css'

const API_BASE_URL = //'http://localhost:3000'
'https://studymate-1fui.onrender.com'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const stored = localStorage.getItem('studymate:isAuthenticated')
      const token = localStorage.getItem('token')

      if (stored === 'true' && token) {
        try {
          await axios.get(`${API_BASE_URL}/api/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          setIsAuthenticated(true)
        } catch (error) {
          console.log('Auth check failed:', error)
          localStorage.removeItem('studymate:isAuthenticated')
          localStorage.removeItem('token')
          setIsAuthenticated(false)
        }
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [])

  const handleLogin = (token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('studymate:isAuthenticated', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('studymate:isAuthenticated')
    setIsAuthenticated(false)
  }

  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6B7280' }}>Checking authentication...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Dashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/friends"
        element={
          isAuthenticated ? (
            <Friends onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
