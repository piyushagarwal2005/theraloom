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
  ChevronDown,
  Sparkle,
  PhoneCall,
  Activity,
  UserCheck,
  BadgeCheck,
  Brain,
  Shield,
  Zap,
  Flame,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Compass,
  Smile,
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import BookingModal from '../../components/scheduling/BookingModal';
import api from '../../api/axiosInstance';

const SPECIALTY_CATEGORIES = [
  'All Specialties',
  'People-Pleasing & Boundaries',
  'Anxiety & Overthinking',
  'Attachment & Relationships',
  'Burnout & Exhaustion',
  'Trauma & Somatic',
  'Couples Therapy',
];

const PATTERN_ARCHETYPES = [
  {
    id: 'people-pleaser',
    title: 'The Chronic People-Pleaser',
    category: 'People-Pleasing & Boundaries',
    quote: 'You apologize before expressing a need. You say yes to avoid conflict, then secretly resent everyone for taking what you offered.',
    signals: ['Boundary paralysis', 'Throat tightness when saying no', 'Over-anticipating others’ moods'],
    antidote: 'Somatic assertiveness training & guilt desensitization',
    icon: Heart,
    color: 'from-amber-500/10 to-orange-500/10 border-amber-200/80',
  },
  {
    id: 'overthinker',
    title: 'The High-Functioning Overthinker',
    category: 'Anxiety & Overthinking',
    quote: 'To the outside world, you are the unflappable pillar. Inside, your nervous system is running 40 catastrophic simulations at 2 AM.',
    signals: ['Decision paralysis', 'Jaw clenching & insomnia', 'Chronic perfectionism loops'],
    antidote: 'CBT cognitive defusion & vagal down-regulation',
    icon: Brain,
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/80',
  },
  {
    id: 'emotionally-guarded',
    title: 'The Emotionally Guarded',
    category: 'Attachment & Relationships',
    quote: 'You pride yourself on fierce self-reliance. But deep down, vulnerability feels like handing someone a weapon they will use against you.',
    signals: ['Withdrawing when intimacy grows', 'Dismissive independence', 'Difficulty crying or asking for help'],
    antidote: 'Psychodynamic attachment reparenting & relational exposure',
    icon: Shield,
    color: 'from-blue-500/10 to-indigo-500/10 border-blue-200/80',
  },
  {
    id: 'burned-out',
    title: 'The Burned-Out Achiever',
    category: 'Burnout & Exhaustion',
    quote: 'Your self-worth is hostage to your productivity. Resting feels like failing, and success only buys 10 minutes of peace before panic sets in.',
    signals: ['Existential exhaustion', 'Weekend guilt & restlessness', 'Emotional flattening / numbness'],
    antidote: 'ACT values realignment & nervous system recalibration',
    icon: Flame,
    color: 'from-rose-500/10 to-red-500/10 border-rose-200/80',
  },
];

