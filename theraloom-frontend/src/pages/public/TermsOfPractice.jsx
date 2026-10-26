import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CreditCard,
  Lock,
  HeartHandshake,
  ExternalLink,
  ChevronRight,
  PhoneCall,
} from 'lucide-react';

export default function TermsOfPractice() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb & Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#7D9D8B]">
            <Link to="/" className="hover:text-[#19382C] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#19382C] font-semibold">Terms of Practice</span>
          </div>

          <div className="border-b border-[#EAE5DE] pb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFEA] text-[#19382C] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Compliant with Indian Mental Healthcare Act (MHCA 2017)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#19382C] tracking-tight">
              Clinical Terms of Practice & Care Agreement
            </h1>
            <p className="text-xs sm:text-sm text-[#535C56] leading-relaxed max-w-2xl">
              Last updated: October 2026. This agreement outlines the professional boundaries, clinical guidelines, cancellation policies, and telehealth protocols governing services facilitated through the Theraloom platform.
            </p>
          </div>
        </div>

        {/* Emergency Alert Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5 text-xs text-amber-900 leading-relaxed shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block text-amber-950">
              Emergency & Acute Crisis Disclaimer
            </strong>
            <p>
              Theraloom and its registered therapists provide scheduled mental health counselling and psychotherapy. We do <strong>NOT</strong> provide emergency suicide prevention, psychiatric triage, or 24-hour crisis management services. If you or someone you know is in immediate danger or experiencing acute suicidal ideation, please dial <strong className="underline font-bold">112</strong> (National Emergency) or call the Govt. of India 24x7 Tele-MANAS helpline at <strong className="underline font-bold">14416</strong> immediately.
            </p>
            <div className="pt-1">
              <Link to="/crisis" className="font-semibold text-amber-900 hover:text-amber-950 underline inline-flex items-center gap-1">
                <span>View Full List of 24x7 India Crisis Helplines</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Core Terms Content */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-10 shadow-sanctuary space-y-8 text-xs sm:text-sm text-[#535C56] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#19382C]">
              <div className="w-7 h-7 rounded-xl bg-[#E8EFEA] flex items-center justify-center font-bold text-xs text-[#19382C]">1</div>
              <h2 className="text-base sm:text-lg font-serif font-bold">
                Therapeutic Relationship & Scope of Services
              </h2>
            </div>
            <p>
              Theraloom operates as an integrated practice technology suite for independent, qualified clinical psychologists, counselling psychologists, and licensed psychotherapists in India. The contract for psychological care is formed directly between the practitioner and the client.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#535C56]">
              <li>All practitioners on Theraloom hold accredited university degrees (MA/M.Sc, M.Phil, or Psy.D) in clinical or counselling psychology.</li>
              <li>Psychological counseling is a collaborative process designed to facilitate personal insight, emotional regulation, and psychological resilience. Results cannot be guaranteed and vary based on personal commitment and presentation.</li>
              <li>Therapists do not prescribe scheduled psychotropic medications unless they are registered medical practitioners (MD/DNB Psychiatry).</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-[#EAE5DE] pt-6">
            <div className="flex items-center gap-2.5 text-[#19382C]">
              <div className="w-7 h-7 rounded-xl bg-[#E8EFEA] flex items-center justify-center font-bold text-xs text-[#19382C]">2</div>
              <h2 className="text-base sm:text-lg font-serif font-bold">
                Informed Consent & Indian Mental Healthcare Act (MHCA 2017)
              </h2>
            </div>
            <p>
              In accordance with Section 21 and Section 23 of the Mental Healthcare Act, 2017 (Act No. 10 of 2017), every individual has the right to mental health care with dignity, privacy, and full autonomy.
            </p>
            <p>
              By scheduling a consultation on Theraloom, you provide informed digital consent to psychological care. You retain the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#535C56]">
              <li>Receive transparent information regarding your therapist's training, therapeutic modality, and session fee.</li>
              <li>Refuse or withdraw from treatment at any juncture without penalty.</li>
              <li>Have your clinical records treated with strict professional confidentiality as guaranteed under Indian law.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-[#EAE5DE] pt-6">
            <div className="flex items-center gap-2.5 text-[#19382C]">
              <div className="w-7 h-7 rounded-xl bg-[#E8EFEA] flex items-center justify-center font-bold text-xs text-[#19382C]">3</div>
              <h2 className="text-base sm:text-lg font-serif font-bold">
                Telehealth Protocols & Digital Privacy
              </h2>
            </div>
            <p>
              Virtual therapy consultations are delivered via secure, browser-based peer-to-peer WebRTC video rooms:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#535C56]">
              <li><strong>Zero Recording Policy:</strong> Virtual sessions are <strong>never recorded</strong> in audio or video form by Theraloom. Clients and therapists agree not to make any unauthorized recordings of sessions.</li>
              <li><strong>Quiet, Private Setting:</strong> Clients are required to join their sessions from a secure, private room where their conversation cannot be overheard, free from distractions and other occupants.</li>
              <li><strong>Bandwidth & Technical Failures:</strong> In the event of network disruption during a session, the therapist will attempt to re-connect via video or contact the client at their registered phone number.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-[#EAE5DE] pt-6">
            <div className="flex items-center gap-2.5 text-[#19382C]">
              <div className="w-7 h-7 rounded-xl bg-[#E8EFEA] flex items-center justify-center font-bold text-xs text-[#19382C]">4</div>
              <h2 className="text-base sm:text-lg font-serif font-bold">
                Cancellation, Rescheduling & No-Show Policy
              </h2>
            </div>
            <p>
              Therapists reserve dedicated 50-minute clinical blocks exclusively for each client. To respect therapist availability and other clients awaiting care:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE]">
                <strong className="block text-[#19382C] font-semibold mb-1">More than 24 Hours Notice:</strong>
                <span>Free rescheduling or full session fee credit applied to your client account.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE]">
                <strong className="block text-[#19382C] font-semibold mb-1">Under 24 Hours or No-Show:</strong>
                <span>The session is billed in full as the clinical time cannot be offered to other clients on the waitlist.</span>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-[#EAE5DE] pt-6">
            <div className="flex items-center gap-2.5 text-[#19382C]">
              <div className="w-7 h-7 rounded-xl bg-[#E8EFEA] flex items-center justify-center font-bold text-xs text-[#19382C]">5</div>
              <h2 className="text-base sm:text-lg font-serif font-bold">
                Fee Structure, Invoicing & GST Compliance
              </h2>
            </div>
            <p>
              Session fees are denominated in Indian Rupees (INR) and are payable in advance to confirm your appointment reservation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#535C56]">
              <li>Payments are processed securely via RBI-licensed payment aggregators (Razorpay / UPI / NetBanking / Cards).</li>
              <li>An itemized GST Tax Invoice with unique sequential invoice numbers (e.g., <code>TL-INV-XXXXXX</code>) is automatically generated for every session and downloadable directly from your Client Portal.</li>
              <li>Package bundles (e.g., 4-session or 6-session packs) have a stated validity period (90 to 180 days) from the date of purchase.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-[#EAE5DE] pt-6">
            <div className="flex items-center gap-2.5 text-[#19382C]">
              <div className="w-7 h-7 rounded-xl bg-[#E8EFEA] flex items-center justify-center font-bold text-xs text-[#19382C]">6</div>
              <h2 className="text-base sm:text-lg font-serif font-bold">
                Exceptions to Clinical Confidentiality
              </h2>
            </div>
            <p>
              Professional confidentiality is the bedrock of psychotherapy. Under Indian legal statutes and professional psychological ethics, a therapist is legally and ethically bound to break confidentiality only in the following exceptional circumstances:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[#535C56]">
              <li>Clear and imminent threat of severe physical harm or suicide to the client themselves.</li>
              <li>Clear and imminent threat of physical violence or harm to an identified third party.</li>
              <li>Suspected physical, sexual, or emotional abuse of a minor or vulnerable adult (Mandated reporting under POCSO Act, 2012).</li>
              <li>Direct, formal judicial order issued by an authorized Indian court of law.</li>
            </ol>
            <p className="text-xs text-[#7D9D8B] italic">
              In any such circumstance, only the minimum information necessary to ensure safety will be disclosed to appropriate family contacts or authorities.
            </p>
          </section>

          {/* Contact and Questions */}
          <div className="border-t border-[#EAE5DE] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-[#19382C]">Questions regarding clinical practice terms?</h4>
              <p className="text-[11px] text-[#7D9D8B]">Contact our clinical ethics desk at support@theraloom.in</p>
            </div>
            <Link
              to="/crisis"
              className="px-5 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-colors"
            >
              Emergency Helpline Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
