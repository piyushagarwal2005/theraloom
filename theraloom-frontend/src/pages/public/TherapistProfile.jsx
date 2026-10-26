import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Globe,
  Award,
  ShieldCheck,
  CheckCircle,
  Share2,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
  BadgeCheck,
  HeartHandshake,
  Sparkles,
  BookOpen,
  HelpCircle,
  CreditCard,
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import BookingModal from '../../components/scheduling/BookingModal';
import api from '../../api/axiosInstance';

export default function TherapistProfile() {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [selectedService, setSelectedService] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const [profRes, pkgRes] = await Promise.all([
          api.get(`/therapists/public/${slug}`),
          api.get(`/payments/packages/${slug}`).catch(() => ({ data: {} })),
        ]);

        if (profRes.data?.success) {
          const tData = profRes.data.therapist;
          const claritySession = {
            _id: 'default_clarity_299',
            title: 'Introductory Clarity Session (Pattern Break)',
            description: '20-min focused diagnostic fit check. Unpack your core friction point and evaluate clinical alignment.',
            durationMinutes: 20,
            price: 299,
          };
          const hasClarity = (tData.services || []).some(s => s.price === 299 || s.title?.toLowerCase().includes('clarity'));
          const formattedServices = hasClarity ? tData.services : [claritySession, ...(tData.services || [])];
          tData.services = formattedServices;
          setTherapist(tData);
          setSelectedService(formattedServices[0]);
        }

        if (pkgRes.data?.success) {
          setPackages(pkgRes.data.packages || []);
        }
      } catch (err) {
        setError('Therapist profile could not be found or has not been published yet.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookService = (svc) => {
    setSelectedService(svc);
    setBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#19382C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#535C56]">Loading therapist practice profile...</p>
        </div>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#EAE5DE] text-center space-y-4 shadow-sanctuary">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-serif font-bold text-[#19382C]">Profile Not Found</h2>
          <p className="text-xs text-[#535C56] leading-relaxed">
            {error || "The profile link you followed does not correspond to an active practitioner."}
          </p>
          <div className="pt-2">
            <Link
              to="/#directory"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-colors"
            >
              Browse Therapist Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* TOP PROFILE HERO CARD (Alma / Two Chairs Concierge) */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-10 shadow-sanctuary relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left: Avatar & Bio Headline */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative shrink-0">
                <Avatar
                  src={therapist.profileImage}
                  name={therapist.name}
                  size="2xl"
                  className="border-4 border-[#FAF8F5] shadow-md shrink-0"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
                    {therapist.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#E8EFEA] text-[#19382C] px-3 py-1 rounded-full border border-[#D5DDD8]">
                    <BadgeCheck className="w-4 h-4 text-[#244A3C]" />
                    <span>RCI Accredited Clinician</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#FAF8F5] text-[#535C56] px-2.5 py-0.5 rounded-full border border-[#EAE5DE]">
                    Caseload Capped (Max 20/wk)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    No Spiritual Bypassing
                  </span>
                </div>

                <p className="text-sm font-bold text-[#7D9D8B]">{therapist.title}</p>
                <p className="text-xs text-[#535C56] font-medium">{therapist.qualifications}</p>

                {/* Badges Bar */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#535C56] pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7D9D8B]" />
                    <span>{therapist.location || 'Online across India'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#7D9D8B]" />
                    <span>{therapist.languages?.join(', ') || 'English, Hindi'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#7D9D8B]" />
                    <span>{therapist.experienceYears || 5}+ Years Clinical Practice</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-800 font-semibold bg-[#E8EFEA] px-2 py-0.5 rounded-md">
                    <Sparkles className="w-3.5 h-3.5 text-[#5F7F6E]" />
                    <span>Intro Clarity Session from ₹299</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => setBookingModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Telehealth Session</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs font-semibold text-[#535C56] hover:text-[#19382C] hover:bg-[#F4EFEB] transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Share Practice Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MAIN BODY: 2-COLUMN SANCTUARY LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Therapeutic Approach & Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            {/* About & Clinical Philosophy */}
            <div className="bg-white rounded-3xl border border-[#EAE5DE] p-7 sm:p-8 space-y-4 shadow-sanctuary">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
                Therapeutic Philosophy
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#19382C]">
                Compassionate, Evidence-Grounded Care
              </h2>
              <div className="text-xs sm:text-sm text-[#535C56] leading-relaxed whitespace-pre-line space-y-2">
                {therapist.bio ||
                  'Compassionate and evidence-based psychotherapy tailored to individual life transitions and mental health challenges.'}
              </div>
            </div>

            {/* Specializations & Modalities */}
            <div className="bg-white rounded-3xl border border-[#EAE5DE] p-7 sm:p-8 space-y-4 shadow-sanctuary">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
                Clinical Focus
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#19382C]">
                Areas of Expertise & Presenting Concerns
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {(therapist.specializations || ['Anxiety', 'Depression', 'Stress Management']).map((item) => (
                  <span
                    key={item}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs font-semibold text-[#19382C] shadow-2xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* What to Expect in Your First Session */}
            <div className="bg-white rounded-3xl border border-[#EAE5DE] p-7 sm:p-8 space-y-4 shadow-sanctuary">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
                Session Guidance
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#19382C]">
                What to Expect in Session One
              </h2>
              <div className="space-y-3 text-xs text-[#535C56] leading-relaxed">
                <p>
                  Your initial session is a collaborative conversation. We will gently explore what brings you into care, your current emotional landscape, and co-create meaningful goals at your own pace.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE] space-y-1">
                    <span className="font-bold text-[#19382C]">No Pressure to Share Everything</span>
                    <p className="text-[11px] text-[#535C56]">You set the pace. You are in full control of what is discussed.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE] space-y-1">
                    <span className="font-bold text-[#19382C]">Strict Clinical Confidentiality</span>
                    <p className="text-[11px] text-[#535C56]">Protected under professional ethics and the Indian Mental Healthcare Act 2017.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal & MHCA 2017 Compliance Card */}
            <div className="bg-[#E8EFEA] rounded-3xl border border-[#D5DDD8] p-6 space-y-3 text-xs text-[#19382C]">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-[#244A3C]" />
                <span>Ethical & Clinical Privacy Guarantee</span>
              </div>
              <p className="text-[#535C56] leading-relaxed text-[11px]">
                In full accordance with the Mental Healthcare Act 2017, all communications and clinical documentation remain confidential. Private session notes are never accessible to external parties, employers, or non-authorized endpoints.
              </p>
              <div className="pt-1 flex flex-wrap gap-4 text-[11px] font-semibold text-[#19382C]">
                <Link to="/terms" className="underline hover:text-[#244E3E]">Terms of Practice</Link>
                <Link to="/privacy" className="underline hover:text-[#244E3E]">Privacy Policy</Link>
                <Link to="/security" className="underline hover:text-[#244E3E]">Security Architecture</Link>
              </div>
            </div>

            {/* Emergency Crisis Notice */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block text-amber-950">In acute distress or crisis?</span>
                <p className="text-[11px] leading-relaxed">
                  Scheduled therapy is not for emergency crisis response. Call 24x7 Tele-MANAS at{' '}
                  <a href="tel:14416" className="font-bold underline">14416</a> or view the{' '}
                  <Link to="/crisis" className="font-bold underline text-amber-950">Emergency Helpline Directory</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Sticky Consultation Booking Concierge */}
          <div className="lg:col-span-5 sticky top-28 space-y-5">
            <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-7 shadow-sanctuary space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DE]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B]">
                    Standard Consultation
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-[#19382C]">
                      ₹{therapist.consultationFee || 1800}
                    </span>
                    <span className="text-xs text-[#535C56]">/ 50-min session</span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-[#E8EFEA] px-2.5 py-1 rounded-full border border-[#D5DDD8]">
                  Available this week
                </span>
              </div>

              {/* Service Formats */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#19382C] uppercase tracking-wider text-[11px]">
                  Select Consultation Format
                </label>
                {(therapist.services || [
                  {
                    title: 'Individual Psychotherapy',
                    description: 'One-on-one telehealth session for anxiety, depression, or emotional regulation.',
                    durationMinutes: 50,
                    price: therapist.consultationFee || 1800,
                  },
                ]).map((svc) => {
                  const isSelected = selectedService?.title === svc.title;
                  return (
                    <div
                      key={svc._id || svc.title}
                      onClick={() => setSelectedService(svc)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#19382C] bg-[#E8EFEA]/70 shadow-xs ring-1 ring-[#19382C]'
                          : 'border-[#EAE5DE] bg-[#FAF8F5] hover:border-[#7D9D8B]'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-[#19382C]">{svc.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-[#7D9D8B] mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {svc.durationMinutes}m
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Video className="w-3 h-3" />
                            Telehealth Video
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#19382C]">₹{svc.price}</span>
                    </div>
                  );
                })}
              </div>

              {/* Multi-Session Care Packages */}
              {packages.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-[#EAE5DE]">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#19382C] uppercase tracking-wider text-[11px]">
                      Multi-Session Care Packages
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Save up to 20%
                    </span>
                  </div>
                  {packages.map((pkg) => {
                    const isSelected = selectedService?.title === pkg.title;
                    return (
                      <div
                        key={pkg._id || pkg.title}
                        onClick={() =>
                          setSelectedService({
                            title: pkg.title,
                            description: pkg.description,
                            durationMinutes: 50,
                            price: pkg.price,
                            isPackage: true,
                          })
                        }
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#19382C] bg-[#E8EFEA]/70 shadow-xs ring-1 ring-[#19382C]'
                            : 'border-[#EAE5DE] bg-[#FAF8F5] hover:border-[#7D9D8B]'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-[#19382C]">{pkg.title}</h4>
                          <p className="text-[10px] text-[#7D9D8B] mt-0.5">
                            {pkg.sessionCount} sessions • Valid for {pkg.validityDays} days
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#19382C]">₹{pkg.price}</span>
                          <span className="block text-[9px] text-emerald-700 font-semibold">{pkg.discountPercentage}% off</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => setBookingModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>Select Date & Time Slot</span>
              </button>

              <div className="pt-2 text-center text-[11px] text-[#7D9D8B] space-y-1">
                <p>Instant confirmation • Free rescheduling up to 24h prior</p>
                <p>Tax invoice with GST receipt generated automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {therapist && (
        <BookingModal
          therapist={therapist}
          selectedService={selectedService}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
        />
      )}
    </div>
  );
}
