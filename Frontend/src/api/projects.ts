import client from './client'
import type { Project } from '../types'

export const apiGetProjects = () => client.get<Project[]>('/projects').then(r => r.data)
export const apiGetProject = (id: string) => client.get<Project>(`/projects/${id}`).then(r => r.data)
export const apiCreateProject = (data: { name: string; description: string }) =>
  client.post<Project>('/projects', data).then(r => r.data)
export const apiUpdateProject = (id: string, data: { name: string; description: string }) =>
  client.put<Project>(`/projects/${id}`, data).then(r => r.data)
export const apiDeleteProject = (id: string) => client.delete(`/projects/${id}`)
export const apiAddMember = (projectId: string, userId: string) =>
  client.post<Project>(`/projects/${projectId}/members`, { userId }).then(r => r.data)
export const apiRemoveMember = (projectId: string, userId: string) =>
  client.delete<Project>(`/projects/${projectId}/members/${userId}`).then(r => r.data)
