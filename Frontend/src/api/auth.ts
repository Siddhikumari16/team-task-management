import client from './client'
import type { User } from '../types'

interface AuthResponse {
  token: string
  user: User
}

export const apiSignup = (name: string, email: string, password: string, role: string) =>
  client.post<AuthResponse>('/auth/signup', { name, email, password, role })
