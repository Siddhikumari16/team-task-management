import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { isAfter, parseISO, format } from 'date-fns'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import type { Task, TaskStatus } from '../types'

interface FormData { title: string; description: string; assignedTo: string; dueDate: string; status: TaskStatus }

const COLUMNS: { key: TaskStatus; label: string; dot: string; cardBorder: string; headerBg: string }[] = [
  { key: 'todo', label: 'To Do', dot: 'bg-slate-400', cardBorder: 'border-slate-200', headerBg: 'bg-slate-50' },
  { key: 'inprogress', label: 'In Progress', dot: 'bg-amber-400', cardBorder: 'border-amber-100', headerBg: 'bg-amber-50' },
  { key: 'done', label: 'Done', dot: 'bg-emerald-400', cardBorder: 'border-emerald-100', headerBg: 'bg-emerald-50' },
]

export default function Tasks() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()
  const { tasks, loading, fetchTasks, addTask, updateTask, deleteTask, updateStatus } = useTaskStore()
  const isAdmin = currentUser?.role === 'admin'

  const [editing, setEditing] = useState<Task | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [actionError, setActionError] = useState('')

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<FormData>({ defaultValues: { status: 'todo' } })

  useEffect(() => {
    if (projects.length === 0) fetchProjects()
    if (projectId) fetchTasks(projectId)
  }, [projectId, fetchProjects, fetchTasks, projects.length])

  const project = projects.find(p => p.id === projectId)
  const myTasks = isAdmin ? tasks : tasks.filter(t => t.assignedTo === currentUser!.id)
  const members = project?.members ?? []
  const today = new Date()

  const openCreate = () => { setEditing(null); reset({ title: '', description: '', assignedTo: '', dueDate: '', status: 'todo' }); setShowForm(true) }
  const openEdit = (t: Task) => {
    setEditing(t)
    setValue('title', t.title); setValue('description', t.description)
    setValue('assignedTo', t.assignedTo); setValue('dueDate', t.dueDate); setValue('status', t.status)
    setShowForm(true)
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) await updateTask(editing.id, data)
      else await addTask({ ...data, projectId: projectId! })
      setShowForm(false); reset(); setActionError('')
    } catch { setActionError('Failed to save task') }
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"

  if (!loading && !project) return (
    <div className="flex flex-col items-center justify-center py-24">
      <p className="text-slate-500 mb-4">Project not found</p>
      <button onClick={() => navigate('/projects')} className="text-violet-600 text-sm font-medium hover:underline cursor-pointer">← Back to Projects</button>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <button onClick={() => navigate('/projects')} className="flex items-center gap-1.5 text-slate-400 hover:text-violet-600 text-sm transition-colors cursor-pointer mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Projects
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{project?.name ?? '...'}</h1>
          {project?.description && <p className="text-slate-500 text-sm mt-1 line-clamp-2">{project.description}</p>}
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Task
          </button>
        )}
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-red-600 text-sm">{actionError}</div>
      )}

      {/* Task form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-semibold text-slate-900">{editing ? 'Edit Task' : 'New Task'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
              <input placeholder="What needs to be done?" className={inputCls} {...register('title', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea placeholder="Add more details..." rows={2} className={inputCls} {...register('description')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Assignee</label>
                <select className={inputCls} {...register('assignedTo', { required: true })}>
                  <option value="">Select member...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Due date</label>
                <input type="date" className={inputCls} {...register('dueDate')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select className={inputCls} {...register('status')}>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer">
                {isSubmitting ? 'Saving...' : editing ? 'Save changes' : 'Create task'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban board */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading tasks...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {COLUMNS.map(col => {
            const colTasks = myTasks.filter(t => t.status === col.key)
            return (
              <div key={col.key} className="flex flex-col">
                {/* Column header */}
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl mb-3 ${col.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-sm font-semibold text-slate-700">{col.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-sm">{colTasks.length}</span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3">
                  {colTasks.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-100 rounded-xl py-8 text-center text-slate-300 text-sm">
                      No tasks
                    </div>
                  ) : colTasks.map(t => {
                    const assignee = members.find(u => u.id === t.assignedTo)
                    const overdue = t.status !== 'done' && t.dueDate && isAfter(today, parseISO(t.dueDate))
                    return (
                      <div key={t.id} className={`bg-white rounded-xl border ${overdue ? 'border-red-200' : col.cardBorder} shadow-sm hover:shadow-md transition-all p-4`}>
                        {/* Card header */}
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-semibold text-slate-800 leading-snug pr-2">{t.title}</p>
                          {isAdmin && (
                            <div className="flex gap-0.5 shrink-0">
                              <button onClick={() => openEdit(t)} className="p-1 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => deleteTask(t.id)} className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          )}
                        </div>

                        {t.description && <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">{t.description}</p>}

                        {/* Meta */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold">
                              {assignee?.name?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <span className="text-xs text-slate-500">{assignee?.name ?? 'Unassigned'}</span>
                          </div>
                          {t.dueDate && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${overdue ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                              {overdue ? '⚠ ' : ''}{format(parseISO(t.dueDate), 'MMM d')}
                            </span>
                          )}
                        </div>

                        {/* Status selector */}
                        {(isAdmin || t.assignedTo === currentUser!.id) && (
                          <select
                            value={t.status}
                            onChange={e => updateStatus(t.id, e.target.value as TaskStatus)}
                            className="w-full mt-3 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-400 cursor-pointer bg-slate-50"
                          >
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
