import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Plus,
  CheckCircle2,
  AlertCircle,
  Package as PackageIcon,
  Search,
  Filter,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { downloadInvoice } from '../../utils/downloadInvoice';

export default function Payments() {
  const { therapist } = useAuth();
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'packages'
  const [payments, setPayments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalNetRevenue, setTotalNetRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // Create Package Modal
  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [pkgData, setPkgData] = useState({
    title: 'Anxiety Resilience Package (6 Sessions)',
    sessionCount: 6,
    price: 9900,
    validityDays: 90,
    description: 'Comprehensive 6-session structured cognitive behavioural course.',
  });
  const [creatingPkg, setCreatingPkg] = useState(false);

  // Manual Offline Payment Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualData, setManualData] = useState({
    clientName: '',
    clientEmail: '',
    amount: 1800,
    paymentMethod: 'cash',
    description: 'In-clinic / Offline Therapy Consultation',
  });
  const [recordingManual, setRecordingManual] = useState(false);

  const fetchPaymentsAndPackages = async () => {
    setLoading(true);
    try {
      const [payRes, pkgRes] = await Promise.all([
        api.get('/payments'),
        therapist?.slug ? api.get(`/payments/packages/${therapist.slug}`) : Promise.resolve({ data: {} }),
      ]);

      if (payRes.data?.success) {
        setPayments(payRes.data.payments || []);
        setTotalRevenue(payRes.data.totalRevenue || 0);
        setTotalNetRevenue(payRes.data.totalNetRevenue || 0);
      }

      if (pkgRes.data?.success) {
        setPackages(pkgRes.data.packages || []);
      }
    } catch (err) {
      console.warn('Failed to fetch payments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsAndPackages();
  }, [therapist?.slug]);

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setCreatingPkg(true);
    try {
      const res = await api.post('/payments/packages', {
        title: pkgData.title,
        sessionCount: Number(pkgData.sessionCount),
        price: Number(pkgData.price),
        validityDays: Number(pkgData.validityDays),
        description: pkgData.description,
      });

      if (res.data?.success) {
        setPackages((prev) => [res.data.package, ...prev]);
        setPkgModalOpen(false);
        alert('Therapy package created successfully!');
      }
    } catch (err) {
      alert('Failed to create package.');
    } finally {
      setCreatingPkg(false);
    }
  };

  const handleRecordManualPayment = async (e) => {
    e.preventDefault();
    setRecordingManual(true);
    try {
      const res = await api.post('/payments/record-manual', {
        clientName: manualData.clientName,
        clientEmail: manualData.clientEmail,
        amount: Number(manualData.amount),
        paymentMethod: manualData.paymentMethod,
        description: manualData.description,
      });

      if (res.data?.success) {
        setManualModalOpen(false);
        fetchPaymentsAndPackages();
        alert('Payment recorded and GST Tax invoice generated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record manual payment.');
    } finally {
      setRecordingManual(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.clientName?.toLowerCase().includes(term) ||
      p.clientEmail?.toLowerCase().includes(term) ||
      p.invoiceNumber?.toLowerCase().includes(term) ||
      p.razorpayPaymentId?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
                Financial Operations
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Razorpay Test Mode Active
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19382C]">
              Payments, Packages & GST Invoices
            </h1>
            <p className="text-xs text-[#535C56]">
              Verified gateway collections, multi-session discounts, and automated PDF tax receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-[#19382C] text-white shadow-xs'
                  : 'bg-white text-[#535C56] border border-[#EAE5DE]'
              }`}
            >
              Transactions ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'packages'
                  ? 'bg-[#19382C] text-white shadow-xs'
                  : 'bg-white text-[#535C56] border border-[#EAE5DE]'
              }`}
            >
              Packages ({packages.length})
            </button>

            <button
              onClick={() => setManualModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Offline Payment</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-[#EAE5DE] shadow-xs space-y-2">
            <span className="text-xs font-semibold text-[#7D9D8B] uppercase tracking-wider">
              Total Collections
            </span>
            <div className="text-2xl font-bold text-[#19382C]">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-[#535C56]">Across {payments.length} verified sessions</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EAE5DE] shadow-xs space-y-2">
            <span className="text-xs font-semibold text-[#7D9D8B] uppercase tracking-wider">
              Net Practice Earnings
            </span>
            <div className="text-2xl font-bold text-[#19382C]">
              ₹{totalNetRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-[#535C56]">After Razorpay & platform processing</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EAE5DE] shadow-xs space-y-2">
            <span className="text-xs font-semibold text-[#7D9D8B] uppercase tracking-wider">
              Automated Invoicing
            </span>
            <div className="text-2xl font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6" />
              <span>100% Tax Compliant</span>
            </div>
            <p className="text-[11px] text-[#535C56]">PDF receipts auto-sent on capture</p>
          </div>
        </div>

        {/* TAB 1: TRANSACTIONS TABLE */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-[#EAE5DE] shadow-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search transactions by client name, email, invoice number, or payment ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#EAE5DE] shadow-xs overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-xs text-[#7D9D8B] animate-pulse">
                  Loading payment history...
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <CreditCard className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-bold text-[#19382C]">No Payments Recorded Yet</h3>
                  <p className="text-xs text-[#535C56]">
                    Transactions will appear when clients book appointments or buy packages.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#EAE5DE] text-[#535C56] font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3.5 px-6">Invoice #</th>
                        <th className="py-3.5 px-6">Client</th>
                        <th className="py-3.5 px-6">Description</th>
                        <th className="py-3.5 px-6">Date</th>
                        <th className="py-3.5 px-6">Status</th>
                        <th className="py-3.5 px-6">Gross / Net</th>
                        <th className="py-3.5 px-6 text-right">PDF Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE5DE]">
                      {filteredPayments.map((p) => (
                        <tr key={p._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-[#19382C]">
                            {p.invoiceNumber || `INV-${p._id.slice(-6).toUpperCase()}`}
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={p.clientName} size="sm" />
                              <div>
                                <span className="font-semibold text-[#19382C]">{p.clientName}</span>
                                <p className="text-[11px] text-[#7D9D8B]">{p.clientEmail}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-[#535C56] max-w-xs truncate">
                            {p.description}
                          </td>

                          <td className="py-4 px-6 text-[#535C56]">
                            {new Date(p.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>

                          <td className="py-4 px-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {p.status}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            <div>
                              <span className="font-bold text-[#19382C]">₹{p.amount}</span>
                              <p className="text-[10px] text-[#7D9D8B]">Net: ₹{p.netAmount}</p>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right">
                            {p.invoiceUrl || p._id ? (
                              <button
                                type="button"
                                disabled={downloadingId === p._id}
                                onClick={async () => {
                                  setDownloadingId(p._id);
                                  await downloadInvoice(p._id, p.invoiceNumber);
                                  setDownloadingId(null);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EAE5DE] bg-[#FAF8F5] text-xs font-semibold text-[#19382C] hover:bg-[#E8EFEA] transition-colors disabled:opacity-50 cursor-pointer"
                                title="Download GST Tax Invoice PDF"
                              >
                                <Download className={`w-3.5 h-3.5 ${downloadingId === p._id ? 'animate-bounce' : ''}`} />
                                <span>{downloadingId === p._id ? 'Downloading...' : 'PDF'}</span>
                              </button>
                            ) : (
                              <span className="text-gray-400 text-[10px]">Processing</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PACKAGES */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#19382C]">
                  Multi-Session Therapy Packages
                </h2>
                <p className="text-xs text-[#535C56]">
                  Offer bundles (3, 6, 12 sessions) with upfront savings for committed treatment plans.
                </p>
              </div>

              <button
                onClick={() => setPkgModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Session Package</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="bg-white rounded-3xl border border-[#EAE5DE] p-6 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] text-[#19382C] flex items-center justify-center">
                      <PackageIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#19382C]">{pkg.title}</h3>
                    <p className="text-xs text-[#535C56] leading-relaxed">
                      {pkg.description || 'Structured treatment package.'}
                    </p>

                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] space-y-1 text-xs text-[#535C56]">
                      <div className="flex justify-between">
                        <span>Sessions Included:</span>
                        <span className="font-bold text-[#19382C]">{pkg.sessionCount} Sessions</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Validity Period:</span>
                        <span className="font-bold text-[#19382C]">{pkg.validityDays} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Per-Session Rate:</span>
                        <span className="font-bold text-[#19382C]">
                          ₹{Math.round(pkg.price / pkg.sessionCount)} / session
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EAE5DE] flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-[#7D9D8B] uppercase font-semibold">Package Total</span>
                      <div className="text-xl font-bold text-[#19382C]">₹{pkg.price}</div>
                    </div>
                    <span className="text-xs font-semibold text-[#7D9D8B]">Active on Profile</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Package Modal */}
        {pkgModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DE] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DE]">
                <h3 className="text-base font-bold text-[#19382C]">New Session Package</h3>
                <button
                  onClick={() => setPkgModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePackage} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#19382C] mb-1">Package Title *</label>
                  <input
                    type="text"
                    required
                    value={pkgData.title}
                    onChange={(e) => setPkgData({ ...pkgData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#19382C] mb-1">Session Count *</label>
                    <select
                      value={pkgData.sessionCount}
                      onChange={(e) => setPkgData({ ...pkgData, sessionCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                    >
                      <option value="3">3 Sessions</option>
                      <option value="6">6 Sessions</option>
                      <option value="12">12 Sessions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#19382C] mb-1">Total Fee (INR) *</label>
                    <input
                      type="number"
                      required
                      value={pkgData.price}
                      onChange={(e) => setPkgData({ ...pkgData, price: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#19382C] mb-1">Validity (Days) *</label>
                  <input
                    type="number"
                    value={pkgData.validityDays}
                    onChange={(e) => setPkgData({ ...pkgData, validityDays: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#19382C] mb-1">Description</label>
                  <textarea
                    rows="2"
                    value={pkgData.description}
                    onChange={(e) => setPkgData({ ...pkgData, description: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPkgModalOpen(false)}
                    className="px-4 py-2 text-xs text-[#535C56]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingPkg}
                    className="px-5 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E]"
                  >
                    {creatingPkg ? 'Saving...' : 'Publish Package'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal: Record Offline Payment */}
        {manualModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#EAE5DE] shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DE]">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#19382C]" />
                  <h3 className="font-serif font-bold text-lg text-[#19382C]">
                    Record Offline Payment
                  </h3>
                </div>
                <button
                  onClick={() => setManualModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordManualPayment} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#19382C] mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kunal Joshi"
                    value={manualData.clientName}
                    onChange={(e) => setManualData({ ...manualData, clientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#19382C] mb-1">Client Email Address</label>
                  <input
                    type="email"
                    placeholder="kunal.j@example.com"
                    value={manualData.clientEmail}
                    onChange={(e) => setManualData({ ...manualData, clientEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#19382C] mb-1">Amount (₹ INR) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={manualData.amount}
                      onChange={(e) => setManualData({ ...manualData, amount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#19382C] mb-1">Payment Method</label>
                    <select
                      value={manualData.paymentMethod}
                      onChange={(e) => setManualData({ ...manualData, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                    >
                      <option value="cash">Cash in Clinic</option>
                      <option value="upi">Direct UPI Transfer</option>
                      <option value="bank_transfer">Direct NEFT / IMPS</option>
                      <option value="other">Other / Cheque</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#19382C] mb-1">Session / Service Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Individual Psychotherapy Session #3"
                    value={manualData.description}
                    onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#E8EFEA] border border-[#D5DDD8] text-[11px] text-[#535C56]">
                  A GST-compliant tax receipt (TL-INV-XXXXXX) with 18% SAC 999312 calculation will be automatically generated and made available for download.
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setManualModalOpen(false)}
                    className="px-4 py-2 text-xs text-[#535C56]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recordingManual}
                    className="px-5 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E]"
                  >
                    {recordingManual ? 'Recording...' : 'Record Payment & Generate Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
