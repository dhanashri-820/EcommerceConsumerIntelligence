import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { GlassCard } from '../components/GlassCard';
import { Layers, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login({ email: email.trim(), password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-[#05070d] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.3)] mb-4">
            <Layers className="w-6 h-6 text-neon-cyan" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Consumer <span className="text-neon-cyan font-mono">IQ</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-mono mt-1">
            OPS COMMAND CENTER AUTH
          </p>
        </div>

        {/* Login Glass Card */}
        <GlassCard glow="cyan" className="p-8">
          <h2 className="text-lg font-bold text-white mb-1">Welcome back</h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter your credentials to access the intelligence dashboard.
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-neon-red/10 border border-neon-red/30 flex items-start gap-2.5 text-xs text-neon-red">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@enterprise.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 font-mono transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-mono text-neon-cyan hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 font-mono transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-violet hover:from-cyan-300 hover:to-violet-400 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-slate-400">
            Don't have an operator account?{' '}
            <Link to="/register" className="text-neon-cyan font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
