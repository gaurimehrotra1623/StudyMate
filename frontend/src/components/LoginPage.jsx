import React, { useState } from 'react'
import axios from 'axios'
import './LoginPage.css'

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
      if (isLogin) {
        if (!email || !password) {
          setMessage('All fields are required!')
          setIsLoading(false)
          return
        }

        const response = await axios.post(
          'http://localhost:3000/api/auth/login',
          {
            email: email,
            password: password
          },
          {
            withCredentials: true
          }
        )

        setMessage(response.data.message || 'Login successful')
        setTimeout(() => {
          onLogin()
        }, 500)
      } else {
        if (!username || !email || !password) {
          setMessage('All fields are required!')
          setIsLoading(false)
          return
        }

        const response = await axios.post(
          'http://localhost:3000/api/auth/signup',
          {
            username: username,
            email: email,
            password: password
          },
          {
            withCredentials: true
          }
        )

        setMessage(response.data || 'User created successfully')
        setTimeout(() => {
          onLogin()
        }, 500)
      }
    } catch (error) {
      if (error.response) {
        const errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || 'An error occurred'
        setMessage(errorMessage)
      } else {
        setMessage('Error: Could not connect to server')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="marketing-panel">
        <div className="image-bubble-container">
          <div className="image-bubble">
            <img src="/test.png" alt="Study together" className="bubble-image" />
          </div>
        </div>
        
        <div className="marketing-text">
          <h1 className="marketing-title">Study Together. Succeed Together.</h1>
          <p className="marketing-subtitle">Join your friends to set goals, track progress, and make studying stick.</p>
        </div>
      </div>
      
      <div className="form-panel">
        <div className="logo-container">
          <img src="/logo.png" alt="StudyMate Logo" className="logo-img" />
          <span className="logo-text">StudyMate</span>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab-button ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true)
              setMessage('')
              setEmail('')
              setPassword('')
              setUsername('')
            }}
          >
            Log In
          </button>
          <button 
            className={`tab-button ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false)
              setMessage('')
              setEmail('')
              setPassword('')
              setUsername('')
            }}
          >
            Sign Up
          </button>
        </div>
        
        <h2 className="welcome-text">{isLogin ? 'Welcome Back!' : 'Hello!'}</h2>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}
          
          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </>
                )}
              </svg>
            </button>
          </div>
          
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('successful') || message.includes('created') ? 'message-success' : 'message-error'}`}>
            {message}
          </div>
        )}
        
        <div className="signup-prompt">
          {isLogin ? (
            <>
              Don't have your account? <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>Sign Up</a>
            </>
          ) : (
            <>
              Already have an account? <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>Log In</a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage

