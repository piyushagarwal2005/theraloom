import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import api from '../../api/axiosInstance';

export default function Navbar() {
  const { therapist, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
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
      const interval = setInterval(fetchNotifs, 20000); // 20s poll
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Motif */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Connected circles / woven-line motif */}
            <div className="w-9 h-9 rounded-xl bg-[#19382C] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="5" stroke="#E4ECE7" strokeWidth="2" strokeDasharray="1 1" />
                <circle cx="15" cy="15" r="5" stroke="#7D9D8B" strokeWidth="2" />
                <path d="M9 14C11 12 13 12 15 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-tight text-[#19382C]">
                Theraloom
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-[#7D9D8B] border-l border-[#D5DDD8] pl-2">
                Thoughtfully Connected
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#535C56]">
            <Link to="/#directory" className="hover:text-[#19382C] transition-colors">
              Find a Therapist
            </Link>
            <Link to="/#features" className="hover:text-[#19382C] transition-colors">
              Platform
            </Link>
            <Link to="/#pricing" className="hover:text-[#19382C] transition-colors">
              Tiers & Pricing
            </Link>
            <Link
              to="/portal"
              className="text-[#19382C] hover:bg-[#E8EFEA] px-2.5 py-1 rounded-md transition-colors"
            >
              Client Portal
            </Link>
          </div>

          {/* Right Area */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Public Link Pill */}
                {therapist?.slug && (
                  <Link
                    to={`/${therapist.slug}`}
                    target="_blank"
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium bg-[#E8EFEA] text-[#19382C] hover:bg-[#D8E6DC] px-3 py-1.5 rounded-full transition-colors border border-[#C5D7CC]"
                    title="View your live public profile"
                  >
                    <span>theraloom.in/{therapist.slug}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </Link>
                )}

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setDropdownOpen(false);
                    }}
                    className="relative p-2 rounded-lg text-[#535C56] hover:text-[#19382C] hover:bg-[#F2ECE4] transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifs > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-[#FAF8F5]" />
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#EAE5DE] py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#F4EFEB] flex items-center justify-between">
                        <span className="font-semibold text-xs uppercase tracking-wider text-[#19382C]">
                          Practice Notifications
                        </span>
                        <span className="text-xs bg-[#E8EFEA] text-[#19382C] px-2 py-0.5 rounded-full font-medium">
                          {unreadNotifs} new
                        </span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-[#FAF8F5]">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-[#535C56]">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} className="p-3 hover:bg-[#FAF8F5] transition-colors text-xs">
                              <p className="font-semibold text-[#19382C]">{n.title}</p>
                              <p className="text-[#535C56] mt-0.5">{n.message}</p>
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

                {/* Therapist Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setDropdownOpen(!dropdownOpen);
                      setNotifOpen(false);
                    }}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-[#F2ECE4] transition-colors"
                  >
                    <img
                      src={
                        therapist?.profileImage ||
                        'https://images.unsplash.com/photo-1594824813572-c51f38e2ec11?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={therapist?.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#C5D7CC]"
                    />
                    <span className="hidden md:inline-block text-xs font-semibold text-[#19382C] max-w-[120px] truncate">
                      {therapist?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#535C56]" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#EAE5DE] py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#F4EFEB]">
                        <p className="text-xs font-bold text-[#19382C] truncate">{therapist?.name}</p>
                        <p className="text-[11px] text-[#7D9D8B] capitalize">{therapist?.subscription?.tierKey || 'Starter'} Plan</p>
                      </div>

                      <div className="py-1 text-xs text-[#1F2421]">
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF8F5]"
                        >
                          <BarChart3 className="w-4 h-4 text-[#19382C]" />
                          Dashboard Overview
                        </Link>
                        <Link
                          to="/dashboard/schedule"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF8F5]"
                        >
                          <Calendar className="w-4 h-4 text-[#19382C]" />
                          Schedule & Slots
                        </Link>
                        <Link
                          to="/dashboard/clients"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF8F5]"
                        >
                          <Users className="w-4 h-4 text-[#19382C]" />
                          Clients CRM
                        </Link>
                        <Link
                          to="/dashboard/notes"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF8F5]"
                        >
                          <FileText className="w-4 h-4 text-[#19382C]" />
                          Clinical Notes (SOAP/DAP)
                        </Link>
                        <Link
                          to="/dashboard/chat"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF8F5]"
                        >
                          <MessageSquare className="w-4 h-4 text-[#19382C]" />
                          Client Messages
                        </Link>
                        <Link
                          to="/dashboard/analytics"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF8F5]"
                        >
                          <BarChart3 className="w-4 h-4 text-[#19382C]" />
                          Practice Analytics
                        </Link>
                        <Link
                          to="/dashboard/payments"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF8F5]"
                        >
                          <CreditCard className="w-4 h-4 text-[#19382C]" />
                          Payments & Invoices
                        </Link>
                        <Link
                          to="/dashboard/subscription"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF8F5] text-amber-700 font-medium"
                        >
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          Subscription Tiers
                        </Link>
                        <Link
                          to="/dashboard/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF8F5]"
                        >
                          <Settings className="w-4 h-4 text-[#19382C]" />
                          Practice Settings
                        </Link>
                      </div>

                      <div className="border-t border-[#F4EFEB] pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#19382C] hover:bg-[#E8EFEA] px-3.5 py-2 rounded-lg transition-colors"
                >
                  Therapist Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-[#19382C] text-white hover:bg-[#122B21] px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  Create Practice
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
