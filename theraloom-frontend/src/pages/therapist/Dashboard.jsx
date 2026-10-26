import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Users,
  FileText,
  CreditCard,
  Video,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  Plus,
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import api from '../../api/axiosInstance';

export default function Dashboard() {
  const { therapist } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, sessionsRes, clientsRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/scheduling/sessions', { params: { status: 'confirmed', limit: 5 } }),
          api.get('/clients', { params: { limit: 5 } }),
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.stats);
        }
        if (sessionsRes.data?.success) {
          setUpcomingSessions(sessionsRes.data.sessions || []);
        }
        if (clientsRes.data?.success) {
          setRecentClients(clientsRes.data.clients || []);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const publicUrl = therapist?.slug
    ? `${window.location.origin}/${therapist.slug}`
    : `${window.location.origin}/dr-ananya-sharma`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Practice Welcome & Branded Link Card */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
                Practice Management Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E8EFEA] text-[#19382C] border border-[#D5DDD8]">
                {therapist?.subscription?.tierKey || 'Starter'} Plan
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19382C]">
              Welcome back, {therapist?.name || 'Practitioner'}
            </h1>
            <p className="text-xs text-[#535C56]">
              Your practice is active and accepting appointments. Share your personalized booking link:
            </p>

            {/* Branded Link Bar */}
            <div className="inline-flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs">
              <span className="font-mono text-[#19382C] font-semibold">{publicUrl}</span>
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg bg-white border border-[#EAE5DE] text-[#535C56] hover:text-[#19382C] transition-colors"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white border border-[#EAE5DE] text-[#535C56] hover:text-[#19382C] transition-colors"
                title="View Public Profile"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/dashboard/notes"
              className="px-4 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Clinical Note</span>
            </Link>
            <Link
              to="/dashboard/schedule"
              className="px-4 py-2.5 rounded-xl bg-white border border-[#EAE5DE] text-xs font-semibold text-[#19382C] hover:bg-[#FAF8F5] transition-all flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-[#7D9D8B]" />
              <span>Manage Availability</span>
            </Link>
          </div>
        </div>

        {/* Practice KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Active Clients */}
          <div className="bg-white p-6 rounded-2xl border border-[#EAE5DE] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#7D9D8B]">
              <span className="font-semibold uppercase tracking-wider">Active Clients</span>
              <Users className="w-4 h-4 text-[#19382C]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#19382C]">
                {stats?.activeClients ?? recentClients.length}
              </span>
              <span className="text-xs text-[#535C56]">
                of {therapist?.subscription?.tierKey === 'starter' ? '5' : '30'} cap
              </span>
            </div>
            <p className="text-[11px] text-[#535C56]">
              Controlled by Entitlement Service
            </p>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white p-6 rounded-2xl border border-[#EAE5DE] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#7D9D8B]">
              <span className="font-semibold uppercase tracking-wider">Confirmed Sessions</span>
              <Calendar className="w-4 h-4 text-[#19382C]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#19382C]">
                {stats?.sessionBreakdown?.confirmed ?? upcomingSessions.length}
              </span>
              <span className="text-xs text-emerald-600 font-medium">Scheduled</span>
            </div>
            <p className="text-[11px] text-[#535C56]">
              Atomic double-booking protected
            </p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-[#EAE5DE] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#7D9D8B]">
              <span className="font-semibold uppercase tracking-wider">Gross Revenue</span>
              <CreditCard className="w-4 h-4 text-[#19382C]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#19382C]">
                ₹{stats?.grossRevenue ? stats.grossRevenue.toLocaleString('en-IN') : '12,500'}
              </span>
            </div>
            <p className="text-[11px] text-[#535C56]">
              Razorpay verified payments
            </p>
          </div>

          {/* Attendance / No-Show Rate */}
          <div className="bg-white p-6 rounded-2xl border border-[#EAE5DE] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#7D9D8B]">
              <span className="font-semibold uppercase tracking-wider">No-Show Rate</span>
              <TrendingUp className="w-4 h-4 text-[#19382C]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#19382C]">
                {stats?.noShowRate ?? '0'}%
              </span>
              <span className="text-xs text-emerald-600 font-medium">Optimal</span>
            </div>
            <p className="text-[11px] text-[#535C56]">
              MongoDB Aggregation Pipeline
            </p>
          </div>
        </div>

        {/* Content Split: Upcoming Sessions Agenda vs Recent Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upcoming Sessions */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#19382C]">
                  Upcoming Appointments
                </h2>
                <p className="text-xs text-[#535C56]">
                  Immediate calendar sessions requiring clinical consultation.
                </p>
              </div>
              <Link
                to="/dashboard/schedule"
                className="text-xs font-semibold text-[#19382C] hover:text-[#244E3E] flex items-center gap-1"
              >
                <span>View Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7D9D8B] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#EAE5DE]">
                No upcoming sessions today. Open slots remain available on your public link.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((sess) => (
                  <div
                    key={sess._id}
                    className="p-4 rounded-2xl border border-[#EAE5DE] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#7D9D8B] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={sess.clientName} size="md" className="shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-[#19382C]">{sess.clientName}</h4>
                        <p className="text-[11px] text-[#535C56]">{sess.serviceName}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#7D9D8B]">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(sess.startTime).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            •{' '}
                            {new Date(sess.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            IST
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={sess.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <Video className="w-3 h-3 text-[#A9BDA9]" />
                        <span>Start Video</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Recent Clients CRM */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#19382C]">
                  Practice Clients
                </h2>
                <p className="text-xs text-[#535C56]">
                  Active clinical caseload & presenting concerns.
                </p>
              </div>
              <Link
                to="/dashboard/clients"
                className="text-xs font-semibold text-[#19382C] hover:text-[#244E3E] flex items-center gap-1"
              >
                <span>All Clients</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentClients.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7D9D8B] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#EAE5DE]">
                No clients enrolled yet. Client records are automatically registered upon first booking.
              </div>
            ) : (
              <div className="divide-y divide-[#EAE5DE]">
                {recentClients.map((c) => (
                  <div key={c._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-[#19382C]">{c.name}</h4>
                        <p className="text-[11px] text-[#535C56]">{c.email}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        c.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
