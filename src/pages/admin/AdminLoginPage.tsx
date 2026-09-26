import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Flame, ShieldCheck, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { signIn, signUp, hasAnyAdmin, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(!hasAnyAdmin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // If already logged in as admin, redirect to /admin
  React.useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAdminNotice(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const { wasFirstAdmin } = await signUp(email.trim(), password);
        if (wasFirstAdmin) {
          setAdminNotice('🎉 Congratulations! You are the first registered account and have been assigned Administrator privileges.');
          setTimeout(() => navigate('/admin'), 1500);
        } else {
          setError('Account created, but administrator privileges are restricted. Only the initial registered administrator or designated account holds admin access.');
        }
      } else {
        await signIn(email.trim(), password);
        navigate('/admin');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please verify your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-[#11131c] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
            <Flame className="w-8 h-8 text-black fill-black" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Tera Viral Link</h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Portal</span>
          </div>
        </div>

        {/* First admin rule alert banner */}
        {!hasAnyAdmin && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-white block">Initial Setup Notice:</strong>
              No administrator is configured yet. The first account registered here will automatically be granted permanent Administrator privileges.
            </div>
          </div>
        )}

        {adminNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            {adminNotice}
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-[#161a28] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#161a28] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isRegistering ? 'Register as Administrator' : 'Sign In to Dashboard'}</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center flex flex-col gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="text-slate-400 hover:text-amber-400 transition-colors font-medium"
          >
            {isRegistering
              ? 'Already registered? Sign In instead'
              : 'Need to set up the initial admin account? Register'}
          </button>

          <Link to="/" className="text-slate-500 hover:text-slate-300 transition-colors pt-2">
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
};
