import React from 'react'
import { Link } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-glow" />
      <div className="notfound-card">
        <Link to="/" className="notfound-brand">
          <img src="/logo.png" alt="StudyMate logo" className="brand-logo" />
          <span className="brand-text">StudyMate</span>
        </Link>

        {/* <div className="notfound-badge">404</div> */}
        <h1 className="notfound-title">This URL doesn’t exist</h1>
        <p className="notfound-subtitle">Please check your URL and try again.</p>

        <div className="notfound-actions">
          <Link className="notfound-button primary" to="/">Go to Login Page</Link>
          {/* <a className="notfound-button secondary" href="mailto:support@studymate.app">Contact Support</a> */}
        </div>
      </div>
    </div>
  )
}

export default NotFound


