/**
 * Admin Auth Service
 * Handles PIN validation and session management
 */

const SESSION_KEY = 'admin_session'
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds

export const authService = {
  /**
   * Validate admin PIN
   * @param {string} pin - PIN entered by user
   * @returns {boolean} - Whether PIN is valid
   */
  validatePin(pin) {
    const correctPin = import.meta.env.VITE_ADMIN_PIN
    return pin === correctPin
  },

  /**
   * Create admin session
   * @returns {string} - Session token
   */
  createSession() {
    const token = this.generateSessionToken()
    const session = {
      token,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return token
  },

  /**
   * Generate secure session token
   * @returns {string}
   */
  generateSessionToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36)
  },

  /**
   * Get current session
   * @returns {object|null}
   */
  getSession() {
    const session = sessionStorage.getItem(SESSION_KEY)
    if (!session) return null

    const data = JSON.parse(session)

    // Check if session has expired
    if (this.isSessionExpired(data)) {
      this.clearSession()
      return null
    }

    // Update last activity time
    data.lastActivityAt = Date.now()
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))

    return data
  },

  /**
   * Check if session is valid
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.getSession() !== null
  },

  /**
   * Check if session has expired
   * @param {object} session
   * @returns {boolean}
   */
  isSessionExpired(session) {
    const now = Date.now()
    return now - session.lastActivityAt > SESSION_TIMEOUT
  },

  /**
   * Get time remaining in session (milliseconds)
   * @returns {number}
   */
  getSessionTimeRemaining() {
    const session = this.getSession()
    if (!session) return 0

    const elapsed = Date.now() - session.lastActivityAt
    const remaining = SESSION_TIMEOUT - elapsed
    return Math.max(0, remaining)
  },

  /**
   * Get time remaining in session (formatted string)
   * @returns {string} - "MM:SS"
   */
  getSessionTimeRemainingFormatted() {
    const ms = this.getSessionTimeRemaining()
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  },

  /**
   * Clear session (logout)
   */
  clearSession() {
    sessionStorage.removeItem(SESSION_KEY)
  },
}

export default authService