const FAQS = [
  {
    question: "Why do you emphasize 'no spiritual bypassing'?",
    answer:
      "Spiritual bypassing is the tendency to use positive affirmations, 'good vibes only' platitudes, or superficial mindfulness to avoid facing painful somatic wounds, trauma, and relational patterns. We don't ask you to 'manifest happiness.' Our accredited clinical psychologists use evidence-based methods (CBT, DBT, Somatic Experiencing, Psychodynamic) to deconstruct real neural and behavioral patterns.",
  },
  {
    question: 'What actually happens in the ₹299 Clarity Session?',
    answer:
      'The 20-minute Clarity Session is a low-friction diagnostic fit check. You meet one-on-one with an accredited psychologist via private video to name your core friction point, experience their clinical style, and receive an honest treatment trajectory. There is zero sales pressure to continue if you do not feel an authentic clinical resonance.',
  },
  {
    question: 'How is this different from an Instagram coach or generic therapist app?',
    answer:
      'Every practitioner on Theraloom holds verified clinical credentials (RCI registration, M.Phil, or Master’s in Clinical/Counselling Psychology). We strictly reject 2-week certified life coaches. Furthermore, our therapists cap their caseloads at 20-25 clients/week, ensuring they are mentally sharp and deeply attuned rather than running burned-out 45-client assembly lines.',
  },
  {
    question: 'Is my therapy data and video call confidential under Indian law?',
    answer:
      'Yes. Theraloom is engineered under India’s Digital Personal Data Protection (DPDP) Act 2023 and the Mental Healthcare Act (MHCA) 2017. Clinical notes default strictly to isolated private therapist storage, and all telehealth sessions run over peer-to-peer encrypted WebRTC connections with zero recording or algorithmic eavesdropping.',
  },
  {
    question: 'How many sessions does it take to break an ingrained pattern?',
    answer:
      'While every nervous system is unique, most clients report measurable behavioral relief and clarity within 4 to 8 sessions. We establish clear diagnostic milestones in your initial sessions so you can track your cognitive defusion, emotional regulation, and relational boundaries objectively.',
  },
  {
    question: 'What if I don’t click with my therapist?',
    answer:
      'Therapeutic alliance is the single highest predictor of clinical success. If you don’t feel comfortable, our client care concierge will match you with another specialist in our directory immediately at no penalty. Finding the right human fit is essential.',
  },
];

