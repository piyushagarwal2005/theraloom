import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  Phone,
  Mail,
  MapPin,
  X,
  CreditCard,
  Tag,
  AlertCircle,
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import UpgradeModal from '../../components/common/UpgradeModal';
import api from '../../api/axiosInstance';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Client Detail Drawer
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Add Client Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    tags: 'anxiety, initial-evaluation',
  });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // Upgrade Modal for Tier Cap Gating
  const [upgradeModal, setUpgradeModal] = useState({
    isOpen: false,
    title: '',
    reason: '',
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });
      if (res.data?.success) {
        setClients(res.data.clients || []);
      }
    } catch (err) {
      console.warn('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter]);

  const handleAddClient = async (e) => {
    e.preventDefault();
    setAddError('');
    setAdding(true);

    try {
      const res = await api.post('/clients', {
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        status: newClientData.status,
        tags: newClientData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      if (res.data?.success) {
        setClients((prev) => [res.data.client, ...prev]);
        setAddModalOpen(false);
        setNewClientData({ name: '', email: '', phone: '', status: 'active', tags: '' });
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === 'TIER_LIMIT_REACHED') {
        setAddModalOpen(false);
        setUpgradeModal({
          isOpen: true,
          title: 'Active Client Limit Reached',
          reason: err.response.data.message || 'You have reached the client capacity for your current plan.',
        });
      } else {
        setAddError(err.response?.data?.message || 'Failed to create client record.');
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
              Practice CRM
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19382C]">
              Client Records & Caseload
            </h1>
            <p className="text-xs text-[#535C56]">
              Manage confidential patient profiles, clinical intake records, and treatment agreements.
            </p>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#EAE5DE] shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by client name, email, or presenting tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Filter className="w-4 h-4 text-[#7D9D8B]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5] text-[#1F2421] focus:outline-hidden focus:border-[#19382C]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Caseload</option>
              <option value="lead">New Leads</option>
              <option value="inactive">Archived / Inactive</option>
            </select>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#7D9D8B] animate-pulse">
              Loading client records...
            </div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-[#19382C]">No Clients Found</h3>
              <p className="text-xs text-[#535C56]">
                Clients are automatically enrolled when they book on your profile or when you add them.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#EAE5DE] text-[#535C56] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6">Client Name</th>
                    <th className="py-3.5 px-6">Contact Details</th>
                    <th className="py-3.5 px-6">Intake & Consent</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Tags</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE5DE]">
                  {clients.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => setSelectedClient(c)}
                      className="hover:bg-[#FAF8F5]/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} size="sm" />
                          <div>
                            <span className="font-bold text-[#19382C] group-hover:text-[#244E3E]">
                              {c.name}
                            </span>
                            <p className="text-[11px] text-[#7D9D8B]">
                              Enrolled {new Date(c.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-[#535C56]">
                        <p>{c.email}</p>
                        <p className="text-[11px] text-[#7D9D8B]">{c.phone || 'No phone'}</p>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              c.intakeForm?.isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <FileText className="w-3 h-3" />
                            {c.intakeForm?.isCompleted ? 'Intake Complete' : 'Pending Intake'}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-[#7D9D8B]">
                            <ShieldCheck className="w-3 h-3 text-[#244A3C]" />
                            <span>MHCA Consent Captured</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            c.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(c.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EAE5DE] text-[#535C56]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(c);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[#EAE5DE] bg-white text-xs font-semibold text-[#19382C] hover:bg-[#FAF8F5] transition-colors"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Client Detail Drawer / Modal */}
        {selectedClient && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DE] space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-4 border-b border-[#EAE5DE]">
                <div className="flex items-center gap-4">
                  <Avatar name={selectedClient.name} size="lg" />
                  <div>
                    <h3 className="text-lg font-bold text-[#19382C]">
                      {selectedClient.name}
                    </h3>
                    <p className="text-xs text-[#535C56]">{selectedClient.email}</p>
                    <p className="text-xs text-[#7D9D8B]">{selectedClient.phone || 'Phone not registered'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Intake & Presenting Concerns */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#19382C]">
                  Clinical Intake & Concerns
                </h4>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE] space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-[#19382C]">Demographics: </span>
                    <span>
                      {selectedClient.intakeForm?.demographics?.occupation || 'Not reported'} •{' '}
                      {selectedClient.intakeForm?.demographics?.city || 'India'}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-[#19382C]">Presenting Concerns: </span>
                    <span>
                      {(selectedClient.intakeForm?.presentingConcerns || []).join(', ') || 'General therapy evaluation'}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-[#19382C]">Therapy Goals: </span>
                    <p className="text-[#535C56] mt-0.5">
                      {selectedClient.intakeForm?.therapyGoals || 'Client has not completed detailed goals statement.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Digital Consent Record */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#19382C]">
                  Consent Compliance (MHCA 2017)
                </h4>
                <div className="p-4 rounded-2xl bg-[#E8EFEA] border border-[#D5DDD8] space-y-1.5 text-xs text-[#19382C]">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#244A3C]" />
                    <span>Digital Informed Telehealth Consent</span>
                  </div>
                  <p className="text-[11px] text-[#535C56]">
                    Status: <span className="text-emerald-700 font-semibold">Consented & Auditable</span>
                  </p>
                  <p className="text-[11px] text-[#7D9D8B]">
                    Captured upon session booking. Terms: Indian Mental Healthcare Act 2017 guidelines.
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-[#EAE5DE] flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Client Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DE] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DE]">
                <h3 className="text-base font-bold text-[#19382C]">Enrol New Practice Client</h3>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {addError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <form onSubmit={handleAddClient} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#19382C] mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditi Roy"
                    value={newClientData.name}
                    onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#19382C] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="aditi@example.com"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#19382C] mb-1">Mobile / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+91 98200 12345"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#19382C] mb-1">Clinical Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. anxiety, burnout, student"
                    value={newClientData.tags}
                    onChange={(e) => setNewClientData({ ...newClientData, tags: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 text-xs text-[#535C56]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="px-5 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E]"
                  >
                    {adding ? 'Saving...' : 'Add to Caseload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Subscription Entitlement Upgrade Modal */}
        <UpgradeModal
          isOpen={upgradeModal.isOpen}
          onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
          title={upgradeModal.title}
          reason={upgradeModal.reason}
          featureKey="active_clients_limit"
        />
      </div>
    </div>
  );
}
