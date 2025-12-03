import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './Dashboard.css'
import './Friends.css'

const API_BASE_URL = //'http://localhost:3000'
'https://studymate-1fui.onrender.com'

export const Friends = ({ onLogout }) => {
  const [existingFriends, setExistingFriends] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [friendsPage, setFriendsPage] = useState(1)
  const [suggestionsPage, setSuggestionsPage] = useState(1)
  const pageSize = 5

  const avatars = ['🐺', '🐞', '🐥', '🐭', '🦊', '🦁', '🐸', '👾', '🐬', '🦄', '🐮', '🐱', '🍇', '🐍']

  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        setLoading(true)
        setError('')

        const [existingRes, suggestionsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/friends/existing`, {
            withCredentials: true
          }),
          axios.get(`${API_BASE_URL}/api/friends/suggestions`, {
            withCredentials: true
          })
        ])

        if (existingRes.data.success) {
          setExistingFriends(existingRes.data.data || [])
        }

        if (suggestionsRes.data.success) {
          setSuggestions(suggestionsRes.data.data || [])
        }
      } catch (err) {
        console.error('Error fetching friends data:', err)
        setError('Failed to load friends. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchFriendsData()
  }, [])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setFriendsPage(1)
    setSuggestionsPage(1)
  }

  const handleAddFriend = async (friendId) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/dashboard/friends`,
        { friendId },
        { withCredentials: true }
      )

      if (res.data.success) {
        // Move this user from suggestions into existing friends
        setSuggestions((prev) => prev.filter((u) => u.user_id !== friendId && u.id !== friendId))
        setExistingFriends((prev) => {
          const added =
            suggestions.find((u) => u.user_id === friendId || u.id === friendId) || null
          if (!added) return prev

          return [
            ...prev,
            {
              id: added.user_id || added.id,
              username: added.username,
              email: added.email
            }
          ]
        })
      }
    } catch (err) {
      console.error('Error adding friend:', err)
      setError(err.response?.data?.message || 'Failed to add friend.')
    }
  }

  const normalizeUser = (u) => ({
    id: u.id ?? u.user_id,
    username: u.username,
    email: u.email
  })

  const filterBySearch = (list) => {
    if (!searchTerm.trim()) return list
    const term = searchTerm.toLowerCase()
    return list.filter((u) =>
      (u.username || '').toLowerCase().includes(term)
    )
  }

  const paginate = (list, page) => {
    const start = (page - 1) * pageSize
    return list.slice(start, start + pageSize)
  }

  const normalizedFriends = existingFriends.map(normalizeUser)
  const normalizedSuggestions = suggestions.map(normalizeUser)

  const filteredFriends = filterBySearch(normalizedFriends)
  const filteredSuggestions = filterBySearch(normalizedSuggestions)

  const totalFriendsPages = Math.max(1, Math.ceil(filteredFriends.length / pageSize) || 1)
  const totalSuggestionsPages = Math.max(
    1,
    Math.ceil(filteredSuggestions.length / pageSize) || 1
  )

  const visibleFriends = paginate(filteredFriends, friendsPage)
  const visibleSuggestions = paginate(filteredSuggestions, suggestionsPage)

  const handleRemoveFriend = async (friendId) => {
    try {
      setError('')

      // Find friend details before we mutate state
      const friendToMove =
        normalizedFriends.find((f) => f.id === friendId) || null

      await axios.delete(`${API_BASE_URL}/api/friends/remove`, {
        data: { friendId },
        withCredentials: true
      })

      // Remove from existing friends
      setExistingFriends((prev) =>
        prev.filter((f) => (f.id ?? f.user_id) !== friendId)
      )

      // Add into suggestions (if not already there)
      if (friendToMove) {
        setSuggestions((prev) => {
          const already = prev.some(
            (u) =>
              (u.id ?? u.user_id) === friendId ||
              u.user_id === friendId
          )
          if (already) return prev

          return [
            ...prev,
            {
              user_id: friendToMove.id,
              username: friendToMove.username,
              email: friendToMove.email
            }
          ]
        })
        setSuggestionsPage(1)
      }
    } catch (err) {
      console.error('Error removing friend:', err)
      setError(err.response?.data?.message || 'Failed to remove friend.')
    }
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
          <Link className="nav-link active" to="/friends">
            Friends
          </Link>
          <Link className="nav-link" to="/goals">
            Goals
          </Link>
          <Link className="nav-link" to="/account">
            My Account
          </Link>
        </nav>
        {onLogout && (
          <button onClick={onLogout} className="sidebar-logout">
            Logout
          </button>
        )}
      </aside>

      <main className="dashboard-main friends-main">
        <header className="main-header">
          <div className="welcome">
            <h1 className="welcome-title">Your Study Circle 🤝</h1>
            <p className="welcome-sub">
              Search for classmates, see existing friends, and discover new study buddies.
            </p>
          </div>
        </header>

        <div className="friends-page-card">
          <div className="friends-search-row">
            <input
              type="text"
              className="friends-search-input"
              placeholder="Search users by username..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {error && <div className="friends-error">{error}</div>}

          {loading ? (
            <div className="friends-loading-block">
              <div className="friends-spinner" />
              <p>Loading friends...</p>
            </div>
          ) : (
            <>
              <section className="friends-section" id="existing-friends">
                <div className="friends-section-head">
                  <h2 className="friends-section-title">Existing Friends</h2>
                  <span className="friends-count">{filteredFriends.length} total</span>
                </div>

                {filteredFriends.length === 0 ? (
                  <p className="friends-empty">No friends found.</p>
                ) : (
                  <>
                    <div className="friends-grid">
                      {visibleFriends.map((friend, index) => {
                        const avatar = avatars[index % avatars.length]
                        return (
                          <div key={friend.id} className="friends-user-card">
                            <div className="friends-avatar">
                              {avatar}
                            </div>
                            <div className="friends-user-info">
                              <h3 className="friends-user-name">{friend.username}</h3>
                              <p className="friends-user-email">{friend.email}</p>
                            </div>
                            <button
                              className="friends-remove-btn"
                              onClick={() => handleRemoveFriend(friend.id)}
                            >
                              Remove Friend
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    {totalFriendsPages > 1 && (
                      <div className="friends-pagination">
                        <button
                          disabled={friendsPage === 1}
                          onClick={() => setFriendsPage((p) => Math.max(1, p - 1))}
                        >
                          Previous
                        </button>
                        <span>
                          Page {friendsPage} of {totalFriendsPages}
                        </span>
                        <button
                          disabled={friendsPage === totalFriendsPages}
                          onClick={() =>
                            setFriendsPage((p) => Math.min(totalFriendsPages, p + 1))
                          }
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>

              <section className="friends-section" id="friend-suggestions">
                <div className="friends-section-head">
                  <h2 className="friends-section-title">Friend Suggestions</h2>
                  <span className="friends-count">
                    {filteredSuggestions.length} total
                  </span>
                </div>

                {filteredSuggestions.length === 0 ? (
                  <p className="friends-empty">No suggestions available right now.</p>
                ) : (
                  <>
                    <div className="friends-grid">
                      {visibleSuggestions.map((user, index) => {
                        const avatar = avatars[index % avatars.length]
                        return (
                          <div key={user.id} className="friends-user-card">
                            <div className="friends-avatar">
                              {avatar}
                            </div>
                            <div className="friends-user-info">
                              <h3 className="friends-user-name">{user.username}</h3>
                              <p className="friends-user-email">{user.email}</p>
                            </div>
                            <button
                              className="friends-add-btn"
                              onClick={() => handleAddFriend(user.id)}
                            >
                              Add Friend
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    {totalSuggestionsPages > 1 && (
                      <div className="friends-pagination">
                        <button
                          disabled={suggestionsPage === 1}
                          onClick={() =>
                            setSuggestionsPage((p) => Math.max(1, p - 1))
                          }
                        >
                          Previous
                        </button>
                        <span>
                          Page {suggestionsPage} of {totalSuggestionsPages}
                        </span>
                        <button
                          disabled={suggestionsPage === totalSuggestionsPages}
                          onClick={() =>
                            setSuggestionsPage((p) =>
                              Math.min(totalSuggestionsPages, p + 1)
                            )
                          }
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
