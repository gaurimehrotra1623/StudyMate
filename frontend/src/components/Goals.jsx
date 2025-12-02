import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './Dashboard.css'
import './Goals.css'

const API_BASE_URL = //'http://localhost:3000'
'https://studymate-1fui.onrender.com'

const Goals = ({ onLogout }) => {
  const [goals, setGoals] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [editingData, setEditingData] = useState({ title: '', due: '' })

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_BASE_URL}/api/goals`, {
          withCredentials: true
        })
        if (res.data.success && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map((g) => ({
            id: g.goal_id,
            title: g.title,
            dueRaw: g.due_date,
            due: new Date(g.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })
          }))
          setGoals(mapped)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchGoals()
  }, [])

  const visibleGoals = goals.filter((g) =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteGoal = async (goalId) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/goals/${goalId}`, {
        withCredentials: true
      })
      if (res.data.success) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId))
      }
    } catch (e) {}
  }

  const startEditingGoal = (goal) => {
    setEditingGoalId(goal.id)
    setEditingData({
      title: goal.title,
      due: goal.dueRaw ? new Date(goal.dueRaw).toISOString().slice(0, 10) : ''
    })
  }

  const cancelEditingGoal = () => {
    setEditingGoalId(null)
    setEditingData({ title: '', due: '' })
  }

  const handleUpdateGoal = async (goalId) => {
    try {
      const payload = {}
      if (editingData.title) {
        payload.title = editingData.title
      }
      if (editingData.due) {
        payload.due_date = `${editingData.due}T00:00:00.000Z`
      }

      const res = await axios.put(`${API_BASE_URL}/api/goals/${goalId}`, payload, {
        withCredentials: true
      })

      if (res.data.success && res.data.data) {
        const u = res.data.data
        setGoals((prev) =>
          prev.map((g) =>
            g.id === goalId
              ? {
                  id: u.goal_id,
                  title: u.title,
                  dueRaw: u.due_date,
                  due: new Date(u.due_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })
                }
              : g
          )
        )
        cancelEditingGoal()
      }
    } catch (e) {}
  }

  return (
    <div className="dashboard-root">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="StudyMate Logo" className="sidebar-logo" />
          <span className="sidebar-text">StudyMate</span>
        </div>
        <nav className="sidebar-nav">
          <Link className="nav-link" to="/dashboard">
            Home
          </Link>
          <Link className="nav-link" to="/friends">
            Friends
          </Link>
          <Link className="nav-link active" to="/goals">
            Goals
          </Link>
          <a className="nav-link" href="#account">
            My Account
          </a>
        </nav>
        {onLogout && (
          <button onClick={onLogout} className="sidebar-logout">
            Logout
          </button>
        )}
      </aside>

      <main className="goals-page-main">
        <header className="main-header">
          <div className="welcome">
            <h1 className="welcome-title">All Goals 🎯</h1>
            <p className="welcome-sub">Search, update, or delete any of your goals.</p>
          </div>
        </header>

        <div className="goals-page-card">
          <div className="goals-page-head">
            <h2 className="goals-page-title">Your goals</h2>
            <span className="goals-count-pill">{visibleGoals.length} goals</span>
          </div>

          <div className="goals-search-row">
            <input
              type="text"
              className="goals-search-input"
              placeholder="Search goals by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="goals-empty">Loading goals...</div>
          ) : visibleGoals.length === 0 ? (
            <div className="goals-empty">No goals found.</div>
          ) : (
            <div className="goals-grid">
              {visibleGoals.map((goal) => {
                const isEditing = editingGoalId === goal.id
                return (
                  <div
                    key={goal.id}
                    className={`goal-card ${isEditing ? 'goal-card-editing' : ''}`}
                  >
                    {isEditing ? (
                      <>
                        <div className="goal-edit-fields">
                          <div>
                            <div className="goal-edit-label">Goal title</div>
                            <input
                              type="text"
                              className="goal-edit-input"
                              value={editingData.title}
                              onChange={(e) =>
                                setEditingData({ ...editingData, title: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <div className="goal-edit-label">Due date</div>
                            <input
                              type="date"
                              className="goal-edit-input"
                              value={editingData.due}
                              onChange={(e) =>
                                setEditingData({ ...editingData, due: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="goal-actions">
                          <button
                            className="goal-btn primary"
                            onClick={() => handleUpdateGoal(goal.id)}
                          >
                            Save
                          </button>
                          <button
                            className="goal-btn secondary"
                            onClick={cancelEditingGoal}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="goal-header">
                          <div className="goal-header-main">
                            <h3 className="goal-title">{goal.title}</h3>
                            <div className="goal-meta">
                              <span className="goal-meta-label">Due</span>
                              <span className="goal-meta-date">{goal.due}</span>
                            </div>
                          </div>
                          <div className="goal-chip">
                            <span>🎯</span>
                            <span>Goal</span>
                          </div>
                        </div>
                        <div className="goal-actions">
                          <button
                            className="goal-btn primary"
                            onClick={() => startEditingGoal(goal)}
                          >
                            Update
                          </button>
                          <button
                            className="goal-btn secondary"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Goals


