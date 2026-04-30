import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setToken, api } from '../api';
import Logo from '../components/Logo';

const FEATURES = [
  { icon: '🗂️', text: 'Plan and manage weekly sprints' },
  { icon: '✅', text: 'Track tasks with priority & hours' },
  { icon: '👥', text: 'Assign tasks to team members' },
  { icon: '📄', text: 'Export beautiful PDF reports' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !password) { setError('Email and password are required'); setLoading(false); return; }
    try {
      const data = await api.login({ email, password });
      setToken(data.token);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-xl border border-gray-100">

        {/* Left panel */}
        <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden flex-col justify-between p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
          </div>
          <div className="relative">
            <Link to="/" className="flex items-center gap-2">
              <Logo size={28} />
              <span className="text-lg font-bold text-white">Sprint<span className="text-indigo-200">Base</span></span>
            </Link>
          </div>
          <div className="relative space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                Manage sprints.<br />Ship faster.
              </h2>
              <p className="text-indigo-200 text-sm leading-relaxed">
                The sprint management tool built for developers and small teams.
              </p>
            </div>
            <div className="space-y-3">
              {FEATURES.map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-sm shrink-0">
                    {icon}
                  </div>
                  <span className="text-sm text-indigo-100">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <p className="text-indigo-300 text-xs">© 2026 SprintBase</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-7/12 flex items-center justify-center bg-white px-8 py-10">
          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-6 text-center">
              <Link to="/" className="inline-flex items-center gap-2">
                <Logo size={28} />
                <span className="text-xl font-bold text-gray-900">Sprint<span className="text-indigo-600">Base</span></span>
              </Link>
            </div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 transition">
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
                {loading && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center justify-between mt-6">
              <Link to="/" className="text-xs text-gray-400 hover:text-gray-700 transition">
                ← Back to home
              </Link>
              <Link to="/docs" className="text-xs text-gray-400 hover:text-gray-700 transition">
                Documentation
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
