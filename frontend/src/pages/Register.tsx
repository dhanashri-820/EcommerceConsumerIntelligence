import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { GlassCard } from '../components/GlassCard';
import { Layers, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-[#05070d] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-8">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.3)] mb-4">
            <Layers className="w-6 h-6 text-neon-cyan" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Consumer <span className="text-neon-cyan font-mono">IQ</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-mono mt-1">
            CREATE OPERATOR ACCOUNT
          </p>
        </div>

        {/* Register Glass Card */}
        <GlassCard glow="cyan" className="p-8">
          <h2 className="text-lg font-bold text-white mb-1">Create Account</h2>
          <p className="text-xs text-slate-400 mb-6">
            Register for access to sentiment models, ABSA radar, and customer mining.
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
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dhanashri Shinde"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 font-mono transition-colors"
                  required
                />
              </div>
            </div>

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
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Password <span className="text-slate-500 lowercase">(min 8 characters)</span>
              </label>
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

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 font-mono transition-colors"
                  required
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
              <CheckCircle2 className="w-4 h-4 text-neon-cyan shrink-0" />
              <span>Includes automatic session authorization & SQLite persistence</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 py-2.5 px-4 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-violet hover:from-cyan-300 hover:to-violet-400 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-slate-400">
            Already have an operator account?{' '}
            <Link to="/login" className="text-neon-cyan font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
