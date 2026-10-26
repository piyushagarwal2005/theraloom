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
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  Sparkle,
  PhoneCall,
  Activity,
  UserCheck,
  BadgeCheck,
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import BookingModal from '../../components/scheduling/BookingModal';
import api from '../../api/axiosInstance';

const SPECIALTY_CATEGORIES = [
  'All Specialties',
  'Anxiety & Panic',
  'Depression',
  'Trauma & PTSD',
  'Couples & Relationships',
  'Workplace Burnout',
  'Grief & Loss',
  'Youth & Students',
];

export default function Home() {
  const [featuredTherapists, setFeaturedTherapists] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [bookingTherapist, setBookingTherapist] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  // Quick Matching Quiz State
  const [quizStep, setQuizStep] = useState(0); // 0: start, 1: who, 2: goal, 3: result
  const [quizAnswers, setQuizAnswers] = useState({ forWhom: '', primaryGoal: '' });

  useEffect(() => {
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

    const fetchTiers = async () => {
      try {
        const res = await api.get('/tiers');
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

  // Filter therapists by specialty & language
  const filteredTherapists = featuredTherapists.filter((t) => {
    const matchesSpec =
      selectedSpecialty === 'All Specialties' ||
      (t.specializations || []).some((s) =>
        s.toLowerCase().includes(selectedSpecialty.toLowerCase().split(' ')[0])
      );
    const matchesLang =
      selectedLanguage === 'All' ||
      (t.languages || []).some((l) => l.toLowerCase() === selectedLanguage.toLowerCase());

    return matchesSpec && matchesLang;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F2421]">
      {/* 1. HERO SECTION (Alma / Headway Editorial Sanctuary) */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden border-b border-[#EAE5DE]">
        {/* Subtle background ambient orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#E8EFEA]/60 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFEA] border border-[#D5DDD8] text-xs font-semibold text-[#19382C] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#5F7F6E]" />
                <span>Next-Generation Therapy Practice & Telehealth Suite</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#19382C] leading-[1.12]">
                Therapy that meets you <br />
                <span className="italic font-normal text-[#5F7F6E]">
                  where you truly are.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#535C56] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect with licensed clinical psychologists and psychotherapists across India. Transparent scheduling, clinical safety under MHCA 2017, and personalized care you can trust.
              </p>

              {/* Instant Search / Filter Bar (Like Headway / Airbnb) */}
              <div className="bg-white p-3 sm:p-4 rounded-3xl border border-[#EAE5DE] shadow-sanctuary max-w-xl mx-auto lg:mx-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B] mb-1">
                      Concern / Topic
                    </label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full text-xs font-semibold text-[#19382C] bg-[#FAF8F5] p-2 rounded-xl border border-[#EAE5DE] focus:outline-hidden"
                    >
                      {SPECIALTY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B] mb-1">
                      Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full text-xs font-semibold text-[#19382C] bg-[#FAF8F5] p-2 rounded-xl border border-[#EAE5DE] focus:outline-hidden"
                    >
                      <option value="All">All Languages</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Bengali">Bengali</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <a
                      href="#directory"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Find Therapist</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Verified Trust Stats */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#535C56]">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-[#5F7F6E]" />
                  <span>100% RCI & Accredited Therapists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>4.9/5 Care Experience Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#5F7F6E]" />
                  <span>Private Clinical Isolation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Serene Editorial Visual + Float Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3 sm:aspect-5/4">
                <img
                  src="https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=1200&q=80"
                  alt="Naturally lit, warm and welcoming modern psychotherapy consultation sanctuary"
                  onError={(e) => {
                    e.currentTarget.src = '/images/hero-therapy-room.svg';
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Floating Practitioner Highlight Card */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-[#EAE5DE] flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <p className="text-[11px] font-bold text-[#19382C]">Next-Day Openings</p>
                    <p className="text-[10px] text-[#7D9D8B]">Telehealth Video across India</p>
                  </div>
                </div>

                {/* Floating Privacy Guarantee Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-[#EAE5DE] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] flex items-center justify-center text-[#19382C]">
                      <ShieldCheck className="w-5 h-5 text-[#244A3C]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#19382C]">Zero-Leakage Privacy</p>
                      <p className="text-[11px] text-[#535C56]">Notes default strictly to private</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#7D9D8B] bg-[#FAF8F5] px-2 py-1 rounded-md border border-[#EAE5DE]">
                    MHCA 2017
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THERAPIST DIRECTORY (Alma Style Filtered Cards) */}
      <section id="directory" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
              Verified Practitioners
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
              Licensed Therapists Ready to Help
            </h2>
            <p className="text-xs sm:text-sm text-[#535C56] max-w-xl">
              Each practitioner on Theraloom holds verified clinical credentials, operates an independent practice, and adheres to ethical clinical codes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-[#7D9D8B] font-semibold">
              Showing {filteredTherapists.length} available therapist{filteredTherapists.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Filter Pills Ticker */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SPECIALTY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedSpecialty(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSpecialty === cat
                  ? 'bg-[#19382C] text-white shadow-xs'
                  : 'bg-white border border-[#EAE5DE] text-[#535C56] hover:border-[#7D9D8B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {filteredTherapists.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-dashed border-[#EAE5DE] text-center space-y-3">
            <Search className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-[#19382C]">No Therapists Match This Filter</h3>
            <p className="text-xs text-[#535C56]">
              Try selecting "All Specialties" or resetting your language selection.
            </p>
            <button
              onClick={() => {
                setSelectedSpecialty('All Specialties');
                setSelectedLanguage('All');
              }}
              className="px-4 py-2 rounded-xl bg-[#19382C] text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredTherapists.map((therapist) => (
              <div
                key={therapist._id || therapist.slug}
                className="bg-white rounded-3xl border border-[#EAE5DE] overflow-hidden shadow-sanctuary hover:shadow-sanctuary-hover transition-all duration-300 flex flex-col group"
              >
                <div className="p-6 sm:p-7 flex-1 flex flex-col">
                  {/* Top Header with Avatar */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative shrink-0">
                      <Avatar
                        src={therapist.profileImage}
                        name={therapist.name}
                        size="xl"
                        className="border-2 border-white shadow-xs"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-[#19382C] group-hover:text-[#244E3E] transition-colors truncate">
                          {therapist.name}
                        </h3>
                        <BadgeCheck className="w-4 h-4 text-[#5F7F6E] shrink-0" />
                      </div>
                      <p className="text-xs text-[#7D9D8B] font-semibold truncate">
                        {therapist.title}
                      </p>
                      <p className="text-[11px] text-[#535C56] mt-0.5 truncate">
                        {therapist.qualifications || 'Licensed Mental Health Professional'}
                      </p>
                    </div>
                  </div>

                  {/* Bio Excerpt */}
                  <p className="text-xs text-[#535C56] line-clamp-3 mb-4 leading-relaxed">
                    {therapist.bio || 'Compassionate and evidence-based psychotherapy tailored to individual life transitions and mental health challenges.'}
                  </p>

                  {/* Specializations Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {(therapist.specializations || ['Anxiety', 'Stress', 'CBT']).slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-[#FAF8F5] text-[#535C56] border border-[#EAE5DE]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Next Opening & Details */}
                  <div className="space-y-1.5 mb-5 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs text-[#535C56]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-[#7D9D8B]" />
                        <span>Next Open Slot:</span>
                      </span>
                      <span className="font-semibold text-emerald-800 text-[11px]">
                        Available this week
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Globe className="w-3.5 h-3.5 text-[#7D9D8B]" />
                        <span>Languages:</span>
                      </span>
                      <span className="font-medium text-[11px] text-[#19382C]">
                        {therapist.languages?.join(', ') || 'English, Hindi'}
                      </span>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-auto pt-4 border-t border-[#EAE5DE] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#7D9D8B] uppercase font-bold tracking-wider">
                        Consultation
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
        )}
      </section>

      {/* 3. HOW CARE WORKS AT THERALOOM (4-Step Healing Journey) */}
      <section id="how-it-works" className="py-20 bg-[#F4EFEB]/60 border-y border-[#EAE5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
              The Care Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
              How care works at Theraloom
            </h2>
            <p className="text-xs sm:text-sm text-[#535C56]">
              Designed to take away the administrative anxiety of finding a therapist and attending sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-[#EAE5DE] space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-full bg-[#E8EFEA] text-[#19382C] text-xs font-bold flex items-center justify-center">
                01
              </span>
              <h3 className="text-base font-bold text-[#19382C]">Find & Match</h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Filter by presenting concern, clinical framework, language, and budget. Read transparent bios and verified credentials.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#EAE5DE] space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-full bg-[#E8EFEA] text-[#19382C] text-xs font-bold flex items-center justify-center">
                02
              </span>
              <h3 className="text-base font-bold text-[#19382C]">Book with Ease</h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Select real-time slots with atomic double-booking prevention. Complete encrypted clinical intake and digital consent.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#EAE5DE] space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-full bg-[#E8EFEA] text-[#19382C] text-xs font-bold flex items-center justify-center">
                03
              </span>
              <h3 className="text-base font-bold text-[#19382C]">Telehealth Room</h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Join your one-on-one encrypted video room directly from any browser. No downloads or intrusive apps required.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#EAE5DE] space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-full bg-[#E8EFEA] text-[#19382C] text-xs font-bold flex items-center justify-center">
                04
              </span>
              <h3 className="text-base font-bold text-[#19382C]">Shared Growth</h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Receive shared reflection takeaways, self-care exercises, and keep in touch via practitioner-client messaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EVIDENCE-BASED CLINICAL MODALITIES */}
      <section id="specialties" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
            Clinical Modalities
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
            Grounded in scientific psychotherapy frameworks
          </h2>
          <p className="text-xs sm:text-sm text-[#535C56]">
            Our therapists use validated clinical approaches tailored to your unique cognitive, emotional, and relational context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-[#EAE5DE] space-y-3">
            <h3 className="text-base font-bold text-[#19382C]">
              Cognitive Behavioral Therapy (CBT)
            </h3>
            <p className="text-xs text-[#535C56] leading-relaxed">
              Identify cognitive distortions and automatic negative thoughts. Reframe maladaptive core beliefs through evidence-based thought diaries.
            </p>
            <span className="inline-block text-[11px] text-[#7D9D8B] font-semibold">
              Recommended for Anxiety, Panic & OCD
            </span>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-[#EAE5DE] space-y-3">
            <h3 className="text-base font-bold text-[#19382C]">
              Acceptance & Commitment (ACT)
            </h3>
            <p className="text-xs text-[#535C56] leading-relaxed">
              Cultivate psychological flexibility, accept difficult internal feelings with self-compassion, and commit to actions aligned with personal values.
            </p>
            <span className="inline-block text-[11px] text-[#7D9D8B] font-semibold">
              Recommended for Chronic Stress & Burnout
            </span>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-[#EAE5DE] space-y-3">
            <h3 className="text-base font-bold text-[#19382C]">
              Psychodynamic & Inner Child
            </h3>
            <p className="text-xs text-[#535C56] leading-relaxed">
              Explore unconscious relational patterns, early attachment wounds, and emotional triggers to foster deep, lasting emotional healing.
            </p>
            <span className="inline-block text-[11px] text-[#7D9D8B] font-semibold">
              Recommended for Relationship Patterns & Grief
            </span>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE 60-SECOND MATCHING QUIZ */}
      <section className="py-16 bg-[#19382C] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#A9BDA9] bg-[#244E3E] px-3.5 py-1 rounded-full">
            <Sparkle className="w-3.5 h-3.5" />
            <span>Therapist Resonance Finder</span>
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Not sure where to begin? Let's narrow it down.
          </h2>

          <p className="text-xs sm:text-sm text-[#A9BDA9] max-w-lg mx-auto leading-relaxed">
            Answer two quick questions to see which clinical modality and therapist specialization best matches your current life context.
          </p>

          <div className="bg-[#122B21] p-6 sm:p-8 rounded-3xl border border-[#244E3E] max-w-xl mx-auto space-y-4 text-left">
            {quizStep === 0 && (
              <div className="space-y-4">
                <p className="text-xs text-[#E4ECE7] font-semibold">
                  1. Who is this care for?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {['Myself (Individual)', 'Myself & Partner (Couples)', 'Teen / Student', 'Workplace Support'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setQuizAnswers({ ...quizAnswers, forWhom: opt });
                        setQuizStep(1);
                      }}
                      className="p-3 rounded-xl border border-[#244E3E] bg-[#19382C] hover:bg-[#244E3E] text-xs font-medium text-left transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-[#E4ECE7] font-semibold">
                  2. What is your primary mental health goal?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Overcome Anxiety & Overthinking',
                    'Heal from Burnout & Exhaustion',
                    'Repair Communication & Trust',
                    'Navigate Grief or Major Change',
                  ].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => {
                        setQuizAnswers({ ...quizAnswers, primaryGoal: goal });
                        setQuizStep(2);
                      }}
                      className="p-3 rounded-xl border border-[#244E3E] bg-[#19382C] hover:bg-[#244E3E] text-xs font-medium text-left transition-colors"
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 2 && (
              <div className="text-center space-y-4 py-2">
                <div className="w-10 h-10 rounded-full bg-[#244E3E] text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Recommended Clinical Match</h4>
                  <p className="text-xs text-[#A9BDA9] mt-1">
                    Based on your focus on <span className="text-white font-semibold">{quizAnswers.primaryGoal}</span>, we recommend a practitioner specializing in{' '}
                    <span className="text-white font-semibold">CBT & Mindfulness Regulation</span>.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <a
                    href="#directory"
                    className="px-5 py-2.5 rounded-xl bg-white text-[#19382C] text-xs font-bold hover:bg-[#FAF8F5]"
                  >
                    View Recommended Therapists
                  </a>
                  <button
                    onClick={() => setQuizStep(0)}
                    className="text-xs text-[#A9BDA9] hover:text-white underline"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING & PRACTITIONER TIERS */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
            For Therapists & Practices
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
            Plans designed to grow with your private practice
          </h2>
          <p className="text-xs sm:text-sm text-[#535C56]">
            Start free with solo essentials. Unlock structured SOAP/DAP templates and multi-year analytics as your caseload expands.
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
                    ? 'bg-white border-[#19382C] shadow-2xl ring-2 ring-[#19382C]'
                    : 'bg-white border-[#EAE5DE] shadow-xs'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#19382C] text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
                    Most Popular for Private Practices
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
