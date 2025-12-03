import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import NotFound from './components/NotFound'
import { Friends } from './components/Friends'
import Goals from './components/Goals'
import Account from './components/Account'
import './App.css'

const API_BASE_URL = 'https://studymate-1fui.onrender.com'

 //'http://localhost:3000'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      const path = location.pathname

      if (path === '/') {
        setIsAuthenticated(false)
        setIsCheckingAuth(false)
        return
      }

      const protectedRoutes = ['/dashboard', '/friends', '/goals', '/account']
      const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

      if (!isProtectedRoute) {
        setIsCheckingAuth(false)
        return
      }

      try {
        await axios.get(`${API_BASE_URL}/api/dashboard`, {
          withCredentials: true
        })
        setIsAuthenticated(true)
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error('Auth check error:', error)
        }
        setIsAuthenticated(false)
      }
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [location.pathname])

  const handleLogin = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('studymate:isAuthenticated')
    localStorage.setItem('studymate:isAuthenticated', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    localStorage.clear()
    sessionStorage.clear()

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

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
          !isAuthenticated ? (
            <LoginPage onLogin={handleLogin} />
          ) : (
            <Navigate to="/dashboard" replace />
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
      <Route
        path="/goals"
        element={
          isAuthenticated ? (
            <Goals onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/account"
        element={
          isAuthenticated ? (
            <Account onLogout={handleLogout} />
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
