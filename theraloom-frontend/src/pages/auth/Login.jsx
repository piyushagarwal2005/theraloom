import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    searchParams.get('expired') ? 'Your session has expired. Please log in again.' : ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper for major-project evaluators & reviewers
  const handleDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed. Make sure database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-[#19382C] flex items-center justify-center text-white shadow-xs">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="5" stroke="#FAF8F5" strokeWidth="2" strokeDasharray="1 1" />
              <circle cx="15" cy="15" r="5" stroke="#7D9D8B" strokeWidth="2" />
              <path d="M9 14C11 12 13 12 15 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-serif font-bold text-2xl tracking-tight text-[#19382C]">
            Theraloom
          </span>
        </Link>
        <h2 className="font-serif text-2xl font-bold text-[#19382C]">
          Therapist Portal Login
        </h2>
        <p className="text-xs text-[#535C56]">
          Access your private practice management hub, client records, and calendar.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#EAE5DE] shadow-xs space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#19382C] mb-1">
                Practitioner Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr.ananya@theraloom.in"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-sm bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#19382C]">
                  Password
                </label>
                <span className="text-[11px] text-[#7D9D8B] hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-sm bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="pt-4 border-t border-[#EAE5DE] space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#7D9D8B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Practitioner Accounts (One-Click)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('ananya.sharma@theraloom.in', 'Password@123')}
                className="p-2.5 rounded-xl border border-[#D5DDD8] bg-[#E8EFEA] hover:bg-[#d5e4d9] text-left transition-colors"
              >
                <p className="text-xs font-bold text-[#19382C]">Dr. Ananya Sharma</p>
                <p className="text-[10px] text-[#535C56]">Growth Tier (SOAP/DAP)</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('priya.nair@theraloom.in', 'Password@123')}
                className="p-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5] hover:bg-[#F4EFEB] text-left transition-colors"
              >
                <p className="text-xs font-bold text-[#19382C]">Priya Nair</p>
                <p className="text-[10px] text-[#535C56]">Starter Tier (Basic)</p>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-[#535C56]">
            New to Theraloom?{' '}
            <Link to="/register" className="font-semibold text-[#19382C] underline">
              Create practice profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
