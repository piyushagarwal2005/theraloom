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
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import BookingModal from '../../components/scheduling/BookingModal';
import api from '../../api/axiosInstance';

export default function TherapistProfile() {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
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
        const res = await api.get(`/therapists/public/${slug}`);
        if (res.data?.success) {
          setTherapist(res.data.therapist);
          if (res.data.therapist.services?.length > 0) {
            setSelectedService(res.data.therapist.services[0]);
          }
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
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#EAE5DE] text-center space-y-4 shadow-xs">
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
    <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar
                src={therapist.profileImage}
                name={therapist.name}
                size="2xl"
                className="border-4 border-[#FAF8F5] shadow-md shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19382C]">
                    {therapist.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#E8EFEA] text-[#19382C] px-2.5 py-0.5 rounded-full border border-[#D5DDD8]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#244A3C]" />
                    Verified Practitioner
                  </span>
                </div>

                <p className="text-sm font-medium text-[#7D9D8B]">{therapist.title}</p>
                <p className="text-xs text-[#535C56]">{therapist.qualifications}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#535C56] pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#7D9D8B]" />
                    {therapist.location || 'Available Online (All India)'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#7D9D8B]" />
                    {therapist.languages?.join(', ') || 'English, Hindi'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#7D9D8B]" />
                    {therapist.experienceYears || 5}+ Years Clinical Experience
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action / Share */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => setBookingModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-[#19382C] text-white text-sm font-semibold hover:bg-[#244E3E] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs font-medium text-[#535C56] hover:text-[#19382C] hover:bg-[#F4EFEB] transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Share Profile Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid: Bio & Services */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Biography & Approach */}
          <div className="lg:col-span-7 space-y-6">
            {/* About */}
            <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-base font-bold text-[#19382C] uppercase tracking-wider text-xs">
                About the Practitioner
              </h2>
              <div className="text-xs sm:text-sm text-[#535C56] leading-relaxed whitespace-pre-line">
                {therapist.bio || 'Compassionate and evidence-based psychotherapy tailored to individual life transitions and mental health challenges.'}
              </div>
            </div>

            {/* Specializations & Modalities */}
            <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-base font-bold text-[#19382C] uppercase tracking-wider text-xs">
                Clinical Focus & Areas of Practice
              </h2>
              <div className="flex flex-wrap gap-2">
                {(therapist.specializations || ['Anxiety', 'Depression', 'Stress Management']).map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs font-medium text-[#19382C]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Confidentiality & Legal Notice under MHCA 2017 */}
            <div className="bg-[#E8EFEA] rounded-2xl border border-[#D5DDD8] p-5 space-y-2 text-xs text-[#19382C]">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#244A3C]" />
                <span>Ethical Confidentiality & Telehealth Standards</span>
              </div>
              <p className="text-[11px] text-[#535C56] leading-relaxed">
                Therapy sessions are strictly confidential in accordance with the Mental Healthcare Act 2017 and clinical psychology ethics. Clinical private documentation is encrypted and never shared without patient consent.
              </p>
            </div>
          </div>

          {/* Right Column: Available Services & Booking Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#19382C]">
                  Consultation Services
                </h2>
                <span className="text-[11px] text-[#7D9D8B] font-semibold">
                  Select a session format
                </span>
              </div>

              <div className="space-y-3">
                {(therapist.services || [
                  {
                    title: 'Individual Psychotherapy',
                    description: 'One-on-one telehealth session for anxiety, depression, or personal growth.',
                    durationMinutes: 50,
                    price: therapist.consultationFee || 1800,
                  },
                ]).map((svc) => (
                  <div
                    key={svc._id || svc.title}
                    className="p-4 rounded-2xl border border-[#EAE5DE] bg-[#FAF8F5] hover:border-[#7D9D8B] hover:bg-white transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#19382C] group-hover:text-[#244E3E]">
                          {svc.title}
                        </h3>
                        <p className="text-xs text-[#535C56] mt-0.5 line-clamp-2">
                          {svc.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-sm font-bold text-[#19382C]">₹{svc.price}</span>
                        <p className="text-[10px] text-[#7D9D8B]">INR</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EAE5DE] text-xs">
                      <div className="flex items-center gap-3 text-[#7D9D8B]">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          {svc.durationMinutes} mins
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Video className="w-3.5 h-3.5" />
                          Telehealth
                        </span>
                      </div>

                      <button
                        onClick={() => handleBookService(svc)}
                        className="px-3 py-1.5 rounded-lg bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-colors flex items-center gap-1"
                      >
                        <span>Select</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Consultation Fee Summary */}
              <div className="pt-2 text-center text-xs text-[#535C56]">
                Questions before booking?{' '}
                <a
                  href={`mailto:${therapist.email}`}
                  className="text-[#19382C] font-semibold underline hover:text-[#244E3E]"
                >
                  Contact Practitioner
                </a>
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
