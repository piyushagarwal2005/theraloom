import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  MessageSquare,
  CreditCard,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  ExternalLink,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react';
import ChatWindow from '../../components/chat/ChatWindow';
import api from '../../api/axiosInstance';

export default function ClientPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [emailInput, setEmailInput] = useState(emailParam);
  const [activeEmail, setActiveEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Loaded client data
  const [clientData, setClientData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'notes' | 'chat' | 'intake' | 'invoices'

  // Chat conversation ID
  const [conversationId, setConversationId] = useState(null);

  // Digital intake form modal/state
  const [intakeSaving, setIntakeSaving] = useState(false);
  const [intakeForm, setIntakeForm] = useState({
    occupation: '',
    city: '',
    presentingConcerns: '',
    therapyGoals: '',
  });

  const fetchClientRecords = async (emailToFetch) => {
    if (!emailToFetch) return;
    setLoading(true);
    setError('');

    try {
      // 1. Fetch Client Profile and Sessions
      const res = await api.get('/clients/portal-lookup', {
        params: { email: emailToFetch.trim() },
      });

      if (res.data?.success) {
        const client = res.data.client;
        setClientData(client);
        setSessions(res.data.sessions || []);
        setPayments(res.data.payments || []);

        // Pre-fill intake form if existing
        if (client.intakeForm) {
          setIntakeForm({
            occupation: client.intakeForm.demographics?.occupation || '',
            city: client.intakeForm.demographics?.city || '',
            presentingConcerns: (client.intakeForm.presentingConcerns || []).join(', '),
            therapyGoals: client.intakeForm.therapyGoals || '',
          });
        }

        // 2. Fetch Shared Notes (Strictly role-restricted client route)
        try {
          const notesRes = await api.get(`/notes/shared/${client._id}`, {
            params: { email: emailToFetch.trim() },
          });
          if (notesRes.data?.success) {
            setSharedNotes(notesRes.data.notes || []);
          }
        } catch (e) {
          console.warn('Could not load shared notes:', e);
        }

        // 3. Fetch or Create Chat Conversation with Therapist
        try {
          const convRes = await api.post('/chat/client-conversation', {
            therapistId: client.therapistId,
            clientId: client._id,
            clientName: client.name,
            clientEmail: client.email,
          });
          if (convRes.data?.success) {
            setConversationId(convRes.data.conversation?._id);
          }
        } catch (e) {
          console.warn('Could not establish chat thread:', e);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No booking records found for this email address. Please make sure you booked with this exact email.'
      );
      setClientData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeEmail) {
      fetchClientRecords(activeEmail);
    }
  }, [activeEmail]);

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setActiveEmail(emailInput.trim());
    setSearchParams({ email: emailInput.trim() });
  };

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    if (!clientData) return;
    setIntakeSaving(true);

    try {
      const res = await api.put(`/clients/${clientData._id}/intake`, {
        demographics: {
          occupation: intakeForm.occupation,
          city: intakeForm.city,
        },
        presentingConcerns: intakeForm.presentingConcerns
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        therapyGoals: intakeForm.therapyGoals,
        isCompleted: true,
      });

      if (res.data?.success) {
        setClientData(res.data.client);
        alert('Intake records updated successfully!');
      }
    } catch (err) {
      alert('Failed to save intake records. Please try again.');
    } finally {
      setIntakeSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 shadow-sanctuary">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
                Patient & Client Sanctuary
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19382C]">
                Client Portal
              </h1>
              <p className="text-xs text-[#535C56] mt-0.5">
                View your upcoming tele-sessions, join encrypted video calls, and access clinical notes shared by your therapist.
              </p>
            </div>

            {clientData && (
              <div className="text-right shrink-0">
                <span className="text-xs text-[#7D9D8B]">Logged in as</span>
                <p className="text-sm font-bold text-[#19382C]">{clientData.name}</p>
                <p className="text-[11px] text-[#535C56]">{clientData.email}</p>
              </div>
            )}
          </div>

          {/* Email Access Form if not loaded */}
          {!clientData && (
            <div className="mt-6 pt-6 border-t border-[#EAE5DE]">
              <form onSubmit={handleLookupSubmit} className="max-w-md space-y-3">
                <label className="block text-xs font-semibold text-[#19382C]">
                  Access Your Portal with Booking Email
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. kunal.j@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all"
                  >
                    {loading ? 'Finding...' : 'Access Portal'}
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-red-600 flex items-center gap-1.5 mt-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </p>
                )}
                <p className="text-[11px] text-[#7D9D8B]">
                  Enter the email address you entered during appointment booking.
                </p>
              </form>
            </div>
          )}
        </div>

        {/* Portal Workspace Tabs */}
        {clientData && (
          <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-[#EAE5DE] pb-2">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'sessions'
                    ? 'bg-[#19382C] text-white shadow-xs'
                    : 'bg-white text-[#535C56] border border-[#EAE5DE] hover:bg-[#FAF8F5]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>My Appointments ({sessions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-[#19382C] text-white shadow-xs'
                    : 'bg-white text-[#535C56] border border-[#EAE5DE] hover:bg-[#FAF8F5]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Shared Clinical Notes ({sharedNotes.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-[#19382C] text-white shadow-xs'
                    : 'bg-white text-[#535C56] border border-[#EAE5DE] hover:bg-[#FAF8F5]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Therapist</span>
              </button>

              <button
                onClick={() => setActiveTab('intake')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'intake'
                    ? 'bg-[#19382C] text-white shadow-xs'
                    : 'bg-white text-[#535C56] border border-[#EAE5DE] hover:bg-[#FAF8F5]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Intake & Consent</span>
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'invoices'
                    ? 'bg-[#19382C] text-white shadow-xs'
                    : 'bg-white text-[#535C56] border border-[#EAE5DE] hover:bg-[#FAF8F5]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Invoices & Payments ({payments.length})</span>
              </button>
            </div>

            {/* TAB 1: SESSIONS */}
            {activeTab === 'sessions' && (
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE5DE] space-y-3">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
                    <h3 className="text-sm font-bold text-[#19382C]">No Appointments Scheduled</h3>
                    <p className="text-xs text-[#535C56]">
                      Book an appointment on your therapist's public profile page.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.map((sess) => (
                      <div
                        key={sess._id}
                        className="bg-white rounded-2xl border border-[#EAE5DE] p-5 shadow-xs space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B]">
                              {sess.serviceName}
                            </span>
                            <h3 className="text-sm font-bold text-[#19382C] mt-0.5">
                              {new Date(sess.startTime).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </h3>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                              sess.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : sess.status === 'completed'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {sess.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-[#535C56] bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE5DE]">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#7D9D8B]" />
                            <span>
                              {new Date(sess.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              -{' '}
                              {new Date(sess.endTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              (IST)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-[#7D9D8B]" />
                            <span>₹{sess.price} (Paid via Razorpay)</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <a
                            href={sess.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-2 shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5 text-[#A9BDA9]" />
                            <span>Join Video Room</span>
                          </a>

                          <span className="text-[11px] text-[#7D9D8B]">
                            Encrypted 1-on-1 Room
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SHARED CLINICAL NOTES (Zero Leakage of Private Notes) */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="bg-[#E8EFEA] p-4 rounded-2xl border border-[#D5DDD8] text-xs text-[#19382C] flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#244A3C] shrink-0" />
                  <p>
                    <span className="font-bold">Confidentiality Protected: </span>
                    You only have access to treatment plans, homework assignments, and insights your therapist has explicitly shared with you. Internal diagnostic and clinical hypothesis notes remain strictly confidential.
                  </p>
                </div>

                {sharedNotes.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE5DE] space-y-2">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto" />
                    <h3 className="text-sm font-bold text-[#19382C]">No Notes Shared Yet</h3>
                    <p className="text-xs text-[#535C56]">
                      Your therapist will share treatment exercises and session takeaways here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sharedNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-white rounded-2xl border border-[#EAE5DE] p-6 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-[#EAE5DE] pb-3">
                          <h3 className="text-sm font-bold text-[#19382C]">{note.title}</h3>
                          <span className="text-[10px] text-[#7D9D8B]">
                            Shared on {new Date(note.sharedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {note.format === 'SOAP' && note.soapData && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE5DE]">
                            {note.soapData.subjective && (
                              <div>
                                <span className="font-bold text-[#19382C] uppercase text-[10px]">
                                  Subjective Focus
                                </span>
                                <p className="text-[#535C56] mt-0.5">{note.soapData.subjective}</p>
                              </div>
                            )}
                            {note.soapData.plan && (
                              <div>
                                <span className="font-bold text-[#19382C] uppercase text-[10px]">
                                  Homework & Treatment Plan
                                </span>
                                <p className="text-[#535C56] mt-0.5">{note.soapData.plan}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {note.format === 'DAP' && note.dapData && (
                          <div className="text-xs bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE5DE] space-y-2">
                            {note.dapData.plan && (
                              <div>
                                <span className="font-bold text-[#19382C] uppercase text-[10px]">
                                  Action Items / Plan
                                </span>
                                <p className="text-[#535C56] mt-0.5">{note.dapData.plan}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {note.content && (
                          <div
                            className="text-xs text-[#1F2421] leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: note.content }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CHAT WITH THERAPIST */}
            {activeTab === 'chat' && (
              <div className="h-[550px]">
                <ChatWindow
                  conversationId={conversationId}
                  senderType="client"
                  senderId={clientData._id}
                  senderName={clientData.name}
                  recipientName="Your Therapist"
                  recipientTitle="Licensed Practitioner"
                />
              </div>
            )}

            {/* TAB 4: INTAKE & CONSENT */}
            {activeTab === 'intake' && (
              <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#19382C]">
                    Intake Information & Digital Consent Records
                  </h3>
                  <p className="text-xs text-[#535C56] mt-1">
                    Your baseline clinical intake records help your therapist understand your personal history and care goals.
                  </p>
                </div>

                <form onSubmit={handleIntakeSubmit} className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#19382C] mb-1">
                        Current City / Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai, Bengaluru"
                        value={intakeForm.city}
                        onChange={(e) => setIntakeForm({ ...intakeForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#19382C] mb-1">
                        Occupation / Field of Work
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Software Engineer, Student"
                        value={intakeForm.occupation}
                        onChange={(e) => setIntakeForm({ ...intakeForm, occupation: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#19382C] mb-1">
                      Presenting Concerns (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Work Stress, Sleep Issues, Relationship Conflict"
                      value={intakeForm.presentingConcerns}
                      onChange={(e) => setIntakeForm({ ...intakeForm, presentingConcerns: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#19382C] mb-1">
                      Therapy Goals & Expectations
                    </label>
                    <textarea
                      rows="3"
                      placeholder="What would you like to achieve in these sessions?"
                      value={intakeForm.therapyGoals}
                      onChange={(e) => setIntakeForm({ ...intakeForm, therapyGoals: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5]"
                    />
                  </div>

                  {/* Auditable Consent Record Display */}
                  <div className="p-4 rounded-2xl bg-[#E8EFEA] border border-[#D5DDD8] space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#19382C]">
                      <CheckCircle2 className="w-4 h-4 text-[#244A3C]" />
                      <span>Digital Telehealth Consent Captured</span>
                    </div>
                    <p className="text-[11px] text-[#535C56]">
                      Agreed to MHCA 2017 telehealth consent upon session booking. Version 1.0 captured.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={intakeSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all"
                  >
                    {intakeSaving ? 'Saving...' : 'Update Intake Details'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 5: INVOICES & PAYMENTS */}
            {activeTab === 'invoices' && (
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE5DE] space-y-2">
                    <CreditCard className="w-10 h-10 text-gray-300 mx-auto" />
                    <h3 className="text-sm font-bold text-[#19382C]">No Invoices Available</h3>
                    <p className="text-xs text-[#535C56]">
                      Receipts will be generated automatically after verified payments.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-[#EAE5DE] overflow-hidden">
                    <div className="divide-y divide-[#EAE5DE]">
                      {payments.map((p) => (
                        <div
                          key={p._id}
                          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#19382C]">
                                {p.invoiceNumber || `INV-${p._id.slice(-6).toUpperCase()}`}
                              </span>
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                                {p.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-[#535C56] mt-0.5">{p.description}</p>
                            <span className="text-[10px] text-[#7D9D8B]">
                              {new Date(p.createdAt).toLocaleDateString()} • Ref: {p.razorpayPaymentId || 'TEST_PAY'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-sm font-bold text-[#19382C]">
                                ₹{p.amount}
                              </span>
                              <p className="text-[10px] text-[#7D9D8B]">Paid</p>
                            </div>

                            {p.invoiceUrl && (
                              <a
                                href={p.invoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] text-[#19382C] hover:bg-[#E8EFEA] transition-colors"
                                title="Download GST Tax Invoice PDF"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
