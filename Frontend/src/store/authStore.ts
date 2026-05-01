import { create } from 'zustand'
import { apiLogin, apiSignup } from '../api/auth'
import { apiGetUsers } from '../api/users'
import type { User } from '../types'

// MongoDB returns _id — normalize to also have id
function normalize<T extends { _id?: string; id?: string }>(obj: T): T & { id: string } {
  return { ...obj, id: obj._id ?? obj.id ?? '' }
}

function parseToken(token: string): { id: string } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

interface AuthState {
  currentUser: User | null
  users: User[]
  token: string | null
  initializing: boolean
  login: (email: string, password: string) => Promise<string | null>
  signup: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => void
  fetchUsers: () => Promise<void>
  initFromToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  users: [],
  token: localStorage.getItem('token'),
  initializing: !!localStorage.getItem('token'),

  initFromToken: async () => {
    const token = localStorage.getItem('token')
    if (!token) { set({ initializing: false }); return }
    const payload = parseToken(token)
    if (!payload) { localStorage.removeItem('token'); set({ initializing: false, token: null }); return }
    // Token is valid — restore session by fetching users list and finding self
    try {
      const users = await apiGetUsers()
      const normalized = users.map(normalize)
      const me = normalized.find(u => u.id === payload.id || u._id === payload.id)
      if (me) {
        set({ currentUser: me, token, users: normalized })
      } else {
        // Can't find user — token may be stale
        localStorage.removeItem('token')
        set({ token: null })
      }
    } catch {
      localStorage.removeItem('token')
      set({ token: null })
    } finally {
      set({ initializing: false })
    }
  },

  login: async (email, password) => {
    try {
      const data = await apiLogin(email, password)
      const token = data.token
      if (!token) return 'No token in response'
      localStorage.setItem('token', token)
      const user = normalize(data.user)
      set({ currentUser: user, token })
      await get().fetchUsers()
      return null
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      return msg ?? 'Login failed'
    }
  },

  signup: async (name, email, password) => {
    try {
      const data = await apiSignup(name, email, password)
      const token = data.token
      if (!token) return await get().login(email, password)
      localStorage.setItem('token', token)
      const user = normalize(data.user)
      set({ currentUser: user, token })
      await get().fetchUsers()
      return null
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      return msg ?? 'Signup failed'
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ currentUser: null, token: null, users: [] })
  },

  fetchUsers: async () => {
    try {
      const users = await apiGetUsers()
      set({ users: users.map(normalize) })
    } catch {
      // non-critical
    }
  },
}))
