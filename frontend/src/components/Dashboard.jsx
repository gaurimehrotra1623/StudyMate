import React, { useMemo } from 'react'
import axios from 'axios'
import './Dashboard.css'

const Dashboard = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await axios.post(
        'https://studymate-1fui.onrender.com/api/auth/logout',
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

  // Demo data for personalization and goals; in real app, fetch from API
  const user = useMemo(() => ({ name: 'Gauri', streakDays: 7 }), [])
  const ongoingGoals = useMemo(
    () => [
      { id: 1, title: 'Finish React Router Module', progress: 65, due: 'Nov 10' },
      { id: 2, title: 'Read 3 chapters of DSA', progress: 40, due: 'Nov 12' },
      { id: 3, title: 'Build Notes Feature', progress: 20, due: 'Nov 18' }
    ],
    []
  )

  return (
    <div className="dashboard-root">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="StudyMate Logo" className="sidebar-logo" />
          <span className="sidebar-text">StudyMate</span>
        </div>
        <nav className="sidebar-nav">
          <a className="nav-link active" href="#home">Home</a>
          <a className="nav-link" href="#friends">Friends</a>
          <a className="nav-link" href="#goals">Goals</a>
          <a className="nav-link" href="#account">My Account</a>
        </nav>
        <button onClick={handleLogout} className="sidebar-logout">Logout</button>
      </aside>

      <main className="dashboard-main">
        <header className="main-header">
          <div className="welcome">
            <h1 className="welcome-title">Welcome back, {user.name} 👋</h1>
            <p className="welcome-sub">Keep up the momentum. You’re doing great!</p>
          </div>
          <div className="streak-bubble" title={`${user.streakDays}-day streak`}>
            <span className="flame">🔥</span>
            <span className="streak-count">{user.streakDays}</span>
            <span className="streak-label">day streak</span>
          </div>
        </header>

        <section id="goals" className="goals-section">
          <div className="section-head">
            <h2 className="section-title">Ongoing Goals</h2>
            <a href="#all-goals" className="section-link">View all</a>
          </div>

          <div className="goals-grid">
            {ongoingGoals.map(goal => (
              <div key={goal.id} className="goal-card">
                <h3 className="goal-title">{goal.title}</h3>
                <div className="goal-meta">
                  <span className="goal-due">Due {goal.due}</span>
                  <span className="goal-progress-label">{goal.progress}%</span>
                </div>
                <div className="goal-progressbar">
                  <div
                    className="goal-progressfill"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="goal-actions">
                  <button className="goal-btn primary">Continue</button>
                  <button className="goal-btn secondary">Details</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard

