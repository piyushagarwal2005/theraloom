import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall,
  Heart,
  AlertTriangle,
  Clock,
  Languages,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';

const HELPLINES = [
  {
    name: 'Tele-MANAS',
    org: 'National Tele-Mental Health Programme (Govt. of India)',
    numbers: ['14416', '1800-891-4416'],
    primaryCall: '14416',
    hours: '24 Hours / 7 Days a Week',
    fee: 'Toll-Free (100% Free)',
    languages: ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Odia', 'Assamese'],
    category: 'Govt. of India Toll-Free',
    description:
      'Initiative launched by the Ministry of Health and Family Welfare with apex center at NIMHANS. Connects callers with certified psychologists, clinical counsellors, and psychiatrists across 51 regional cells in 20+ languages.',
    isPrimary: true,
  },
  {
    name: 'KIRAN Helpline',
    org: 'Ministry of Social Justice & Empowerment (Govt. of India)',
    numbers: ['1800-599-0019'],
    primaryCall: '18005990019',
    hours: '24 Hours / 7 Days a Week',
    fee: 'Toll-Free',
    languages: ['Hindi', 'English', 'Assamese', 'Tamil', 'Marathi', 'Odia', 'Telugu', 'Malayalam', 'Gujarati', 'Punjabi', 'Kannada', 'Bengali', 'Urdu'],
    category: 'Govt. of India Toll-Free',
    description:
      'National mental health helpline providing psychological first aid, stress alleviation, panic relief, and rehabilitation referrals.',
    isPrimary: true,
  },
  {
    name: 'Vandrevala Foundation',
    org: 'Cyrus & Priya Vandrevala Foundation',
    numbers: ['+91 9999 666 555'],
    primaryCall: '+919999666555',
    hours: '24x7 Continuous Support',
    fee: 'Free Service',
    languages: ['Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali'],
    category: 'Non-Profit 24x7',
    description:
      'One of India’s largest private mental health telephone services. Staffed around the clock by experienced, trained psychologists and crisis intervention specialists with over 1 million callers assisted.',
    isPrimary: true,
  },
  {
    name: 'AASRA Helpline',
    org: 'AASRA Suicide Prevention & Crisis Centre',
    numbers: ['+91 98204 66726'],
    primaryCall: '+919820466726',
    hours: '24x7 All 365 Days',
    fee: 'Standard Call Rates',
    languages: ['Hindi', 'English'],
    category: 'Suicide Prevention',
    description:
      'Specialized, confidential suicide prevention crisis hotline providing immediate non-judgmental emotional support to individuals undergoing extreme distress or suicidal ideation.',
    isPrimary: true,
  },
  {
    name: 'iCALL Psychosocial Helpline',
    org: 'Tata Institute of Social Sciences (TISS), Mumbai',
    numbers: ['+91 91529 87821'],
    primaryCall: '+919152987821',
    hours: 'Mon to Sat: 8:00 AM – 10:00 PM',
    fee: 'Standard Call Rates',
    languages: ['Hindi', 'English', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Malayalam'],
    category: 'Academic & Professional',
    description:
      'Run by professional mental health practitioners at TISS. Provides counselling on relationships, emotional distress, gender identity, work pressure, and grief.',
  },
  {
    name: 'NIMHANS Helpline',
    org: 'National Institute of Mental Health & Neurosciences, Bengaluru',
    numbers: ['080-46110007'],
    primaryCall: '08046110007',
    hours: '24 Hours Daily',
    fee: 'Standard Rates',
    languages: ['Hindi', 'English', 'Kannada', 'Regional'],
    category: 'Premier Institute',
    description:
      'Psychosocial support helpline run by India’s premier neuro-psychiatric institute. Supports acute distress, pandemic anxiety, and psychiatric guidance.',
  },
  {
    name: 'Sneha India',
    org: 'Sneha Suicide Prevention Centre, Chennai',
    numbers: ['+91 44 2464 0050'],
    primaryCall: '+914424640050',
    hours: '24 Hours / 7 Days a week',
    fee: 'Standard Call Rates',
    languages: ['English', 'Tamil', 'Hindi'],
    category: 'Suicide Prevention',
    description:
      'Recognized national suicide prevention centre offering anonymous, unconditional emotional support to anyone feeling depressed, lonely, or suicidal.',
  },
  {
    name: 'Childline India',
    org: 'Ministry of Women and Child Development',
    numbers: ['1098'],
    primaryCall: '1098',
    hours: '24x7 Emergency',
    fee: 'Toll-Free',
    languages: ['All Major Indian Languages'],
    category: 'Children & Adolescents',
    description:
      'Nationwide 24-hour emergency phone service for children and adolescents in need of care, protection, emotional distress intervention, or abuse safety.',
  },
];

export default function CrisisHelplines() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLang, setSelectedLang] = useState('All');

  const filteredHelplines = HELPLINES.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.org.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang =
      selectedLang === 'All' || h.languages.some((l) => l.toLowerCase() === selectedLang.toLowerCase());
    return matchesSearch && matchesLang;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#7D9D8B]">
          <Link to="/" className="hover:text-[#19382C] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#19382C] font-semibold">Emergency Crisis Helplines</span>
        </div>

        {/* Emergency Alert Banner */}
        <div className="rounded-3xl bg-[#19382C] text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#7D9D8B]/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>24x7 Immediate Emergency Assistance in India</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
              You Are Not Alone. Support is Available Right Now.
            </h1>

            <p className="text-xs sm:text-sm text-[#A9BDA9] leading-relaxed">
              If you or someone you know is in acute distress, experiencing overwhelming emotional pain, or having thoughts of self-harm or suicide, please reach out to one of the verified 24x7 crisis response organizations below. All conversations are free, compassionate, and confidential.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="tel:14416"
                className="px-6 py-3 rounded-2xl bg-white text-[#19382C] text-xs font-bold hover:bg-[#FAF8F5] transition-all inline-flex items-center gap-2 shadow-md"
              >
                <PhoneCall className="w-4 h-4 text-[#244A3C]" />
                <span>Call Tele-MANAS (14416)</span>
              </a>

              <a
                href="tel:112"
                className="px-6 py-3 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all inline-flex items-center gap-2 shadow-md"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Call Emergency (112)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Grounding Exercise Box */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 shadow-sanctuary space-y-4">
          <div className="flex items-center gap-2.5 text-[#19382C]">
            <Sparkles className="w-5 h-5 text-[#D3A075]" />
            <h3 className="text-sm sm:text-base font-serif font-bold">
              Immediate Grounding Exercise: The 5-4-3-2-1 Sensory Technique
            </h3>
          </div>
          <p className="text-xs text-[#535C56] leading-relaxed">
            If you are experiencing panic, dissociation, or acute overwhelm while waiting for a counsellor, gently pause and anchor yourself into the present room:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-center">
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE]">
              <span className="block text-lg font-bold text-[#19382C]">5</span>
              <span className="text-[11px] text-[#535C56]">Things you can <strong>see</strong></span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE]">
              <span className="block text-lg font-bold text-[#19382C]">4</span>
              <span className="text-[11px] text-[#535C56]">Things you can <strong>touch</strong></span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE]">
              <span className="block text-lg font-bold text-[#19382C]">3</span>
              <span className="text-[11px] text-[#535C56]">Things you can <strong>hear</strong></span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE]">
              <span className="block text-lg font-bold text-[#19382C]">2</span>
              <span className="text-[11px] text-[#535C56]">Things you can <strong>smell</strong></span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE] col-span-2 sm:col-span-1">
              <span className="block text-lg font-bold text-[#19382C]">1</span>
              <span className="text-[11px] text-[#535C56]">Deep, slow <strong>breath</strong></span>
            </div>
          </div>
        </div>

        {/* Directory Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#19382C]">
              Verified Helplines Directory
            </h2>
            <p className="text-xs text-[#7D9D8B]">
              Showing {filteredHelplines.length} verified mental health support services across India
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
              />
            </div>

            {/* Language Filter */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="py-2 px-3 rounded-xl border border-[#EAE5DE] text-xs bg-white text-[#19382C] focus:outline-hidden focus:border-[#19382C]"
            >
              <option value="All">All Languages</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
              <option value="Marathi">Marathi</option>
              <option value="Bengali">Bengali</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Kannada">Kannada</option>
            </select>
          </div>
        </div>

        {/* Helpline Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHelplines.map((h, i) => (
            <div
              key={i}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                h.isPrimary
                  ? 'bg-white border-[#19382C]/30 shadow-sanctuary ring-1 ring-[#19382C]/10'
                  : 'bg-white border-[#EAE5DE] shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8EFEA] text-[#19382C]">
                      {h.category}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#19382C] mt-1.5">
                      {h.name}
                    </h3>
                    <p className="text-[11px] text-[#7D9D8B] font-medium">{h.org}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shrink-0">
                    {h.fee}
                  </span>
                </div>

                <p className="text-xs text-[#535C56] leading-relaxed">
                  {h.description}
                </p>

                <div className="space-y-1 text-xs text-[#535C56]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#7D9D8B] shrink-0" />
                    <span>{h.hours}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Languages className="w-3.5 h-3.5 text-[#7D9D8B] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {h.languages.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-[#EAE5DE] mt-4 flex items-center justify-between gap-2">
                <div className="text-xs font-mono font-bold text-[#19382C]">
                  {h.numbers.join(' / ')}
                </div>
                <a
                  href={`tel:${h.primaryCall}`}
                  className="px-4 py-2 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all inline-flex items-center gap-1.5 shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Theraloom Disclaimer Footer */}
        <div className="p-5 rounded-2xl bg-[#E8EFEA] border border-[#D5DDD8] text-xs text-[#535C56] leading-relaxed flex items-center justify-between gap-4">
          <div>
            <strong className="text-[#19382C] block font-semibold mb-0.5">Looking for ongoing therapy?</strong>
            <span>Theraloom connects you with verified private practice psychologists for scheduled therapy.</span>
          </div>
          <Link
            to="/#directory"
            className="px-4 py-2 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-colors shrink-0"
          >
            Find a Therapist
          </Link>
        </div>
      </div>
    </div>
  );
}
