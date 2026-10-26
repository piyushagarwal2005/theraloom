import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  Award,
} from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    title: 'Clinical Psychologist',
    consultationFee: 1800,
    qualifications: 'M.Phil Clinical Psychology',
    agreeTerms: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live slug preview
  const previewSlug = (formData.name || 'your-name')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setError('Please agree to the practitioner terms and clinical ethics guidelines.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        title: formData.title,
        qualifications: formData.qualifications,
        consultationFee: Number(formData.consultationFee) || 1800,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. A practitioner with this email may already exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
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
          Create Your Practice Profile
        </h2>
        <p className="text-xs text-[#535C56]">
          Set up your branded booking link and client practice workspace in minutes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
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
                Full Practitioner Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  name="name"
                  placeholder="e.g. Dr. Kavita Deshmukh"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-sm bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
                />
              </div>
            </div>

            {/* Branded Link Preview */}
            <div className="p-3 rounded-xl bg-[#E8EFEA] border border-[#D5DDD8] text-xs text-[#19382C] flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#7D9D8B] shrink-0" />
              <div className="truncate">
                <span className="text-[#535C56]">Your Public Practice URL: </span>
                <span className="font-mono font-bold">theraloom.in/{previewSlug}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#19382C] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    name="email"
                    placeholder="kavita@practice.in"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-sm bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#19382C] mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-sm bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#19382C] mb-1">
                  Professional Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Licensed Clinical Psychologist"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-sm bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#19382C] mb-1">
                  Session Fee (INR)
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  placeholder="1800"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-sm bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#19382C] mb-1">
                Degrees & Qualifications
              </label>
              <input
                type="text"
                name="qualifications"
                placeholder="e.g. M.Phil Clinical Psychology (NIMHANS), RCI Reg."
                value={formData.qualifications}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-sm bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="terms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-0.5 rounded-md text-[#19382C] focus:ring-[#19382C]"
              />
              <label htmlFor="terms" className="text-xs text-[#535C56] leading-relaxed cursor-pointer">
                I agree to the practitioner terms, Indian Mental Healthcare Act 2017 ethical guidelines, and Theraloom privacy practices.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>{loading ? 'Creating Your Practice...' : 'Launch Practice Profile'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#535C56]">
            Already have a practice account?{' '}
            <Link to="/login" className="font-semibold text-[#19382C] underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
