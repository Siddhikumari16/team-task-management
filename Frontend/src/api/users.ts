import client from './client'
import type { User } from '../types'

export const apiGetUsers = () => client.get<User[]>('/users').then(r => r.data)
