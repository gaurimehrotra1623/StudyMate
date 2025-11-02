import React from 'react'
import axios from 'axios'
import './Dashboard.css'

const Dashboard = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:3000/api/auth/logout',
        {},
        {
          withCredentials: true
        }
      )
      onLogout()
    } catch (error) {
      console.error('Logout error:', error)
      onLogout()
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-logo-container">
          <img src="/logo.png" alt="StudyMate Logo" className="dashboard-logo" />
          <span className="dashboard-logo-text">StudyMate</span>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="dashboard-content">
        <h1 className="dashboard-title">Welcome to StudyMate!</h1>
        <p className="dashboard-subtitle">Start your learning journey today.</p>
      </div>
    </div>
  )
}

export default Dashboard

