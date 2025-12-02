import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from "react-router-dom";

import './Dashboard.css'

const API_BASE_URL =  'https://studymate-1fui.onrender.com' 

const Dashboard = ({ onLogout }) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState({ name: ''})
  const [ongoingGoals, setOngoingGoals] = useState([])
  const [friendSuggestions, setFriendSuggestions] = useState([])
  const [friendsActivity, setFriendsActivity] = useState([])
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/dashboard`, {
        withCredentials: true
      })

      if (response.data.success && response.data.data) {
        const data = response.data.data
        if (data.user) {
          const displayName = (data.user.username && data.user.username.trim()) 
            ? data.user.username.trim() 
            : (data.user.email ? data.user.email.split('@')[0] : 'User')
          setUser({
            name: displayName,
            streakDays: 7
          })
        }

        const transformedGoals =
        data.ongoingGoals?.map((goal) => ({
          id: goal.goal_id,
          title: goal.title,
          progress: goal.progress || 0,
          due: new Date(goal.due_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          dueRaw: goal.due_date,
          collaborators: ['-']
        })).slice(0, 6) || []      
        setOngoingGoals(transformedGoals)

        const avatars = ['🐺', '🐞', '🐥', '🐭', '🦊', '🦁', '🐸', '👾', '🐬', '🦄', '🐮', '🐱']
        const transformedSuggestions =
        data.friendSuggestions?.slice(0, 6).map((friend, index) => ({
            id: friend.user_id,
            name: friend.username,
            email: friend.email,
            avatar: avatars[index % avatars.length]
          })) || []
        setFriendSuggestions(transformedSuggestions)
              
        const activityAvatars = ['🐱', '🐞', '🐥', '🐭', '🦊', '🦁', '🐸', '👾', '🐬', '🦄', '🐮', '🐺']
        const transformedActivity =
          data.friendsActivity?.map((activity, index) => ({
            id: activity.id,
            name: activity.user?.username || 'Friend',
            avatar: activityAvatars[index % activityAvatars.length],
            activity: activity.message || activity.type,
            time: formatTimeAgo(new Date(activity.createdAt))
          })) || []
        setFriendsActivity(transformedActivity)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const handleAddFriend = async (friendId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/dashboard/friends`,
        { friendId },
        {
          withCredentials: true
        }
      )

      if (response.data.success) {
        // Remove the friend from suggestions without reloading
        setFriendSuggestions(prev => prev.filter(friend => friend.id !== friendId))
        showToast('Friend added successfully!', 'success')
      }
    } catch (error) {
      console.error('Error adding friend:', error)
      const errorMessage = error.response?.data?.message || 'Failed to add friend'
      showToast(errorMessage, 'error')
    }
  }


  const [newGoal, setNewGoal] = useState({ title: '', due: '' })
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [editingData, setEditingData] = useState({ title: '', due: '' })

  const handleDeleteGoal = async (goalId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/goals/${goalId}`,
        {
          withCredentials: true
        }
      )

      if (response.data.success) {
        setOngoingGoals(prev => prev.filter(goal => goal.id !== goalId))
        showToast('Goal deleted successfully!', 'success')
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      const errorMessage = error.response?.data?.message || 'Failed to delete goal'
      showToast(errorMessage, 'error')
    }
  }

  const handleAddGoal = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/dashboard/goals`,
        {
          title: newGoal.title,
          due_date: `${newGoal.due}T00:00:00.000Z`
        },
        {
          withCredentials: true
        }
      )

      if (response.data.success && response.data.data) {
        const created = response.data.data
        const newGoalCard = {
          id: created.goal_id,
          title: created.title,
          progress: created.progress || 0,
          due: new Date(created.due_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          dueRaw: created.due_date,
          collaborators: ['-']
        }
        setOngoingGoals(prev => [newGoalCard, ...prev].slice(0, 6))
        setNewGoal({ title: '', due: '' })
        showToast('Goal added successfully!', 'success')
      }
    } catch (error) {
      console.error('Error adding goal:', error)
      const errorMessage = error.response?.data?.message || 'Failed to add goal'
      showToast(errorMessage, 'error')
    }
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

      const response = await axios.put(
        `${API_BASE_URL}/api/goals/${goalId}`,
        payload,
        {
          withCredentials: true
        }
      )

      if (response.data.success && response.data.data) {
        const updated = response.data.data
        setOngoingGoals(prev =>
          prev.map(goal =>
            goal.id === goalId
              ? {
                  id: updated.goal_id,
                  title: updated.title,
                  progress: updated.progress || 0,
                  due: new Date(updated.due_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  }),
                  dueRaw: updated.due_date,
                  collaborators: ['-']
                }
              : goal
          )
        )
        showToast('Goal updated successfully!', 'success')
        cancelEditingGoal()
      }
    } catch (error) {
      console.error('Error updating goal:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update goal'
      showToast(errorMessage, 'error')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-root">
        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '4px solid #E5E7EB',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}
            />
            <p style={{ color: '#6B7280' }}>Loading dashboard...</p>
          </div>
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
    <div className="dashboard-root">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="StudyMate Logo" className="sidebar-logo" />
          <span className="sidebar-text">StudyMate</span>
        </div>
        <nav className="sidebar-nav">
          <a className="nav-link active" href="#home">Home</a>
          <Link className="nav-link" to="/friends">Friends</Link>
          <Link className="nav-link" to="/goals">Goals</Link>
          <a className="nav-link" href="#account">My Account</a>
        </nav>
        <button onClick={handleLogout} className="sidebar-logout">Logout</button>
      </aside>

      <main className="dashboard-main">
        <header className="main-header">
          <div className="welcome">
            <h1 className="welcome-title">Welcome back!!📚</h1>
            <p className="welcome-sub">Keep up the momentum. You’re doing great!</p>
          </div>
        </header>

        <section id="add-goal" className="add-goal-section">
          <div className="section-head">
            <h2 className="section-title">
              
              Add New Goal
            </h2>
          </div>
          <form className="add-goal-form" onSubmit={handleAddGoal}>
            <div className="form-row">
              <div className="input-wrapper">
                <span className="input-icon">📝</span>
                <input
                  type="text"
                  className="goal-input"
                  placeholder="What do you want to achieve?"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  required
                />
              </div>
              <div className="input-wrapper">
                <span className="input-icon">📅</span>
                <input
                  type="date"
                  className="goal-input"
                  value={newGoal.due}
                  onChange={(e) => setNewGoal({ ...newGoal, due: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="input-wrapper">
              </div>
              <button type="submit" className="add-goal-btn">
                <span>✨</span>
                Add Goal
              </button>
            </div>
          </form>
        </section>

        <section id="goals" className="goals-section">
          <div className="section-head">
            <h2 className="section-title">Ongoing Goals</h2>
            <Link to="/goals" className="section-link">View all</Link>
          </div>

          <div className="goals-grid">
            {ongoingGoals.map(goal => {
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
                          <span>Ongoing</span>
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
        </section>

        <section id="friend-suggestions" className="friend-suggestions-section">
          <div className="section-head">
            <h2 className="section-title">Friend Suggestions</h2>
            <Link to="/friends" className="section-link">View all</Link>
          </div>

          <div className="friend-suggestions-grid">
            {friendSuggestions.map(friend => (
              <div key={friend.id} className="friend-suggestion-card">
                <div className="friend-avatar">{friend.avatar}</div>
                <h3 className="friend-name">{friend.name}</h3>
                <p className="friend-email">{friend.email}</p>
                <button 
                  className="friend-add-btn"
                  onClick={() => handleAddFriend(friend.id)}
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        </section>

        <section id="friends-activity" className="friends-activity-section">
          <div className="section-head">
            <h2 className="section-title">What Friends Are Doing</h2>
            <a href="#all-activity" className="section-link">View all</a>
          </div>

          <div className="friends-activity-list">
            {friendsActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-avatar">{activity.avatar}</div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-name">{activity.name}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <p className="activity-text">{activity.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}
    </div>
  )
}

export default Dashboard