import { useEffect, useState } from 'react'
import { AuthContext } from './authContext'
import { api } from '../services/api'

export function AuthProvider({ children }) {
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setParticipant(data.participant))
      .catch(() => setParticipant(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    setParticipant(data.participant)
    return data.participant
  }

  async function register(details) {
    return api.post('/auth/register', details)
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      setParticipant(null)
      return
    }
    setParticipant(null)
  }

  async function refreshParticipant() {
    const { data } = await api.get('/participants/me')
    setParticipant(data.participant)
    return data.participant
  }

  return <AuthContext.Provider value={{ participant, loading, login, register, logout, refreshParticipant }}>{children}</AuthContext.Provider>
}