export default function Home() {
  const [featuredTherapists, setFeaturedTherapists] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [bookingTherapist, setBookingTherapist] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingInitialService, setBookingInitialService] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Interactive 3-Step Pattern-Break Resonance Quiz
  const [quizStep, setQuizStep] = useState(0); // 0: Pattern, 1: Approach, 2: Mode, 3: Result
  const [quizAnswers, setQuizAnswers] = useState({
    pattern: '',
    approach: '',
    language: 'English',
  });

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

  const openBookingFor = (therapist, service = null) => {
    setBookingTherapist(therapist);
    setBookingInitialService(service);
    setBookingModalOpen(true);
  };

  const handleSelectPatternCard = (categoryName) => {
    setSelectedSpecialty(categoryName);
    const directoryEl = document.getElementById('directory');
    if (directoryEl) {
      directoryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookClarityDirect = () => {
    if (featuredTherapists.length > 0) {
      const primaryTherapist = featuredTherapists[0];
      const clarityService = {
        _id: 'default_clarity_299',
        title: 'Introductory Clarity Session (Pattern Break)',
        description: '20-min focused diagnostic fit check. Unpack your core friction point and evaluate clinical alignment.',
        durationMinutes: 20,
        price: 299,
      };
      openBookingFor(primaryTherapist, clarityService);
    } else {
      const directoryEl = document.getElementById('directory');
      if (directoryEl) {
        directoryEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Filter therapists by specialty & language
  const filteredTherapists = featuredTherapists.filter((t) => {
    const matchesSpec =
      selectedSpecialty === 'All Specialties' ||
      (t.specializations || []).some((s) => {
        const queryTerm = selectedSpecialty.toLowerCase().split(' ')[0];
        return s.toLowerCase().includes(queryTerm);
      });
    const matchesLang =
      selectedLanguage === 'All' ||
      (t.languages || []).some((l) => l.toLowerCase() === selectedLanguage.toLowerCase());
    return matchesSpec && matchesLang;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F2421]">
      {/* 1. HERO SECTION (unfazed.in Reference: "Your pain has a pattern. Break it.") */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden border-b border-[#EAE5DE]">
        {/* Subtle background ambient orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#E8EFEA]/60 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Bold Unfazed Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFEA] border border-[#D5DDD8] text-xs font-semibold text-[#19382C] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#5F7F6E]" />
                <span className="tracking-wide">EVIDENCE-BASED CARE FOR INGRAINED ADULT PATTERNS</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#19382C] leading-[1.12]">
                Your pain has a pattern. <br />
                <span className="italic font-normal text-[#5F7F6E]">
                  Break it.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#535C56] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Real licensed therapists. Measurable cognitive and somatic shifts. Zero spiritual bypassing. Connect with accredited clinical psychologists across India dedicated to deconstructing chronic loops.
              </p>

              {/* Value Pillar Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#E8EFEA] text-[#19382C] border border-[#C5D7CC]">
                  ✓ ₹299 Intro Clarity Session
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white text-[#535C56] border border-[#EAE5DE]">
                  ✓ 100% RCI & Master’s Clinicians
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white text-[#535C56] border border-[#EAE5DE]">
                  ✓ Max 20 Clients/Wk Caseload Cap
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white text-[#535C56] border border-[#EAE5DE]">
                  ✓ DPDP 2023 Encrypted Telehealth
                </span>
              </div>

              {/* High-Converting Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#quiz"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#19382C] text-white text-xs font-bold hover:bg-[#244E3E] transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>Match With a Specialist (2 Min Quiz)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <button
                  onClick={handleBookClarityDirect}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#E8EFEA] text-[#19382C] text-xs font-bold hover:bg-[#d8e6dc] transition-all border border-[#C5D7CC] flex items-center justify-center gap-2"
                >
                  <Sparkle className="w-3.5 h-3.5 text-[#5F7F6E]" />
                  <span>Book ₹299 Clarity Session</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-[#EAE5DE] shadow-sanctuary max-w-xl mx-auto lg:mx-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B] mb-1">
                      Pattern / Specialty
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
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#535C56]">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-[#5F7F6E]" />
                  <span>100% RCI & Accredited Clinicians</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>4.95/5 Client Care Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#5F7F6E]" />
                  <span>Strict DPDP 2023 Isolation</span>
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

                {/* Floating Availability Card */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-[#EAE5DE] flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <p className="text-[11px] font-bold text-[#19382C]">Open Slots Today & Tomorrow</p>
                    <p className="text-[10px] text-[#7D9D8B]">Telehealth Video across India</p>
                  </div>
                </div>

                {/* Floating Anti-Bypassing Guarantee Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-[#EAE5DE] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] flex items-center justify-center text-[#19382C]">
                      <ShieldCheck className="w-5 h-5 text-[#244A3C]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#19382C]">Zero Spiritual Bypassing</p>
                      <p className="text-[11px] text-[#535C56]">Evidence-based CBT, Somatic & Psychodynamic</p>
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

      {/* 2. IDENTIFY YOUR PATTERN SECTION (The Unfazed Core Archetypes) */}
      <section id="patterns" className="scroll-mt-28 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
            Pattern Recognition
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
            Most adult suffering isn't bad luck. <br />
            <span className="italic font-normal text-[#5F7F6E]">
              It's an outdated coping mechanism.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#535C56] leading-relaxed">
            Ingrained survival strategies that once protected you during childhood or high stress now keep you exhausted, anxious, and emotionally isolated. Which of these patterns sounds like your inner world?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PATTERN_ARCHETYPES.map((arch) => {
            const IconComponent = arch.icon;
            return (
              <div
                key={arch.id}
                className="bg-white rounded-3xl border border-[#EAE5DE] p-6 flex flex-col justify-between shadow-sanctuary hover:shadow-sanctuary-hover hover:border-[#7D9D8B] transition-all group duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-[#E8EFEA] flex items-center justify-center text-[#19382C] group-hover:bg-[#19382C] group-hover:text-white transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#EAE5DE]">
                      Archetype
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#19382C] group-hover:text-[#244E3E] transition-colors">
                    {arch.title}
                  </h3>

                  <blockquote className="text-xs text-[#535C56] italic border-l-2 border-[#7D9D8B] pl-3 py-1 leading-relaxed">
                    "{arch.quote}"
                  </blockquote>

                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B]">
                      Ingrained Somatic Signals:
                    </p>
                    <ul className="space-y-1">
                      {arch.signals.map((sig, i) => (
                        <li key={i} className="text-xs text-[#535C56] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[#FAF8F5]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B]">
                      Clinical Antidote:
                    </p>
                    <p className="text-xs text-[#19382C] font-semibold mt-0.5">
                      {arch.antidote}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleSelectPatternCard(arch.category)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#19382C] text-[#19382C] hover:text-white text-xs font-bold transition-all border border-[#EAE5DE] flex items-center justify-center gap-1.5 group-hover:border-[#19382C]"
                  >
                    <span>Break This Pattern</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. THE ANTI-GURU CLINICAL STANDARD (unfazed.in core stance) */}
      <section id="anti-guru" className="scroll-mt-28 py-20 bg-[#122B21] text-white border-y border-[#19382C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1 text-xs font-bold tracking-wider uppercase text-[#A9BDA9] bg-[#19382C] px-3.5 py-1 rounded-full border border-[#244E3E]">
              The Clinical Standard
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold">
              Real therapy isn't positive affirmations. <br />
              <span className="italic font-normal text-[#A9BDA9]">
                It is structured, clinical deconstruction.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#A9BDA9] max-w-xl mx-auto leading-relaxed">
              We started Theraloom because we were tired of superficial wellness apps, uncredentialed influencers giving toxic positivity advice, and therapists forced to see 40+ clients a week.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Left: What passes for wellness today */}
            <div className="bg-[#19382C]/60 rounded-3xl p-8 border border-rose-900/40 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-950/60 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-rose-200">
                  What Passes For Wellness Today
                </h3>
              </div>

              <ul className="space-y-4 text-xs text-[#E4ECE7]/80">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Spiritual Bypassing:</strong> "Just manifest abundance and think positive" — invalidating genuine trauma and nervous system distress.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Unregulated "Life Coaches":</strong> Influencers with 2-week PDF certificates offering pseudo-psychological advice without clinical ethics.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Therapy Mills:</strong> Overworked clinicians forced to take 40-50 clients a week like call center reps, burning out and forgetting your story.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Data Mining:</strong> Wellness apps logging emotional disclosures to train generic corporate AI models.</span>
                </li>
              </ul>
            </div>

            {/* Right: The Theraloom Clinical Standard */}
            <div className="bg-[#19382C] rounded-3xl p-8 border border-[#244E3E] space-y-6 shadow-xl ring-1 ring-[#5F7F6E]/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#244E3E] text-emerald-400 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  The Theraloom Standard (Unfazed Care)
                </h3>
              </div>

              <ul className="space-y-4 text-xs text-[#FAF8F5]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% Accredited Psychologists:</strong> RCI Registered, M.Phil, or Master's degrees from premier institutions (NIMHANS, Delhi Univ, TISS).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Validated Modalities:</strong> CBT thought restructuring, DBT distress tolerance, Somatic Experiencing, and Psychodynamic reparenting.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Caseload Caps (Max 20/Wk):</strong> Our therapists strictly limit their caseload so they are rested, emotionally present, and remember every detail.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>DPDP & MHCA 2017 Isolation:</strong> Private clinical notes remain in isolated therapist vaults with zero surveillance.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LOW-BARRIER ENTRY: THE ₹299 CLARITY SESSION SPOTLIGHT */}
      <section id="clarity-session" className="scroll-mt-28 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#EAE5DE] p-8 sm:p-12 shadow-sanctuary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8EFEA]/40 rounded-full blur-3xl -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#19382C] bg-[#E8EFEA] px-3 py-1 rounded-full border border-[#D5DDD8]">
                Low-Friction Fit Check
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
                Finding the right therapist shouldn't cost ₹2,000+ just to test chemistry.
              </h2>
              <p className="text-xs sm:text-sm text-[#535C56] max-w-2xl leading-relaxed">
                Therapeutic fit is the single biggest predictor of whether therapy actually works. Our 20-minute Introductory Clarity Session gives you a focused, low-risk space to experience a clinician's demeanor, identify your core pattern, and decide if you want to work together.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B]">Step 01</span>
                  <p className="text-xs font-bold text-[#19382C]">Name Your Friction Point</p>
                  <p className="text-[11px] text-[#535C56]">Unpack the immediate cycle keeping you anxious or stuck.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B]">Step 02</span>
                  <p className="text-xs font-bold text-[#19382C]">Experience Attunement</p>
                  <p className="text-[11px] text-[#535C56]">Assess whether you feel deeply heard and understood.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B]">Step 03</span>
                  <p className="text-xs font-bold text-[#19382C]">Treatment Trajectory</p>
                  <p className="text-[11px] text-[#535C56]">Get an honest clinical plan with zero sales pressure.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 text-center lg:text-right space-y-4">
              <div className="inline-block p-6 rounded-3xl bg-[#FAF8F5] border border-[#EAE5DE] text-center w-full max-w-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B]">Introductory Rate</span>
                <div className="text-4xl font-bold text-[#19382C] mt-1 mb-1">
                  ₹299
                </div>
                <p className="text-[11px] text-[#535C56] mb-4">20-minute 1-on-1 virtual clinical consultation</p>
                <button
                  onClick={handleBookClarityDirect}
                  className="w-full py-3 rounded-xl bg-[#19382C] text-white text-xs font-bold hover:bg-[#244E3E] transition-all shadow-sm"
                >
                  Book Your ₹299 Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THERAPIST DIRECTORY (Alma & unfazed.in Style Filtered Cards) */}
      <section id="directory" className="scroll-mt-28 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
              Verified Practitioners
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
              Licensed Clinical Psychologists Ready to Guide You
            </h2>
            <p className="text-xs sm:text-sm text-[#535C56] max-w-xl">
              Each practitioner on Theraloom holds verified clinical credentials, operates an independent practice, and adheres to ethical clinical codes under MHCA 2017.
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
                        {therapist.qualifications || 'RCI Registered Clinical Psychologist'}
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
                        Slots open this week
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
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Activity className="w-3.5 h-3.5 text-[#7D9D8B]" />
                        <span>Caseload:</span>
                      </span>
                      <span className="font-semibold text-[#19382C] text-[11px]">
                        Capped (Max 20/wk)
                      </span>
                    </div>
                  </div>

                  {/* Pricing Overview */}
                  <div className="mb-4 flex items-center justify-between text-xs px-1">
                    <div>
                      <span className="text-[10px] text-[#7D9D8B] uppercase font-bold">Intro Clarity</span>
                      <p className="font-bold text-[#19382C]">₹299 <span className="text-[10px] font-normal text-[#535C56]">/ 20m</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#7D9D8B] uppercase font-bold">Full Clinical</span>
                      <p className="font-bold text-[#19382C]">₹{therapist.consultationFee || 1800} <span className="text-[10px] font-normal text-[#535C56]">/ 50m</span></p>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-auto pt-4 border-t border-[#EAE5DE] flex items-center justify-between gap-2">
                    <Link
                      to={`/${therapist.slug}`}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-[#19382C] hover:bg-[#FAF8F5] border border-[#EAE5DE] transition-colors text-center"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => openBookingFor(therapist)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#19382C] text-white hover:bg-[#244E3E] transition-all shadow-xs text-center"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. INTERACTIVE 3-STEP PATTERN-BREAK QUIZ (Resonance Matcher) */}
      <section id="quiz" className="scroll-mt-28 py-20 bg-[#19382C] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#A9BDA9] bg-[#244E3E] px-3.5 py-1 rounded-full">
            <Sparkle className="w-3.5 h-3.5" />
            <span>2-Minute Therapist Resonance Matcher</span>
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Not sure where to begin? Let's decode your pattern.
          </h2>

          <p className="text-xs sm:text-sm text-[#A9BDA9] max-w-lg mx-auto leading-relaxed">
            Answer three quick clinical resonance questions to match with a licensed psychologist specializing in your exact psychological pattern.
          </p>

          <div className="bg-[#122B21] p-6 sm:p-8 rounded-3xl border border-[#244E3E] max-w-xl mx-auto space-y-5 text-left shadow-2xl">
            {/* Step 0: Identify Pattern */}
            {quizStep === 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#A9BDA9]">
                  <span className="font-bold">Step 1 of 3: Primary Pattern</span>
                  <span>Select one</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { label: 'Chronic People-Pleasing & Boundary Paralysis', value: 'People-Pleasing' },
                    { label: 'High-Functioning Anxiety & Overthinking Loops', value: 'Anxiety' },
                    { label: 'Emotional Avoidance & Fear of Intimacy', value: 'Avoidance' },
                    { label: 'Workplace Burnout & Performative Perfectionism', value: 'Burnout' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setQuizAnswers({ ...quizAnswers, pattern: opt.value });
                        setQuizStep(1);
                      }}
                      className="p-3.5 rounded-xl border border-[#244E3E] bg-[#19382C] hover:bg-[#244E3E] text-xs font-medium text-left transition-colors flex items-center justify-between group"
                    >
                      <span>{opt.label}</span>
                      <ChevronRight className="w-4 h-4 text-[#7D9D8B] group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Therapy Style */}
            {quizStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#A9BDA9]">
                  <span className="font-bold">Step 2 of 3: Clinical Approach</span>
                  <button onClick={() => setQuizStep(0)} className="text-[11px] underline">Back</button>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { label: 'Structured & Action-Oriented (CBT / Thought Diaries)', value: 'CBT' },
                    { label: 'Deep, Reflective & Relational (Psychodynamic / Inner Child)', value: 'Psychodynamic' },
                    { label: 'Body-Centred & Nervous System (Somatic / Polyvagal)', value: 'Somatic' },
                  ].map((appr) => (
                    <button
                      key={appr.value}
                      onClick={() => {
                        setQuizAnswers({ ...quizAnswers, approach: appr.value });
                        setQuizStep(2);
                      }}
                      className="p-3.5 rounded-xl border border-[#244E3E] bg-[#19382C] hover:bg-[#244E3E] text-xs font-medium text-left transition-colors flex items-center justify-between group"
                    >
                      <span>{appr.label}</span>
                      <ChevronRight className="w-4 h-4 text-[#7D9D8B] group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Language Preference */}
            {quizStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#A9BDA9]">
                  <span className="font-bold">Step 3 of 3: Preferred Language</span>
                  <button onClick={() => setQuizStep(1)} className="text-[11px] underline">Back</button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {['English', 'Hindi', 'Tamil', 'Malayalam', 'Bengali', 'Marathi'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setQuizAnswers({ ...quizAnswers, language: lang });
                        setQuizStep(3);
                      }}
                      className="p-3 rounded-xl border border-[#244E3E] bg-[#19382C] hover:bg-[#244E3E] text-xs font-medium text-center transition-colors"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Match Result */}
            {quizStep === 3 && (
              <div className="text-center space-y-4 py-3">
                <div className="w-12 h-12 rounded-full bg-[#244E3E] text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Recommended Clinical Match</h4>
                  <p className="text-xs text-[#A9BDA9] mt-1.5 leading-relaxed">
                    Based on your focus on <span className="text-white font-semibold">{quizAnswers.pattern}</span> and preference for{' '}
                    <span className="text-white font-semibold">{quizAnswers.approach}</span> modalities in{' '}
                    <span className="text-white font-semibold">{quizAnswers.language}</span>, our senior clinical team recommends:
                  </p>
                </div>

                {featuredTherapists.length > 0 && (
                  <div className="bg-[#19382C] p-4 rounded-2xl border border-[#244E3E] flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={featuredTherapists[0].profileImage}
                        name={featuredTherapists[0].name}
                        size="md"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{featuredTherapists[0].name}</p>
                        <p className="text-[11px] text-[#A9BDA9]">{featuredTherapists[0].title}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openBookingFor(featuredTherapists[0])}
                      className="px-3.5 py-1.5 rounded-xl bg-white text-[#19382C] text-xs font-bold hover:bg-[#FAF8F5]"
                    >
                      Book Slot
                    </button>
                  </div>
                )}

                <div className="pt-2 flex justify-center gap-3">
                  <a
                    href="#directory"
                    className="px-5 py-2.5 rounded-xl bg-white text-[#19382C] text-xs font-bold hover:bg-[#FAF8F5]"
                  >
                    View All Matching Therapists
                  </a>
                  <button
                    onClick={() => setQuizStep(0)}
                    className="text-xs text-[#A9BDA9] hover:text-white underline"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. HOW CARE WORKS AT THERALOOM (4-Step Healing Journey) */}
      <section id="how-it-works" className="scroll-mt-28 py-20 bg-[#F4EFEB]/60 border-y border-[#EAE5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
              The Care Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
              How care works at Theraloom
            </h2>
            <p className="text-xs sm:text-sm text-[#535C56]">
              Designed to take away the administrative friction of finding a therapist and starting real clinical work.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-[#EAE5DE] space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-full bg-[#E8EFEA] text-[#19382C] text-xs font-bold flex items-center justify-center">
                01
              </span>
              <h3 className="text-base font-bold text-[#19382C]">Identify & Match</h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Filter by presenting pattern, clinical framework (CBT, Somatic, Psychodynamic), language, and fee. Read verified credentials.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#EAE5DE] space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-full bg-[#E8EFEA] text-[#19382C] text-xs font-bold flex items-center justify-center">
                02
              </span>
              <h3 className="text-base font-bold text-[#19382C]">Clarity Fit Check</h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Test clinical chemistry with an introductory ₹299 Clarity Session (20m) before committing to a longer care plan.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#EAE5DE] space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-full bg-[#E8EFEA] text-[#19382C] text-xs font-bold flex items-center justify-center">
                03
              </span>
              <h3 className="text-base font-bold text-[#19382C]">Encrypted Telehealth</h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Join private, zero-surveillance WebRTC video sessions directly from any browser. No invasive downloads required.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#EAE5DE] space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-full bg-[#E8EFEA] text-[#19382C] text-xs font-bold flex items-center justify-center">
                04
              </span>
              <h3 className="text-base font-bold text-[#19382C]">Somatic & Behavioral Shift</h3>
              <p className="text-xs text-[#535C56] leading-relaxed">
                Receive shared reflection takeaways, practice boundary drills, and review your progress securely in your Client Portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. STRAIGHT TALK (Anti-Bypassing FAQs Accordion) */}
      <section id="faq" className="scroll-mt-28 py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
            Straight Talk
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#535C56]">
            Honest answers to the most common questions and skepticisms about psychotherapy.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-[#EAE5DE] overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-bold text-[#19382C]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7D9D8B] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#19382C]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs text-[#535C56] leading-relaxed border-t border-[#FAF8F5] pt-3 animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. TRANSPARENT PRICING & PRACTITIONER TIERS (For Therapists) */}
      <section id="pricing" className="scroll-mt-28 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7D9D8B]">
            For Therapists & Practices
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#19382C]">
            Plans designed to run an ethical, independent practice
          </h2>
          <p className="text-xs sm:text-sm text-[#535C56]">
            Start free with solo essentials. Unlock structured SOAP/DAP clinical templates and client CRM as your practice grows.
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
          selectedService={bookingInitialService}
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setBookingTherapist(null);
            setBookingInitialService(null);
          }}
        />
      )}
    </div>
  );
}
