import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Server,
  KeyRound,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Video,
  Database,
  Terminal,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function SecurityCompliance() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#7D9D8B]">
          <Link to="/" className="hover:text-[#19382C] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#19382C] font-semibold">Security & Compliance</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#EAE5DE] pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFEA] text-[#19382C] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise-Grade Mental Health Infrastructure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#19382C] tracking-tight">
            Security & Regulatory Compliance Architecture
          </h1>
          <p className="text-xs sm:text-sm text-[#535C56] leading-relaxed max-w-2xl">
            Theraloom is architected specifically to meet the stringent confidentiality and security demands of clinical psychology and psychotherapy in India.
          </p>
        </div>

        {/* 4 Pillars of Theraloom Security */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#EAE5DE] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-2xl bg-[#19382C] text-white flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#A9BDA9]" />
            </div>
            <h3 className="text-sm font-serif font-bold text-[#19382C]">
              End-to-End Cryptographic Security
            </h3>
            <p className="text-xs text-[#535C56] leading-relaxed">
              Every request is protected with TLS 1.3 in transit. At rest, data is safeguarded with AES-256 database encryption. Passwords utilize salted bcrypt hashing with work factor 10.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#EAE5DE] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-2xl bg-[#19382C] text-white flex items-center justify-center">
              <Database className="w-4 h-4 text-[#A9BDA9]" />
            </div>
            <h3 className="text-sm font-serif font-bold text-[#19382C]">
              Strict Clinical Data Isolation
            </h3>
            <p className="text-xs text-[#535C56] leading-relaxed">
              Practitioner SOAP/DAP notes are strictly firewalled by backend role-based access control (RBAC). A client can never access notes unless explicitly flagged as shared clinical homework.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#EAE5DE] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-2xl bg-[#19382C] text-white flex items-center justify-center">
              <Video className="w-4 h-4 text-[#A9BDA9]" />
            </div>
            <h3 className="text-sm font-serif font-bold text-[#19382C]">
              Ephemeral WebRTC Telehealth
            </h3>
            <p className="text-xs text-[#535C56] leading-relaxed">
              Therapy sessions occur inside isolated WebRTC video rooms generated with unique cryptographic tokens. Rooms dissolve upon session termination. No audio or video is ever recorded.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#EAE5DE] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-2xl bg-[#19382C] text-white flex items-center justify-center">
              <FileCheck2 className="w-4 h-4 text-[#A9BDA9]" />
            </div>
            <h3 className="text-sm font-serif font-bold text-[#19382C]">
              Indian Regulatory Alignment
            </h3>
            <p className="text-xs text-[#535C56] leading-relaxed">
              Built in strict adherence with the Indian Mental Healthcare Act (MHCA 2017), the Digital Personal Data Protection Act (DPDP Act 2023), and national DISHA guidelines.
            </p>
          </div>
        </div>

        {/* Regulatory Matrix Table */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-10 shadow-sanctuary space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-[#19382C]">
              Regulatory & Standards Compliance Matrix
            </h2>
            <p className="text-xs text-[#7D9D8B]">
              How Theraloom meets or exceeds Indian and international healthcare security benchmarks:
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EAE5DE] text-[#19382C] font-semibold">
                  <th className="py-3 px-4">Standard / Regulation</th>
                  <th className="py-3 px-4">Requirement</th>
                  <th className="py-3 px-4">Theraloom Implementation</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DE]/60 text-[#535C56]">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-[#19382C]">
                    Mental Healthcare Act (MHCA 2017)
                  </td>
                  <td className="py-3.5 px-4">Confidentiality of clinical notes & digital informed consent</td>
                  <td className="py-3.5 px-4">Timestamped digital consent capture + database layer note partitioning</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Compliant
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-semibold text-[#19382C]">
                    DPDP Act 2023 (India)
                  </td>
                  <td className="py-3.5 px-4">Data minimization, purpose limitation & grievance redressal</td>
                  <td className="py-3.5 px-4">Designated Grievance Officer, no ad trackers, complete export & erasure rights</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Compliant
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-semibold text-[#19382C]">
                    DISHA Guidelines (India)
                  </td>
                  <td className="py-3.5 px-4">Digital information security for electronic health records</td>
                  <td className="py-3.5 px-4">AES-256 at rest, strict tenant separation, audit logging for sessions</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Aligned
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-semibold text-[#19382C]">
                    HIPAA Security Rule
                  </td>
                  <td className="py-3.5 px-4">Administrative, physical, and technical safeguards for PHI</td>
                  <td className="py-3.5 px-4">JWT token authentication, automatic session timeout, zero recording video</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Equivalent
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-semibold text-[#19382C]">
                    RBI Payment Aggregator
                  </td>
                  <td className="py-3.5 px-4">Secure card-on-file tokenization & HMAC signature checks</td>
                  <td className="py-3.5 px-4">Razorpay checkout integration with cryptographic SHA256 webhook validation</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Architecture Deep Dive */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-10 shadow-sanctuary space-y-6 text-xs sm:text-sm text-[#535C56] leading-relaxed">
          <h2 className="text-lg font-serif font-bold text-[#19382C]">
            Technical Safeguards & Incident Management
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-[#19382C] text-xs uppercase tracking-wider mb-1">
                Atomic Double-Booking Prevention
              </h3>
              <p>
                To prevent clinical scheduling conflicts, Theraloom executes atomic database lock verification before finalizing any appointment slot. If two clients attempt to book the same therapist slot simultaneously, the second transaction is safely rejected with a <code>409 Conflict</code> status and redirected to alternative availability or the priority waitlist.
              </p>
            </div>

            <div className="border-t border-[#EAE5DE] pt-4">
              <h3 className="font-bold text-[#19382C] text-xs uppercase tracking-wider mb-1">
                Automated GST Tax Invoicing (PDFKit)
              </h3>
              <p>
                Therapists can operate fully GST-compliant private practices. For every captured payment, Theraloom dynamically compiles an itemized, auditable PDF invoice displaying practitioner SAC codes, 18% GST calculation, client name, and session timestamp.
              </p>
            </div>

            <div className="border-t border-[#EAE5DE] pt-4">
              <h3 className="font-bold text-[#19382C] text-xs uppercase tracking-wider mb-1">
                Disaster Recovery & Redundancy
              </h3>
              <p>
                Production databases are backed up automatically on daily schedules with point-in-time recovery capabilities. Data replicas are maintained across multiple availability zones within the Indian cloud perimeter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
