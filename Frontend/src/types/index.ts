export interface User {
  _id: string
  id: string  // alias, same value
  name: string
  email: string
  role?: 'admin' | 'member'
}

export type TaskStatus = 'todo' | 'inprogress' | 'done'

export interface Task {
  _id: string
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority?: string
  dueDate: string
  assignedTo: string
}

export interface Project {
  _id: string
  id: string
  name: string
  description: string
  members: User[]
  createdBy: string
}
