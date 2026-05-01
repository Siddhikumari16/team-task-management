import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import type { Project } from '../types'

interface FormData { name: string; description: string }

export default function Projects() {
  const { currentUser, users, fetchUsers } = useAuthStore()
  const { projects, loading, fetchProjects, addProject, updateProject, deleteProject, addMember, removeMember } = useProjectStore()
  const navigate = useNavigate()
  const isAdmin = currentUser?.role === 'admin'

  const [editing, setEditing] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [managingId, setManagingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<FormData>()

  useEffect(() => { fetchProjects(); fetchUsers() }, [fetchProjects, fetchUsers])

  const openCreate = () => { setEditing(null); reset({ name: '', description: '' }); setShowForm(true) }
  const openEdit = (p: Project) => { setEditing(p); setValue('name', p.name); setValue('description', p.description); setShowForm(true) }

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) await updateProject(editing.id, data)
      else await addProject(data)
      setShowForm(false); reset(); setActionError('')
    } catch { setActionError('Failed to save project') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    try { await deleteProject(id) }
    catch { setActionError('Failed to delete project') }
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Project
          </button>
        )}
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-red-600 text-sm">{actionError}</div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-semibold text-slate-900">{editing ? 'Edit Project' : 'New Project'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Project name</label>
              <input placeholder="e.g. Website Redesign" className={inputCls} {...register('name', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea placeholder="What is this project about?" rows={3} className={inputCls} {...register('description')} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer">
                {isSubmitting ? 'Saving...' : editing ? 'Save changes' : 'Create project'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          </div>
          <p className="text-slate-600 font-medium">No projects yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight">{p.name}</h3>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-0.5 ml-2 shrink-0">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{p.description || 'No description provided'}</p>

                {p.members.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="flex -space-x-1.5">
                      {p.members.slice(0, 4).map(m => (
                        <div key={m.id} title={m.name} className="w-6 h-6 rounded-full bg-violet-200 border-2 border-white flex items-center justify-center text-violet-700 text-xs font-bold">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">{p.members.length} member{p.members.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              <div className="px-5 pb-4 flex gap-2">
                <button onClick={() => navigate(`/projects/${p.id}/tasks`)} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer">
                  View Tasks
                </button>
                {isAdmin && (
                  <button onClick={() => setManagingId(managingId === p.id ? null : p.id)} className={`flex-1 border text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer ${managingId === p.id ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    Members
                  </button>
                )}
              </div>

              {managingId === p.id && (
                <div className="border-t border-slate-100 px-5 py-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Manage Members</p>
                  <div className="space-y-2">
                    {users.filter(u => u.id !== p.createdBy).map(u => {
                      const isMember = p.members.some(m => m.id === u.id)
                      return (
                        <div key={u.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-700">{u.name}</span>
                            <span className="text-xs text-slate-400 capitalize">({u.role})</span>
                          </div>
                          {isMember
                            ? <button onClick={() => removeMember(p.id, u.id)} className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer">Remove</button>
                            : <button onClick={() => addMember(p.id, u.id)} className="text-xs text-violet-600 hover:text-violet-700 font-medium cursor-pointer">Add</button>
                          }
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
