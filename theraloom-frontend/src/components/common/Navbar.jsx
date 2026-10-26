import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Users,
  FileText,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  PhoneCall,
  ShieldCheck,
  Search,
} from 'lucide-react';
import api from '../../api/axiosInstance';

export default function Navbar() {
  const { therapist, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifs = async () => {
        try {
          const res = await api.get('/chat/notifications');
          if (res.data?.success) {
            setNotifications(res.data.notifications || []);
            setUnreadNotifs(res.data.unreadCount || 0);
          }
        } catch (e) {
          // Ignore
        }
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Crisis & Compliance Ribbon (unfazed.in / Clinical Standard) */}
      <div className="bg-[#122B21] text-[#E4ECE7] py-1.5 px-4 text-[11px] sm:text-xs text-center flex items-center justify-center gap-2 border-b border-[#19382C]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#7D9D8B] shrink-0" />
        <span className="truncate">
          100% Accredited Clinical Psychologists • No Spiritual Bypassing • ₹299 Intro Clarity Session • Emergency:{' '}
          <Link to="/crisis" className="font-bold text-white underline underline-offset-2 hover:text-[#D3A075]">
            Tele-MANAS 14416
          </Link>{' '}
          (24x7 Toll-Free) •{' '}
          <Link to="/crisis" className="text-[#A9BDA9] underline hover:text-white">
            Crisis Helplines →
          </Link>
        </span>
      </div>

      {/* Main Navigation Bar */}
      <nav className="glass-nav border-b border-[#EAE5DE] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Brand Motif */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#19382C] flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="9" r="5" stroke="#FAF8F5" strokeWidth="2" strokeDasharray="1 1" />
                  <circle cx="15" cy="15" r="5" stroke="#7D9D8B" strokeWidth="2" />
                  <path d="M9 14C11 12 13 12 15 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="1.5" fill="#D3A075" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl tracking-tight text-[#19382C]">
                  Theraloom
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#7D9D8B] -mt-1 hidden sm:block">
                  Your Pain Has A Pattern. Break It.
                </span>
              </div>
            </Link>

            {/* Center Editorial Links for Guests */}
            {!isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-6 text-xs font-semibold tracking-wide text-[#535C56]">
                <a
                  href="/#patterns"
                  className="hover:text-[#19382C] transition-colors py-1 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7D9D8B]" />
                  <span>Break Your Pattern</span>
                </a>
                <a
                  href="/#directory"
                  className="hover:text-[#19382C] transition-colors py-1 flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5 text-[#7D9D8B]" />
                  <span>Our Therapists</span>
                </a>
                <a href="/#anti-guru" className="hover:text-[#19382C] transition-colors py-1">
                  The Clinical Standard
                </a>
                <a href="/#how-it-works" className="hover:text-[#19382C] transition-colors py-1">
                  How Care Works
                </a>
                <a
                  href="/#clarity-session"
                  className="text-emerald-800 bg-[#E8EFEA] hover:bg-[#d8e6dc] px-3 py-1 rounded-full font-bold transition-colors"
                >
                  ₹299 Clarity Session
                </a>
                <Link
                  to="/portal"
                  className="text-[#19382C] hover:bg-[#E8EFEA] px-3 py-1.5 rounded-full border border-[#D5DDD8] transition-colors"
                >
                  Client Portal
                </Link>
                <Link
                  to="/crisis"
                  className="text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full border border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>Crisis Helpline</span>
                </Link>
              </div>
            )}

            {/* Practitioner Navigation if Authenticated */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-[#535C56]">
                <Link
                  to="/dashboard"
                  className={`hover:text-[#19382C] transition-colors ${
                    location.pathname === '/dashboard' ? 'text-[#19382C] font-bold' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/schedule"
                  className={`hover:text-[#19382C] transition-colors ${
                    location.pathname.startsWith('/dashboard/schedule') ? 'text-[#19382C] font-bold' : ''
                  }`}
                >
                  Calendar
                </Link>
                <Link
                  to="/dashboard/clients"
                  className={`hover:text-[#19382C] transition-colors ${
                    location.pathname.startsWith('/dashboard/clients') ? 'text-[#19382C] font-bold' : ''
                  }`}
                >
                  Clients
                </Link>
                <Link
                  to="/dashboard/notes"
                  className={`hover:text-[#19382C] transition-colors ${
                    location.pathname.startsWith('/dashboard/notes') ? 'text-[#19382C] font-bold' : ''
                  }`}
                >
                  SOAP/DAP Notes
                </Link>
                <Link
                  to="/dashboard/chat"
                  className={`hover:text-[#19382C] transition-colors ${
                    location.pathname.startsWith('/dashboard/chat') ? 'text-[#19382C] font-bold' : ''
                  }`}
                >
                  Messages
                </Link>
                <Link
                  to="/dashboard/analytics"
                  className={`hover:text-[#19382C] transition-colors ${
                    location.pathname.startsWith('/dashboard/analytics') ? 'text-[#19382C] font-bold' : ''
                  }`}
                >
                  Analytics
                </Link>
              </div>
            )}

            {/* Right Action Area */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Public Link Pill */}
                  {therapist?.slug && (
                    <a
                      href={`/${therapist.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-[#E8EFEA] text-[#19382C] hover:bg-[#d8e6dc] px-3.5 py-1.5 rounded-full transition-all border border-[#C5D7CC]"
                      title="View your public profile as clients see it"
                    >
                      <span>theraloom.in/{therapist.slug}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#7D9D8B]" />
                    </a>
                  )}

                  {/* Notifications Bell */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setNotifOpen(!notifOpen);
                        setDropdownOpen(false);
                      }}
                      className="p-2 rounded-xl text-[#535C56] hover:text-[#19382C] hover:bg-[#FAF8F5] transition-colors relative"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadNotifs > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white animate-pulse" />
                      )}
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#EAE5DE] py-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-4 py-2.5 border-b border-[#FAF8F5] flex items-center justify-between">
                          <span className="font-bold text-xs uppercase tracking-wider text-[#19382C]">
                            Practice Notifications
                          </span>
                          <span className="text-[10px] bg-[#E8EFEA] text-[#19382C] px-2 py-0.5 rounded-full font-bold">
                            {unreadNotifs} unread
                          </span>
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-[#FAF8F5]">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-xs text-[#7D9D8B]">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div key={n._id} className="p-3.5 hover:bg-[#FAF8F5] transition-colors text-xs">
                                <p className="font-bold text-[#19382C]">{n.title}</p>
                                <p className="text-[#535C56] mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                                <span className="text-[10px] text-gray-400 mt-1 inline-block">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Therapist Avatar Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setDropdownOpen(!dropdownOpen);
                        setNotifOpen(false);
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-[#FAF8F5] transition-colors border border-[#EAE5DE]"
                    >
                      <img
                        src={
                          therapist?.profileImage ||
                          'https://images.unsplash.com/photo-1594824813572-c51f38e2ec11?auto=format&fit=crop&q=80&w=150'
                        }
                        alt={therapist?.name}
                        className="w-8 h-8 rounded-xl object-cover border border-[#C5D7CC]"
                      />
                      <span className="hidden md:inline-block text-xs font-bold text-[#19382C] max-w-[120px] truncate">
                        {therapist?.name}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#7D9D8B]" />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-[#EAE5DE] py-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-4 py-2.5 border-b border-[#FAF8F5]">
                          <p className="text-xs font-bold text-[#19382C] truncate">{therapist?.name}</p>
                          <p className="text-[11px] text-[#7D9D8B] font-semibold capitalize mt-0.5">
                            {therapist?.subscription?.tierKey || 'Starter'} Tier
                          </p>
                        </div>

                        <div className="py-1 text-xs text-[#1F2421]">
                          <Link
                            to="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF8F5]"
                          >
                            <BarChart3 className="w-4 h-4 text-[#19382C]" />
                            <span>Overview Dashboard</span>
                          </Link>
                          <Link
                            to="/dashboard/schedule"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF8F5]"
                          >
                            <Calendar className="w-4 h-4 text-[#19382C]" />
                            <span>Availability & Calendar</span>
                          </Link>
                          <Link
                            to="/dashboard/clients"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF8F5]"
                          >
                            <Users className="w-4 h-4 text-[#19382C]" />
                            <span>Patient CRM</span>
                          </Link>
                          <Link
                            to="/dashboard/notes"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF8F5]"
                          >
                            <FileText className="w-4 h-4 text-[#19382C]" />
                            <span>Clinical SOAP/DAP Notes</span>
                          </Link>
                          <Link
                            to="/dashboard/payments"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF8F5]"
                          >
                            <CreditCard className="w-4 h-4 text-[#19382C]" />
                            <span>Invoices & Packages</span>
                          </Link>
                          <Link
                            to="/dashboard/subscription"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF8F5] text-amber-800 font-semibold"
                          >
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span>Subscription Plans</span>
                          </Link>
                          <Link
                            to="/dashboard/settings"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FAF8F5]"
                          >
                            <Settings className="w-4 h-4 text-[#19382C]" />
                            <span>Practice Profile Settings</span>
                          </Link>
                        </div>

                        <div className="border-t border-[#FAF8F5] pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 text-left font-semibold"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out of Practice</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-[#19382C] hover:bg-[#E8EFEA] px-4 py-2 rounded-full transition-colors border border-transparent hover:border-[#D5DDD8]"
                  >
                    Therapist Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-semibold bg-[#19382C] text-white hover:bg-[#244E3E] px-4 sm:px-5 py-2.5 rounded-full shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>Start Practice</span>
                    <span className="hidden sm:inline font-normal text-[#A9BDA9]">• Free</span>
                  </Link>
                </div>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#19382C] hover:bg-[#FAF8F5]"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#EAE5DE] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4">
            {!isAuthenticated ? (
              <div className="space-y-2 text-sm font-semibold text-[#535C56]">
                <a
                  href="#patterns"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-[#FAF8F5] text-[#19382C] font-bold"
                >
                  Break Your Pattern
                </a>
                <a
                  href="#directory"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-[#FAF8F5]"
                >
                  Our Accredited Therapists
                </a>
                <a
                  href="#anti-guru"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-[#FAF8F5]"
                >
                  The Clinical Standard (No Bypassing)
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-[#FAF8F5]"
                >
                  How Care Works
                </a>
                <a
                  href="#clarity-session"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl bg-[#E8EFEA] text-[#19382C] font-bold"
                >
                  ₹299 Clarity Session
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-[#FAF8F5]"
                >
                  Pricing & Tiers
                </a>
                <Link
                  to="/portal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl border border-[#D5DDD8] text-[#19382C]"
                >
                  Client Portal
                </Link>
                <Link
                  to="/crisis"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl bg-rose-50 text-rose-800 font-bold border border-rose-200"
                >
                  24x7 Emergency Helplines (14416)
                </Link>
                <div className="pt-2 border-t border-[#EAE5DE] flex flex-wrap gap-3 text-xs text-[#7D9D8B] px-3">
                  <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#19382C]">Terms</Link>
                  <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#19382C]">Privacy</Link>
                  <Link to="/security" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#19382C]">Security</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 text-sm font-semibold text-[#535C56]">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-[#FAF8F5]"
                >
                  Dashboard Overview
                </Link>
                <Link
                  to="/dashboard/schedule"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-[#FAF8F5]"
                >
                  Calendar & Slots
                </Link>
                <Link
                  to="/dashboard/clients"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-[#FAF8F5]"
                >
                  Clients CRM
                </Link>
                <Link
                  to="/dashboard/notes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-[#FAF8F5]"
                >
                  SOAP/DAP Clinical Notes
                </Link>
                <Link
                  to="/dashboard/payments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl hover:bg-[#FAF8F5]"
                >
                  Payments & Invoices
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
