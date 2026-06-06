import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputCls =
    'w-full bg-[var(--bg-input)] border border-[var(--border)] focus:border-blue-500/60 rounded-lg px-4 py-2.5 text-sm text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-all duration-150';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-1)] tracking-tight">AI-Native ERP</h1>
          <p className="text-xs text-[var(--text-3)] mt-1">
            {mode === 'login' ? 'Sign in to your workspace' : 'Create your account'}
          </p>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
          <div className="flex rounded-lg bg-[var(--bg-input)] p-0.5 mb-6">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  mode === m
                    ? 'bg-[var(--bg-surface)] text-[var(--text-1)] shadow-sm'
                    : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-3)] mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-medium text-[var(--text-3)] mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[var(--text-3)] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2.5 rounded-lg font-medium transition-all duration-150 shadow-[0_1px_4px_rgba(37,99,235,0.3)] mt-1"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'register' && (
            <p className="text-[10px] text-[var(--text-3)] text-center mt-4">
              The first account created becomes an <span className="text-blue-400">admin</span>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
