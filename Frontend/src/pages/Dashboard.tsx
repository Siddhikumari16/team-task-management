import { useState, useEffect } from 'react'
import { isAfter, parseISO, format } from 'date-fns'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { apiGetTasks } from '../api/tasks'
import type { Task } from '../types'

export default function Dashboard() {
  const { currentUser, users } = useAuthStore()
  const projects = useProjectStore(s => s.projects)
  const fetchProjects = useProjectStore(s => s.fetchProjects)

  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [filterUser, setFilterUser] = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProjects() }, [fetchProjects])

  useEffect(() => {
    if (projects.length === 0) { setLoading(false); return }
    setLoading(true)
    Promise.all(projects.map(p => apiGetTasks(p.id)))
      .then(r => setAllTasks(r.flat()))
      .finally(() => setLoading(false))
  }, [projects])

  const filtered = allTasks.filter(t =>
    (filterUser ? t.assignedTo === filterUser : true) &&
    (filterProject ? t.projectId === filterProject : true)
  )

  const today = new Date()
  const total = filtered.length
  const completed = filtered.filter(t => t.status === 'done').length
  const pending = filtered.filter(t => t.status !== 'done').length
  const overdue = filtered.filter(t => t.status !== 'done' && t.dueDate && isAfter(today, parseISO(t.dueDate))).length

  const stats = [
    { label: 'Total Tasks', value: total, icon: '📋', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
    { label: 'Completed', value: completed, icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    { label: 'In Progress', value: pending, icon: '⏳', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    { label: 'Overdue', value: overdue, icon: '🚨', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
  ]

  const selectCls = "border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {currentUser?.name?.split(' ')[0]} 👋</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {currentUser?.role === 'admin' && (
          <select className={selectCls} value={filterUser} onChange={e => setFilterUser(e.target.value)}>
            <option value="">All Members</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
        <select className={selectCls} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-5 border ${s.border} shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                {loading ? '—' : s.value}
              </span>
            </div>
            <div className={`text-3xl font-bold ${s.text} mb-0.5`}>{loading ? '—' : s.value}</div>
            <div className="text-xs text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {!loading && total > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
            <span className="text-sm font-bold text-violet-600">{Math.round((completed / total) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span><span className="font-medium text-emerald-600">{completed}</span> completed</span>
            <span><span className="font-medium text-amber-600">{pending}</span> remaining</span>
            {overdue > 0 && <span><span className="font-medium text-red-600">{overdue}</span> overdue</span>}
          </div>
        </div>
      )}

      {/* Recent tasks */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-900">Recent Tasks</h2>
          <span className="text-xs text-slate-400">{filtered.length} total</span>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">No tasks found</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.slice(0, 10).map(t => {
              const project = projects.find(p => p.id === t.projectId)
              const allMembers = projects.flatMap(p => p.members)
              const assignee = allMembers.find(u => u.id === t.assignedTo)
              const isOverdue = t.status !== 'done' && t.dueDate && isAfter(today, parseISO(t.dueDate))
              return (
                <div key={t.id} className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === 'done' ? 'bg-emerald-400' : t.status === 'inprogress' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{project?.name} · {assignee?.name ?? 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {isOverdue && <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-1.5 sm:px-2 py-0.5 rounded-full font-medium hidden sm:inline">Overdue</span>}
                    <span className={`text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ${statusCls(t.status)}`}>{statusLabel(t.status)}</span>
                    {t.dueDate && <span className="text-xs text-slate-400 hidden sm:block">{format(parseISO(t.dueDate), 'MMM d')}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const statusCls = (s: string) => s === 'done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : s === 'inprogress' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-600'
const statusLabel = (s: string) => s === 'done' ? 'Done' : s === 'inprogress' ? 'In Progress' : 'To Do'
