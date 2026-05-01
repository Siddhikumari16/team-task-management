import { create } from 'zustand'
import { apiGetTasks, apiCreateTask, apiUpdateTask, apiDeleteTask } from '../api/tasks'
import type { Task, TaskStatus } from '../types'

function norm(t: Task): Task {
  return { ...t, id: t._id ?? t.id }
}

interface TaskState {
  tasks: Task[]
  loading: boolean
  fetchTasks: (projectId: string) => Promise<void>
  addTask: (data: Omit<Task, 'id' | '_id'>) => Promise<void>
  updateTask: (id: string, data: Partial<Omit<Task, 'id' | '_id'>>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  updateStatus: (id: string, status: TaskStatus) => Promise<void>
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: false,

  fetchTasks: async (projectId) => {
    set({ loading: true })
    try {
      const tasks = await apiGetTasks(projectId)
      set({ tasks: tasks.map(norm) })
    } finally {
      set({ loading: false })
    }
  },

  addTask: async (data) => {
    const task = await apiCreateTask(data as Omit<Task, 'id'>)
    set(s => ({ tasks: [...s.tasks, norm(task)] }))
  },

  updateTask: async (id, data) => {
    const updated = await apiUpdateTask(id, data)
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? norm(updated) : t) }))
  },

  deleteTask: async (id) => {
    await apiDeleteTask(id)
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
  },

  updateStatus: async (id, status) => {
    const updated = await apiUpdateTask(id, { status })
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? norm(updated) : t) }))
  },
}))
