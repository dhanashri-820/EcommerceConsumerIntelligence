import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { GlassCard } from '../components/GlassCard';
import { Layers, ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      await api.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      // Per security best practices and prompt specs: show success state, never reveal whether account exists
      setSubmitted(true);
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
            ACCOUNT RECOVERY
          </p>
        </div>

        <GlassCard glow="cyan" className="p-8">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-neon-lime/10 border border-neon-lime/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                <CheckCircle className="w-6 h-6 text-neon-lime" />
              </div>
              <h2 className="text-base font-bold text-white">Recovery Instructions Sent</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account exists for <span className="text-slate-200 font-mono">{email}</span>, password reset instructions and security tokens have been dispatched.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-neon-cyan hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-white mb-1">Reset Password</h2>
              <p className="text-xs text-slate-400 mb-6">
                Enter your registered work email to receive password reset instructions.
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
                    Account Email
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-violet hover:from-cyan-300 hover:to-violet-400 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? 'Submitting Request...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
