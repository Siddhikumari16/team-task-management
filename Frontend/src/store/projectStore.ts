import { create } from 'zustand'
import { apiGetProjects, apiCreateProject, apiUpdateProject, apiDeleteProject, apiAddMember, apiRemoveMember } from '../api/projects'
import type { Project } from '../types'

function norm(p: Project): Project {
  return {
    ...p,
    id: p._id ?? p.id,
    members: (p.members ?? []).map(m => ({ ...m, id: m._id ?? m.id })),
  }
}

interface ProjectState {
  projects: Project[]
  loading: boolean
  fetchProjects: () => Promise<void>
  addProject: (data: { name: string; description: string }) => Promise<void>
  updateProject: (id: string, data: { name: string; description: string }) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  addMember: (projectId: string, userId: string) => Promise<void>
  removeMember: (projectId: string, userId: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const projects = await apiGetProjects()
      set({ projects: projects.map(norm) })
    } finally {
      set({ loading: false })
    }
  },

  addProject: async (data) => {
    const project = await apiCreateProject(data)
    set(s => ({ projects: [...s.projects, norm(project)] }))
  },

  updateProject: async (id, data) => {
    const updated = await apiUpdateProject(id, data)
    set(s => ({ projects: s.projects.map(p => p.id === id ? norm(updated) : p) }))
  },

  deleteProject: async (id) => {
    await apiDeleteProject(id)
    set(s => ({ projects: s.projects.filter(p => p.id !== id) }))
  },

  addMember: async (projectId, userId) => {
    const updated = await apiAddMember(projectId, userId)
    set(s => ({ projects: s.projects.map(p => p.id === projectId ? norm(updated) : p) }))
  },

  removeMember: async (projectId, userId) => {
    const updated = await apiRemoveMember(projectId, userId)
    set(s => ({ projects: s.projects.map(p => p.id === projectId ? norm(updated) : p) }))
  },
}))
