import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Lock,
  FileText,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Check,
  Star,
  Users,
  Video,
  Award,
  Globe,
  Clock,
  Heart,
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import BookingModal from '../../components/scheduling/BookingModal';
import api from '../../api/axiosInstance';

export default function Home() {
  const [featuredTherapists, setFeaturedTherapists] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [bookingTherapist, setBookingTherapist] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    // Fetch featured therapists from backend
    const fetchDirectory = async () => {
      try {
        const res = await api.get('/therapists/directory');
        if (res.data?.success) {
          setFeaturedTherapists(res.data.therapists || []);
        }
      } catch (err) {
        console.warn('Could not load therapists from database:', err);
      }
    };

    // Fetch subscription tier configs
    const fetchTiers = async () => {
      try {
        const res = await api.get('/tiers/public');
        if (res.data?.success) {
          setTiers(res.data.tiers || []);
        }
      } catch (err) {
        console.warn('Could not load tiers from database:', err);
      }
    };

    fetchDirectory();
    fetchTiers();
  }, []);

  const openBookingFor = (therapist) => {
    setBookingTherapist(therapist);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F2421]">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-[#EAE5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFEA] border border-[#D5DDD8] text-xs font-semibold text-[#19382C]">
                <Sparkles className="w-3.5 h-3.5 text-[#7D9D8B]" />
                <span>Next-Gen Practice Management for India</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#19382C] leading-[1.15]">
                Your practice, <br />
                <span className="italic font-normal text-[#5F7F6E]">
                  thoughtfully connected.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#535C56] max-w-xl leading-relaxed">
                Theraloom empowers psychologists, clinical therapists, and counsellors in India to operate modern private practices end-to-end — from branded client booking and digital consent to SOAP documentation and Razorpay payments.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a
                  href="#directory"
                  className="px-6 py-3.5 rounded-xl bg-[#19382C] text-white text-sm font-semibold hover:bg-[#244E3E] transition-all shadow-sm flex items-center justify-center gap-2 group"
                >
                  <span>Book with a Licensed Therapist</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-xl bg-white border border-[#D5DDD8] text-[#19382C] text-sm font-semibold hover:bg-[#F4EFEB] transition-all text-center"
                >
                  Start Your Private Practice
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#EAE5DE] text-xs text-[#535C56]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#7D9D8B] shrink-0" />
                  <span>MHCA 2017 & HIPAA-Aligned Privacy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#7D9D8B] shrink-0" />
                  <span>Automated GST Invoices & UPI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#7D9D8B] shrink-0" />
                  <span>Encrypted 1-on-1 Video Rooms</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset (Real Therapy Room Environment) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3 sm:aspect-5/4">
                <img
                  src="https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=1200&q=80"
                  alt="Serene modern psychotherapy consultation room with armchairs, calm lighting, and plants"
                  onError={(e) => {
                    e.currentTarget.src = '/images/hero-therapy-room.svg';
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Floating Social Proof Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-[#EAE5DE] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] flex items-center justify-center text-[#19382C]">
                      <Lock className="w-5 h-5 text-[#244A3C]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#19382C]">Zero-Leakage Clinical Privacy</p>
                      <p className="text-[11px] text-[#535C56]">Private notes are strictly isolated at API layer</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#7D9D8B] bg-[#FAF8F5] px-2 py-1 rounded-md border border-[#EAE5DE]">
                    Encrypted
                  </span>
                </div>
              </div>

              {/* Decorative Subtle Accent */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#A9BDA9]/20 rounded-full blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALIZATIONS TICKER */}
      <section className="py-6 bg-[#FAF8F5] border-b border-[#EAE5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-medium text-[#535C56]">
            <span className="font-semibold text-[#19382C] uppercase tracking-wider text-[11px] mr-2">
              Practice Specializations:
            </span>
            {['Anxiety & Panic', 'Depression', 'Trauma & PTSD', 'Cognitive Restructuring (CBT)', 'Relationship & Couples', 'Work Burnout', 'Adolescent Guidance', 'Grief & Bereavement'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white border border-[#EAE5DE] hover:border-[#7D9D8B] transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED THERAPISTS DIRECTORY */}
      <section id="directory" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
            Verified Practitioners
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
            Find the right licensed therapist for you
          </h2>
          <p className="text-sm text-[#535C56] leading-relaxed">
            Browse qualified clinical psychologists, psychotherapists, and mental health counselors across India. Book transparently through their branded portal.
          </p>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredTherapists.map((therapist) => (
            <div
              key={therapist._id || therapist.slug}
              className="bg-white rounded-3xl border border-[#EAE5DE] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar
                    src={therapist.profileImage}
                    name={therapist.name}
                    size="xl"
                    className="border-2 border-white shadow-sm shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-[#19382C] group-hover:text-[#244E3E] transition-colors">
                      {therapist.name}
                    </h3>
                    <p className="text-xs text-[#7D9D8B] font-medium leading-snug">
                      {therapist.title}
                    </p>
                    <p className="text-[11px] text-[#535C56] mt-1">
                      {therapist.qualifications || 'Licensed Mental Health Professional'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#535C56] line-clamp-3 mb-4 leading-relaxed">
                  {therapist.bio || 'Compassionate and evidence-based psychotherapy tailored to individual life transitions and mental health challenges.'}
                </p>

                {/* Specializations Pills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {(therapist.specializations || ['Anxiety', 'Stress', 'CBT']).slice(0, 3).map((spec) => (
                    <span
                      key={spec}
                      className="text-[10px] px-2.5 py-1 rounded-md bg-[#FAF8F5] text-[#535C56] border border-[#EAE5DE]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-[#EAE5DE] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#7D9D8B] uppercase font-semibold">
                      Consultation Fee
                    </span>
                    <p className="text-base font-bold text-[#19382C]">
                      ₹{therapist.consultationFee || 1800}{' '}
                      <span className="text-xs font-normal text-[#535C56]">/ 50m</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/${therapist.slug}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#19382C] hover:bg-[#FAF8F5] border border-[#EAE5DE] transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => openBookingFor(therapist)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#19382C] text-white hover:bg-[#244E3E] transition-all shadow-xs"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE PLATFORM MODULES / ARCHITECTURE SHOWCASE */}
      <section id="features" className="py-20 bg-[#F4EFEB]/50 border-y border-[#EAE5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
              Engineered for Compliance & Ease
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
              One thoughtfully integrated practice operating system
            </h2>
            <p className="text-sm text-[#535C56] leading-relaxed">
              Replace fragmented tools, spreadsheets, and manual billing with a cohesive platform designed for Indian clinical guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Scheduling & Double Booking Prevention */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE5DE] space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#19382C] flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#19382C]">
                Atomic Scheduling & Buffer Times
              </h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Prevents conflicting double-bookings on the server using atomic queries. Supports weekly recurring templates, custom overrides, 30/45/60/90 minute durations, and automatic time-zone conversion for overseas NRI clients.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#7D9D8B] flex items-center gap-1">
                <span>Database-level conflict rejection</span>
              </div>
            </div>

            {/* Card 2: SOAP / DAP Clinical Documentation */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE5DE] space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#19382C] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#19382C]">
                Clinical SOAP & DAP Notes
              </h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                TipTap rich-text documentation with evidence-based SOAP and DAP frameworks. Notes default strictly to private and are safeguarded by dedicated response serializers at the backend API layer.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#7D9D8B] flex items-center gap-1">
                <span>Private vs Shared note separation</span>
              </div>
            </div>

            {/* Card 3: Payments, Packages & GST Invoices */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE5DE] space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#19382C] flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#19382C]">
                Razorpay & GST Invoicing
              </h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Advance session payment via Razorpay UPI, Cards, and Net Banking. Automatic generation of professional PDF tax receipts and multi-session package tracking (3, 6, 12 sessions) with remaining balances.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#7D9D8B] flex items-center gap-1">
                <span>PDFKit automated tax invoice</span>
              </div>
            </div>

            {/* Card 4: Client CRM & Intake Forms */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE5DE] space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#19382C] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#19382C]">
                CRM & Digital Consent Capture
              </h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Centralized client records with presenting concerns, demographic profiles, session chronologies, and timestamped digital consent logs compliant with the Mental Healthcare Act 2017.
              </p>
            </div>

            {/* Card 5: Real-Time Encrypted Chat */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE5DE] space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#19382C] flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#19382C]">
                Socket.IO Messaging & Alerts
              </h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Encrypted real-time practitioner-client messaging rooms with persistent message storage, read receipts, typing indicators, and automated booking notifications.
              </p>
            </div>

            {/* Card 6: Centralized Entitlement Engine */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE5DE] space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#19382C] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#19382C]">
                Configuration-Driven Entitlements
              </h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Single source of truth via <code className="font-mono text-emerald-800">canAccess(id, key)</code>. No hardcoded plan strings. Dynamically gates active client caps, note templates, and analytics depth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUBSCRIPTION TIERS & PRICING */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
            Transparent Pricing
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
            Plans designed to scale with your practice
          </h2>
          <p className="text-sm text-[#535C56] leading-relaxed">
            Begin with our free Starter tier, then unlock advanced clinical templates and deep business analytics as your practice expands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const isPopular = tier.isPopular;
            return (
              <div
                key={tier.tierKey}
                className={`rounded-3xl p-8 border transition-all flex flex-col relative ${
                  isPopular
                    ? 'bg-white border-[#19382C] shadow-xl ring-2 ring-[#19382C]'
                    : 'bg-white border-[#EAE5DE] shadow-xs'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#19382C] text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
                    Most Popular for Independent Practice
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#19382C]">{tier.name}</h3>
                  <p className="text-xs text-[#535C56] mt-1 h-10">{tier.tagline}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#19382C]">
                      ₹{tier.monthlyPrice}
                    </span>
                    <span className="text-xs text-[#535C56]">/ month</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1 text-xs text-[#535C56]">
                  {tier.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#244A3C] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/register"
                  className={`w-full py-3 rounded-xl text-xs font-semibold text-center transition-all ${
                    isPopular
                      ? 'bg-[#19382C] text-white hover:bg-[#244E3E] shadow-sm'
                      : 'bg-[#FAF8F5] text-[#19382C] border border-[#EAE5DE] hover:bg-[#E8EFEA]'
                  }`}
                >
                  {tier.monthlyPrice === 0 ? 'Start Free Practice' : `Get Started with ${tier.name}`}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking Modal */}
      {bookingTherapist && (
        <BookingModal
          therapist={bookingTherapist}
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setBookingTherapist(null);
          }}
        />
      )}
    </div>
  );
}
