import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  FileCheck,
  UserCheck,
  Mail,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#7D9D8B]">
          <Link to="/" className="hover:text-[#19382C] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#19382C] font-semibold">Privacy Policy</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#EAE5DE] pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFEA] text-[#19382C] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Digital Personal Data Protection Act (DPDP Act 2023, India) Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#19382C] tracking-tight">
            Privacy Policy & Clinical Data Governance
          </h1>
          <p className="text-xs sm:text-sm text-[#535C56] leading-relaxed max-w-2xl">
            Effective Date: October 2026. This Privacy Policy details how Theraloom ("we", "our", or "platform") protects personal data, clinical records, and telehealth communications for therapists and clients across India.
          </p>
        </div>

        {/* Privacy Guarantees Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#EAE5DE] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8EFEA] text-[#19382C] flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#19382C]">Private Notes Stay Private</h4>
            <p className="text-[11px] text-[#535C56] leading-relaxed">
              Your therapist's internal clinical process notes (SOAP/DAP) are partitioned at the database layer and are never shared or accessible to third parties.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EAE5DE] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8EFEA] text-[#19382C] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#19382C]">No Session Recordings</h4>
            <p className="text-[11px] text-[#535C56] leading-relaxed">
              Virtual telehealth video calls are peer-to-peer WebRTC encrypted streams. Theraloom never records or stores any audio or video of your therapy sessions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EAE5DE] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8EFEA] text-[#19382C] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#19382C]">Zero Advertising Sales</h4>
            <p className="text-[11px] text-[#535C56] leading-relaxed">
              We never sell, monetize, or broker medical, clinical, or client contact data to advertisers, insurance brokers, or pharmaceutical companies.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-10 shadow-sanctuary space-y-8 text-xs sm:text-sm text-[#535C56] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#19382C]">
              <div className="w-7 h-7 rounded-xl bg-[#E8EFEA] flex items-center justify-center font-bold text-xs text-[#19382C]">1</div>
              <h2 className="text-base sm:text-lg font-serif font-bold">
                Data We Collect & Legal Basis for Processing
              </h2>
            </div>
            <p>
              Under the Indian Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, we collect only the minimum information necessary to deliver clinical scheduling and telehealth practice management:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#535C56]">
              <li><strong>Practitioner Data:</strong> Name, professional qualifications, university degrees, RCI registration details (where applicable), consultation fees, bio, and clinic availability.</li>
              <li><strong>Client Booking Data:</strong> Full name, verified email address, phone number, and presenting mental health concerns provided voluntarily during intake.</li>
              <li><strong>Digital Consent Audit Trail:</strong> Cryptographic timestamps, IP address, and browser metadata recorded at the moment you review and accept the Telehealth & Privacy agreement.</li>
              <li><strong>Payment Records:</strong> Transaction IDs, GST breakdown, and invoice amounts via RBI-compliant payment gateway (Razorpay). We <strong>never store</strong> raw debit/credit card numbers or CVVs.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-[#EAE5DE] pt-6">
            <div className="flex items-center gap-2.5 text-[#19382C]">
              <div className="w-7 h-7 rounded-xl bg-[#E8EFEA] flex items-center justify-center font-bold text-xs text-[#19382C]">2</div>
              <h2 className="text-base sm:text-lg font-serif font-bold">
                Clinical Note Isolation Architecture (SOAP & DAP)
              </h2>
            </div>
            <p>
              Theraloom enforces architectural isolation between therapist-only documentation and client-facing materials:
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#19382C] font-semibold">
                <Lock className="w-4 h-4 text-[#7D9D8B]" />
                <span>Strict Database Gating:</span>
              </div>
              <p>
                Clinical notes marked with <code>noteType: 'private'</code> are filtered out before reaching any client-facing API endpoint. The Client Portal API route (<code>/api/v1/notes/shared/:clientId</code>) strictly returns records where the clinician has deliberately selected <code>noteType: 'shared'</code> (e.g., agreed homework exercises, behavioral worksheets).
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-[#EAE5DE] pt-6">
            <div className="flex items-center gap-2.5 text-[#19382C]">
              <div className="w-7 h-7 rounded-xl bg-[#E8EFEA] flex items-center justify-center font-bold text-xs text-[#19382C]">3</div>
              <h2 className="text-base sm:text-lg font-serif font-bold">
                Data Storage, Encryption & Indian Data Sovereignty
              </h2>
            </div>
            <p>
              In alignment with Indian healthcare guidelines and cloud security standards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#535C56]">
              <li><strong>Encryption in Transit:</strong> All HTTP and WebSocket communications are encrypted using Transport Layer Security (TLS 1.3) with modern cipher suites.</li>
              <li><strong>Encryption at Rest:</strong> Database volumes and document attachments are protected using industry-standard AES-256 encryption.</li>
              <li><strong>Local Data Processing:</strong> Primary databases and processing pipelines reside within secure Indian cloud regions (AWS Mumbai / Equinix India).</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-[#EAE5DE] pt-6">
            <div className="flex items-center gap-2.5 text-[#19382C]">
              <div className="w-7 h-7 rounded-xl bg-[#E8EFEA] flex items-center justify-center font-bold text-xs text-[#19382C]">4</div>
              <h2 className="text-base sm:text-lg font-serif font-bold">
                Your Rights as a Data Principal (Client Rights)
              </h2>
            </div>
            <p>
              Under the DPDP Act 2023, you enjoy statutory rights over your personal information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#535C56]">
              <li><strong>Right to Access:</strong> You can view all confirmed appointments, downloadable GST invoices, and shared treatment plans anytime in your Client Portal.</li>
              <li><strong>Right to Correction:</strong> You may update your demographic details, occupation, and intake goals directly from your portal dashboard.</li>
              <li><strong>Right to Erasure:</strong> You can request deletion of your client account upon termination of therapy, subject to statutory medical record retention obligations (minimum 3 years under Indian Medical Council ethics).</li>
              <li><strong>Right to Withdraw Consent:</strong> You may withdraw your digital consent for future telehealth communication at any time by notifying your therapist.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-[#EAE5DE] pt-6">
            <div className="flex items-center gap-2.5 text-[#19382C]">
              <div className="w-7 h-7 rounded-xl bg-[#E8EFEA] flex items-center justify-center font-bold text-xs text-[#19382C]">5</div>
              <h2 className="text-base sm:text-lg font-serif font-bold">
                Grievance Redressal Officer (Indian DPDP Act Requirement)
              </h2>
            </div>
            <p>
              In compliance with Section 10 of the DPDP Act, 2023 and the Information Technology Rules, 2011, Theraloom has appointed a designated Grievance Officer to address any privacy or data security inquiries:
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs space-y-1.5">
              <p><strong className="text-[#19382C]">Grievance Officer:</strong> Data Protection & Clinical Ethics Desk</p>
              <p><strong className="text-[#19382C]">Organization:</strong> Theraloom Technologies (theraloom.in)</p>
              <p><strong className="text-[#19382C]">Email:</strong> <a href="mailto:grievance@theraloom.in" className="text-[#19382C] underline">grievance@theraloom.in</a></p>
              <p><strong className="text-[#19382C]">Response Window:</strong> We acknowledge complaints within 48 hours and resolve within 30 days as mandated by Indian law.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
