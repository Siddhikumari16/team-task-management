import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export default function Signup() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
 defaultValues:{
   role:"member"
 }
})
  const signup = useAuthStore(s => s.signup)
  const navigate = useNavigate()

  const onSubmit = async (data: FormData) => {
    const err = await signup(data.name, data.email, data.password)
    if (err) setError('root', { message: err })
    else navigate('/dashboard')
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <span className="text-white font-semibold text-lg">TaskFlow</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">Start shipping<br />faster today.</h1>
          <p className="text-violet-200 text-base leading-relaxed">Join thousands of teams who use TaskFlow to stay organized and deliver on time.</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-6">
          <p className="text-white text-sm leading-relaxed italic">"TaskFlow transformed how our team collaborates. We ship 2x faster now."</p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-violet-400 flex items-center justify-center text-white text-xs font-bold">S</div>
            <div>
              <div className="text-white text-sm font-medium">Sarah K.</div>
              <div className="text-violet-300 text-xs">Engineering Lead</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
            <p className="text-slate-500 text-sm mt-1">Get started for free, no credit card required</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Select Role
  </label>
  <select {...register("role")} className={inputCls}>
    <option value="member">Member</option>
    <option value="admin">Admin</option>
  </select>
</div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input placeholder="you@company.com" className={inputCls} {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input type="password" placeholder="Min. 6 characters" className={inputCls} {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                <p className="text-red-600 text-sm">{errors.root.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer text-sm mt-2"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 font-medium hover:text-violet-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
