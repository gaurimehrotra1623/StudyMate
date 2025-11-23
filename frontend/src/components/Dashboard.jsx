import React, { useMemo, useState } from 'react'
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
      { id: 1, title: 'Finish React Router Module', progress: 65, due: 'Nov 10', collaborators: ['Alice', 'Bob'] },
      { id: 2, title: 'Read 3 chapters of DSA', progress: 40, due: 'Nov 12', collaborators: ['Charlie', 'Diana'] },
      { id: 3, title: 'Build Notes Feature', progress: 20, due: 'Nov 18', collaborators: ['-'] }
    ],
    []
  )
   

  const friendSuggestions = useMemo(
    () => [
      { id: 1, name: 'Sarah Johnson', avatar: '👩‍💻', description: 'Engineering student', mutualFriends: 3 },
      { id: 2, name: 'Mike Chen', avatar: '👨‍🎓', description: 'Computer Science major', mutualFriends: 5 },
      { id: 3, name: 'Emma Wilson', avatar: '👩‍🔬', description: 'Biology researcher', mutualFriends: 2 },
      { id: 4, name: 'David Lee', avatar: '👨‍💼', description: 'Business student', mutualFriends: 4 },
      { id: 5, name: 'Lisa Park', avatar: '👩‍🎨', description: 'Design student', mutualFriends: 1 },
      { id: 6, name: 'James Brown', avatar: '👨‍⚕️', description: 'Medical student', mutualFriends: 6 }
    ],
    []
  )

  const handleAddFriend = (friendId) => {
    // In real app, this would make an API call
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

  const friendsActivity = useMemo(
    () => [
      { id: 1, name: 'Alice', avatar: '👩‍💻', activity: 'Working on React Router Module', time: '5 min ago' },
      { id: 2, name: 'Bob', avatar: '👨‍🎓', activity: 'Completed DSA Chapter 2', time: '12 min ago' },
      { id: 3, name: 'Charlie', avatar: '👨‍💼', activity: 'Started new goal: Learn TypeScript', time: '18 min ago' },
      { id: 4, name: 'Diana', avatar: '👩‍🔬', activity: 'Studying Biology notes', time: '25 min ago' },
      { id: 5, name: 'Eve', avatar: '👩‍🎨', activity: 'Finished Design project', time: '32 min ago' }
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