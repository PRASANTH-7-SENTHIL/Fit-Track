'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { resetPassword } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      console.warn('Reset password error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(err.message || 'Failed to dispatch reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Login</span>
        </Link>

        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-14 w-14 text-lime-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Reset Link Dispatched</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              We have dispatched a password recovery instruction link to <span className="text-white font-semibold">{email}</span>. Please inspect your inbox and spam folder.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white text-center shadow-lg transition-all"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black text-white mb-2">Reset Password</h2>
            <p className="text-xs text-slate-400 mb-6">
              Enter your registered email address and our security service will send you a reset link.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="athlete@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Sending Reset Instructions...' : 'Send Password Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
