import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Dashboard.css'

const API_BASE_URL = 'https://studymate-1fui.onrender.com'

const Dashboard = ({ onLogout }) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState({ name: '', streakDays: 0 })
  const [ongoingGoals, setOngoingGoals] = useState([])
  const [friendSuggestions, setFriendSuggestions] = useState([])
  const [friendsActivity, setFriendsActivity] = useState([])

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

        // User info - set username from backend
        if (data.user) {
          setUser({
            name: data.user.username || data.user.email?.split('@')[0] || 'User',
            streakDays: 7 // TODO: compute real streak from activity
          })
        }

        // Goals
        const transformedGoals =
          data.ongoingGoals?.map((goal) => ({
            id: goal.goal_id,
            title: goal.title,
            progress: goal.progress || 0,
            due: new Date(goal.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            }),
            collaborators:
              goal.collaborators
                ?.map((c) => c.user?.username || '-')
                .filter((name) => name !== '-') || ['-']
          })) || []
        setOngoingGoals(transformedGoals)

        // Friend suggestions
        const avatars = ['👩‍💻', '👨‍🎓', '👩‍🔬', '👨‍💼', '👩‍🎨', '👨‍⚕️']
        const transformedSuggestions =
          data.friendSuggestions?.map((friend, index) => ({
            id: friend.user_id,
            name: friend.username,
            avatar: avatars[index % avatars.length],
            description: 'StudyMate user',
            mutualFriends: Math.floor(Math.random() * 5) + 1 // placeholder
          })) || []
        setFriendSuggestions(transformedSuggestions)

        // Friends activity
        const activityAvatars = ['👩‍💻', '👨‍🎓', '👨‍💼', '👩‍🔬', '👩‍🎨']
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
      // If 401, let App handle auth state; just stay on page for now
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

  const handleAddFriend = (friendId) => {
    // Optional: wire to backend later
    console.log('Adding friend:', friendId)
  }

  const handleReact = (activityId, reaction) => {
    // In real app, this would make an API call
    console.log('Reacting to activity:', activityId, 'with', reaction)
  }

  const handleMessage = (activityId, friendName) => {
    // In real app, this would open a message dialog or navigate to chat
    console.log('Messaging about activity:', activityId, 'from', friendName)
  }

  const [newGoal, setNewGoal] = useState({ title: '', due: '', collaborators: '' })

  const handleAddGoal = (e) => {
    e.preventDefault()
    // In real app, this would make an API call to add the goal
    console.log('Adding new goal:', newGoal)
    // Reset form
    setNewGoal({ title: '', due: '', collaborators: '' })
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
                <span className="input-icon">👥</span>
                <input
                  type="text"
                  className="goal-input"
                  placeholder="Who's joining you? (comma separated)"
                  value={newGoal.collaborators}
                  onChange={(e) => setNewGoal({ ...newGoal, collaborators: e.target.value })}
                />
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
            <a href="#all-goals" className="section-link">View all</a>
          </div>

          <div className="goals-grid">
            {ongoingGoals.map(goal => (
              <div key={goal.id} className="goal-card">
                <h3 className="goal-title">{goal.title}</h3>
                <div className="goal-meta">
                  <span className="goal-due">Due {goal.due}</span>
                </div>
                <div className="goal-collaboration">
                  <span className="goal-collaboration-label">In collaboration with</span>
                  <span className="goal-collaboration-users">{goal.collaborators.join(', ')}</span>
                </div>
                <div className="goal-progress-section">
                  <span className="goal-progress-label">{goal.progress}%</span>
                  <div className="goal-progressbar">
                    <div
                      className="goal-progressfill"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
                <div className="goal-actions">
                  <button className="goal-btn primary">Continue</button>
                  <button className="goal-btn secondary">Details</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="friend-suggestions" className="friend-suggestions-section">
          <div className="section-head">
            <h2 className="section-title">Friend Suggestions</h2>
            <a href="#all-suggestions" className="section-link">View all</a>
          </div>

          <div className="friend-suggestions-grid">
            {friendSuggestions.map(friend => (
              <div key={friend.id} className="friend-suggestion-card">
                <div className="friend-avatar">{friend.avatar}</div>
                <h3 className="friend-name">{friend.name}</h3>
                <p className="friend-description">{friend.description}</p>
                <p className="friend-mutual">{friend.mutualFriends} mutual friends</p>
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
                  <div className="activity-reactions">
                    <button 
                      className="reaction-btn"
                      onClick={() => handleReact(activity.id, '👍')}
                      title="Like"
                    >
                      👍
                    </button>
                    <button 
                      className="reaction-btn"
                      onClick={() => handleReact(activity.id, '❤️')}
                      title="Love"
                    >
                      ❤️
                    </button>
                    <button 
                      className="reaction-btn"
                      onClick={() => handleReact(activity.id, '🎉')}
                      title="Celebrate"
                    >
                      🎉
                    </button>
                    <button 
                      className="reaction-btn"
                      onClick={() => handleReact(activity.id, '🔥')}
                      title="Fire"
                    >
                      🔥
                    </button>
                    <button 
                      className="message-btn"
                      onClick={() => handleMessage(activity.id, activity.name)}
                      title="Message"
                    >
                      💬 Message
                    </button>
                  </div>
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