import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './Dashboard.css'
import './Account.css'

const API_BASE_URL = //'http://localhost:3000'
'https://studymate-1fui.onrender.com'

const Account = ({ onLogout }) => {
  const [user, setUser] = useState({ username: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/dashboard`, {
        withCredentials: true
      })

      if (response.data.success && response.data.data) {
        const data = response.data.data
        if (data.user) {
          setUser({
            username: data.user.username || '',
            email: data.user.email || ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      setError('')

      await axios.delete(`${API_BASE_URL}/api/account/delete`, {
        withCredentials: true
      })

      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      onLogout()
    } catch (error) {
      console.error('Error deleting account:', error)
      setError(error.response?.data?.message || 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-root">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <img src="/logo.png" alt="StudyMate Logo" className="sidebar-logo" />
            <span className="sidebar-text">StudyMate</span>
          </div>
          <nav className="sidebar-nav">
            <Link className="nav-link" to="/dashboard">Home</Link>
            <Link className="nav-link" to="/friends">Friends</Link>
            <Link className="nav-link" to="/goals">Goals</Link>
            <Link className="nav-link active" to="/account">My Account</Link>
          </nav>
          <button onClick={onLogout} className="sidebar-logout">Logout</button>
        </aside>
        <main className="dashboard-main">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #E5E7EB',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#6B7280' }}>Loading account...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-root">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="StudyMate Logo" className="sidebar-logo" />
          <span className="sidebar-text">StudyMate</span>
        </div>
        <nav className="sidebar-nav">
          <Link className="nav-link" to="/dashboard">Home</Link>
          <Link className="nav-link" to="/friends">Friends</Link>
          <Link className="nav-link" to="/goals">Goals</Link>
          <Link className="nav-link active" to="/account">My Account</Link>
        </nav>
        <button onClick={onLogout} className="sidebar-logout">Logout</button>
      </aside>

      <main className="dashboard-main account-main">
        <header className="main-header">
          <div className="welcome">
            <h1 className="welcome-title">My Account 👤</h1>
            <p className="welcome-sub">Manage your account and information</p>
          </div>
        </header>

        <div className="account-container">
          <div className="account-card profile-card">
            <div className="account-header">
              <div className="avatar-wrapper">
                <div className="account-avatar">
                  {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="avatar-badge">✓</div>
              </div>
              <h2 className="account-name">{user.username || 'User'}</h2>
              <p className="account-subtitle">StudyMate Member</p>
            </div>
          </div>

          <div className="account-card info-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="title-icon">📋</span>
                Personal Information
              </h3>
            </div>
            <div className="account-info">
              <div className="info-row">
                <div className="info-left">
                  <span className="info-icon">👤</span>
                  <span className="info-label">Username</span>
                </div>
                <span className="info-value">{user.username || 'Not set'}</span>
              </div>
              <div className="info-row">
                <div className="info-left">
                  <span className="info-icon">📧</span>
                  <span className="info-label">Email Address</span>
                </div>
                <span className="info-value">{user.email || 'Not set'}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="account-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="account-card danger-card">
            <div className="card-header danger-header">
              <h3 className="card-title danger-title">
                <span className="title-icon">⚠️</span>
                Danger Zone
              </h3>
            </div>
            <div className="danger-content">
              <div className="danger-info">
                <h4 className="danger-subtitle">Delete Account</h4>
                <p className="danger-zone-text">
                  Once you delete your account, there is no going back. All your goals, friends, and data will be permanently deleted.
                </p>
              </div>
              <button 
                className="delete-account-btn"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
              >
                <span className="btn-icon">🗑️</span>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">Delete Account?</h2>
            </div>
            <div className="modal-body">
              <p className="modal-text">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <p className="modal-warning">
                All your data including goals, friends, and activity will be permanently deleted.
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="modal-btn delete"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Account
