import client from './client'
import type { Task } from '../types'

export const apiGetTasks = (projectId: string) =>
  client.get<Task[]>('/tasks', { params: { projectId } }).then(r => r.data)
export const apiCreateTask = (data: Omit<Task, 'id'>) =>
  client.post<Task>('/tasks', data).then(r => r.data)
export const apiUpdateTask = (id: string, data: Partial<Omit<Task, 'id'>>) =>
  client.put<Task>(`/tasks/${id}`, data).then(r => r.data)
export const apiDeleteTask = (id: string) => client.delete(`/tasks/${id}`)
