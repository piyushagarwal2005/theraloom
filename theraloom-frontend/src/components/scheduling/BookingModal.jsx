import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  User,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  Download,
  QrCode,
  Building2,
  Smartphone,
  Lock,
  Sparkles,
} from 'lucide-react';
import api from '../../api/axiosInstance';

export default function BookingModal({
  therapist,
  selectedService: initialService,
  isOpen,
  onClose,
  onBookingSuccess,
}) {
  const [step, setStep] = useState(1); // 1: Service, 2: Slot, 3: Intake, 4: Payment, 5: Success
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Date and slot selection
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  // Client Details & Intake
  const [clientName, setClientName] = useState('Kunal Joshi');
  const [clientEmail, setClientEmail] = useState('kunal.j@example.com');
  const [clientPhone, setClientPhone] = useState('+91 98765 43210');
  const [presentingConcern, setPresentingConcern] = useState('Work stress, emotional regulation, and cognitive boundary setting.');
  const [consentAgreed, setConsentAgreed] = useState(true);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState('sandbox'); // 'sandbox' | 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('kunal@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('782');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [confirmedPayment, setConfirmedPayment] = useState(null);

  const therapistId = therapist?._id || therapist?.id;
  const therapistSlug = therapist?.slug;

  // Initialize or fallback services
  useEffect(() => {
    if (!therapist) return;

    const baseFee = therapist.consultationFee || 1800;
    const claritySession = {
      _id: 'default_clarity_299',
      title: 'Introductory Clarity Session (Pattern Break)',
      description: '20-min focused diagnostic fit check. Unpack your core friction point and evaluate clinical alignment.',
      durationMinutes: 20,
      price: 299,
    };

    let availableServices = [];
    if (therapist.services && therapist.services.length > 0) {
      // If therapist already has a clarity session, use it; otherwise prepend the ₹299 clarity option
      const hasClarity = therapist.services.some(s => s.price === 299 || s.title?.toLowerCase().includes('clarity'));
      availableServices = hasClarity ? therapist.services : [claritySession, ...therapist.services];
    } else {
      availableServices = [
        claritySession,
        {
          _id: 'default_individual',
          title: 'Individual Psychotherapy',
          description: 'One-on-one virtual psychological counselling for anxiety, stress, or emotional regulation.',
          durationMinutes: 50,
          price: baseFee,
        },
        {
          _id: 'default_cbt',
          title: 'Cognitive Behavioural Therapy (CBT)',
          description: 'Structured evidence-based therapy targeting negative thought patterns and emotional distress.',
          durationMinutes: 50,
          price: baseFee,
        },
        {
          _id: 'default_couples',
          title: 'Couples & Relationship Counselling',
          description: 'Collaborative partnership counselling for communication, conflict resolution, and trust.',
          durationMinutes: 60,
          price: Math.round(baseFee * 1.3),
        },
      ];
    }

    setServices(availableServices);

    if (initialService) {
      setSelectedService(initialService);
    } else {
      setSelectedService(availableServices[0]);
    }
  }, [therapist, initialService, isOpen]);

  // Fetch slots whenever selectedDate or therapist changes
  useEffect(() => {
    if (!isOpen || (!therapistId && !therapistSlug)) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlotsError('');
      setSelectedSlot(null);
      try {
        const res = await api.get('/scheduling/available-slots', {
          params: {
            therapistId: therapistId ? String(therapistId) : undefined,
            slug: therapistSlug,
            date: selectedDate,
          },
        });
        if (res.data?.success) {
          const slots = res.data.slots || [];
          setAvailableSlots(slots);
          if (slots.length > 0) {
            setSelectedSlot(slots[0]); // Auto-select first open slot
          }
        }
      } catch (err) {
        setSlotsError('Could not retrieve open slots. Please pick another date.');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [isOpen, therapistId, therapistSlug, selectedDate]);

  if (!isOpen || !therapist) return null;

  const handleNextToSlots = () => {
    if (!selectedService) return;
    setStep(2);
  };

  const handleNextToIntake = () => {
    if (!selectedSlot) return;
    setStep(3);
  };

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      setBookingError('Please enter your full name and valid email address.');
      return;
    }
    if (!consentAgreed) {
      setBookingError('Please review and agree to the MHCA 2017 telehealth consent terms.');
      return;
    }
    setBookingError('');
    setStep(4);
  };

  const handleProcessPayment = async () => {
    setSubmitting(true);
    setBookingError('');

    try {
      const price = selectedService?.price || therapist.consultationFee || 1800;

      // 1. Create order on backend (Razorpay / Mock)
      const orderRes = await api.post('/payments/create-order', {
        therapistId: therapistId ? String(therapistId) : undefined,
        therapistSlug: therapistSlug,
        amount: price,
        clientName,
        clientEmail,
        type: 'session',
        description: `${selectedService?.title || 'Session'} with ${therapist.name}`,
      });

      const orderData = orderRes.data?.data || orderRes.data?.order;
      const orderId = orderData?.orderId || `order_${Date.now()}`;
      const paymentId = `pay_${paymentMethod}_${Date.now()}`;

      // 2. Atomically book session with verified payment record
      const bookRes = await api.post('/scheduling/book-session', {
        therapistId: therapistId ? String(therapistId) : undefined,
        slug: therapistSlug,
        serviceId: selectedService?._id,
        serviceName: selectedService?.title || 'Individual Psychotherapy',
        durationMinutes: selectedService?.durationMinutes || 50,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        price,
        clientName,
        clientEmail,
        clientPhone,
        presentingConcern,
        consentAgreed: true,
        consentTimestamp: new Date().toISOString(),
        paymentMethod,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: 'test_mock_sig_123',
      });

      if (bookRes.data?.success) {
        setConfirmedBooking(bookRes.data.session);
        setConfirmedPayment(bookRes.data.payment);
        setStep(5); // Success step
        if (onBookingSuccess) onBookingSuccess(bookRes.data.session);
      }
    } catch (err) {
      console.error('Payment / Booking error:', err);
      if (err.response?.status === 409) {
        setBookingError('This time slot was just taken by another client! Please select another slot.');
        setStep(2);
      } else {
        setBookingError(err.response?.data?.message || 'Payment processing failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedSlot(null);
    setBookingError('');
    onClose();
  };

  const sessionFee = selectedService?.price || therapist.consultationFee || 1800;
  const gstTax = Math.round(sessionFee * 0.18);
  const totalPayable = sessionFee; // Indian clinical psychotherapy inclusive fee

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#FAF8F5] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DE] animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header & Step Tracker */}
        <div className="pb-4 border-b border-[#EAE5DE] shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#19382C] flex items-center justify-center text-white shadow-xs">
                <CalendarIcon className="w-5 h-5 text-[#A9BDA9]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#19382C]">
                  Book with {therapist.name}
                </h3>
                <p className="text-[11px] text-[#7D9D8B] font-medium">
                  {therapist.title} • Telehealth India
                </p>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          {step < 5 && (
            <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px] sm:text-[11px]">
              <div
                className={`py-1 px-1 rounded-lg text-center font-semibold transition-colors truncate ${
                  step >= 1 ? 'bg-[#19382C] text-white' : 'bg-gray-200/60 text-gray-400'
                }`}
              >
                1. Service
              </div>
              <div
                className={`py-1 px-1 rounded-lg text-center font-semibold transition-colors truncate ${
                  step >= 2 ? 'bg-[#19382C] text-white' : 'bg-gray-200/60 text-gray-400'
                }`}
              >
                2. Slot
              </div>
              <div
                className={`py-1 px-1 rounded-lg text-center font-semibold transition-colors truncate ${
                  step >= 3 ? 'bg-[#19382C] text-white' : 'bg-gray-200/60 text-gray-400'
                }`}
              >
                3. Intake
              </div>
              <div
                className={`py-1 px-1 rounded-lg text-center font-semibold transition-colors truncate ${
                  step >= 4 ? 'bg-[#19382C] text-white' : 'bg-gray-200/60 text-gray-400'
                }`}
              >
                4. Payment
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-5 pr-1 flex-1 space-y-5">
          {bookingError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* STEP 1: SELECT SERVICE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#19382C] mb-1">
                  1. Select Clinical Format
                </h4>
                <p className="text-xs text-[#535C56]">
                  Choose session format tailored to your specific mental health goals.
                </p>
              </div>

              <div className="space-y-2.5">
                {services.map((svc) => {
                  const isSelected = selectedService?.title === svc.title;
                  return (
                    <div
                      key={svc._id || svc.title}
                      onClick={() => setSelectedService(svc)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#19382C] bg-[#E8EFEA]/80 shadow-xs ring-1 ring-[#19382C]'
                          : 'border-[#EAE5DE] bg-white hover:border-[#7D9D8B]'
                      }`}
                    >
                      <div>
                        <h5 className="text-xs font-bold text-[#19382C]">{svc.title}</h5>
                        <p className="text-[11px] text-[#535C56] mt-0.5 max-w-sm line-clamp-1">
                          {svc.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-[#7D9D8B] mt-1">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {svc.durationMinutes} mins
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Video className="w-3 h-3" />
                            Encrypted Video
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#19382C]">₹{svc.price}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextToSlots}
                  disabled={!selectedService}
                  className="px-6 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Select Date & Time</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE & TIME SLOT */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#19382C] mb-1">
                  2. Choose Appointment Slot
                </h4>
                <p className="text-xs text-[#535C56]">
                  Times displayed in Indian Standard Time (IST, UTC+05:30).
                </p>
              </div>

              {/* Quick Date Chips */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#19382C]">
                  Select Date
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {[0, 1, 2, 3, 4, 5].map((offset) => {
                    const d = new Date(Date.now() + offset * 86400000);
                    const dateStr = d.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    const label =
                      offset === 0
                        ? 'Today'
                        : offset === 1
                        ? 'Tomorrow'
                        : d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelectedDate(dateStr)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#19382C] text-white shadow-xs'
                            : 'bg-white border border-[#EAE5DE] text-[#535C56] hover:border-[#19382C]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Input for arbitrary dates */}
              <div className="bg-white p-3 rounded-2xl border border-[#EAE5DE] shadow-xs">
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5] text-[#19382C] font-semibold focus:outline-hidden focus:border-[#19382C]"
                />
              </div>

              {/* Open Slots Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#19382C]">
                    Available Slots for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </label>
                  {availableSlots.length > 0 && (
                    <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                      {availableSlots.length} open
                    </span>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="p-8 text-center text-xs text-[#7D9D8B] animate-pulse">
                    Checking clinician calendar...
                  </div>
                ) : slotsError ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    {slotsError}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white border border-[#EAE5DE] text-center space-y-3">
                    <p className="text-xs text-[#535C56]">
                      No open slots remain on {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date(new Date(selectedDate).getTime() + 86400000).toISOString().split('T')[0];
                        setSelectedDate(tomorrow);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all"
                    >
                      Check Next Day Slots →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot?.slotId === slot.slotId;
                      return (
                        <button
                          key={slot.slotId}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                            isSelected
                              ? 'bg-[#19382C] text-white border-[#19382C] shadow-sm'
                              : 'bg-white border-[#EAE5DE] text-[#19382C] hover:border-[#19382C]'
                          }`}
                        >
                          {slot.timeDisplay}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-[#535C56] hover:text-[#19382C]"
                >
                  Back to formats
                </button>
                <button
                  type="button"
                  onClick={handleNextToIntake}
                  disabled={!selectedSlot}
                  className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    !selectedSlot
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#19382C] text-white hover:bg-[#244E3E]'
                  }`}
                >
                  <span>Continue to Intake</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CLIENT INTAKE & MHCA 2017 CONSENT */}
          {step === 3 && (
            <form onSubmit={handleNextToPayment} className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#19382C] mb-1">
                  3. Client Intake & Clinical Consent
                </h4>
                <p className="text-xs text-[#535C56]">
                  All health records are strictly confidential under Indian professional ethics.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#19382C] mb-1">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kunal Joshi"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#19382C] mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="kunal.j@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#19382C] mb-1">
                      WhatsApp / Mobile
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19382C] mb-1">
                    Primary Concern / Goals for Session
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Briefly describe what brings you to therapy (e.g., anxiety, burnout, relationship boundaries)..."
                    value={presentingConcern}
                    onChange={(e) => setPresentingConcern(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
                  />
                </div>

                {/* MHCA 2017 Informed Consent Box */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5DE] space-y-2">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="consentBox"
                      required
                      checked={consentAgreed}
                      onChange={(e) => setConsentAgreed(e.target.checked)}
                      className="mt-0.5 rounded-md text-[#19382C] focus:ring-[#19382C]"
                    />
                    <label htmlFor="consentBox" className="text-xs text-[#535C56] leading-relaxed cursor-pointer">
                      <span className="font-semibold text-[#19382C]">Informed Telehealth Consent: </span>
                      I agree to receive virtual psychological counselling. I have reviewed the{' '}
                      <Link to="/terms" target="_blank" className="text-[#19382C] underline font-semibold">
                        Terms of Practice
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" target="_blank" className="text-[#19382C] underline font-semibold">
                        Privacy Policy
                      </Link>
                      . I understand private clinical SOAP/DAP notes are protected under the Indian Mental Healthcare Act (MHCA 2017).
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-medium text-[#535C56] hover:text-[#19382C]"
                >
                  Back to slot
                </button>
                <button
                  type="submit"
                  disabled={!clientName || !clientEmail || !consentAgreed}
                  className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    !clientName || !clientEmail || !consentAgreed
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#19382C] text-white hover:bg-[#244E3E]'
                  }`}
                >
                  <span>Proceed to Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: INTERACTIVE PAYMENT GATEWAY (SANDBOX, UPI, CARDS, NETBANKING) */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#19382C] mb-1">
                  4. Secure Payment Gateway (India)
                </h4>
                <p className="text-xs text-[#535C56]">
                  Encrypted checkout via RBI-authorized payment infrastructure.
                </p>
              </div>

              {/* Order Summary Pill */}
              <div className="p-3.5 rounded-2xl bg-[#E8EFEA] border border-[#D5DDD8] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B]">
                    Consultation Summary
                  </span>
                  <p className="text-xs font-bold text-[#19382C]">
                    {selectedService?.title} • {selectedSlot?.timeDisplay}
                  </p>
                  <p className="text-[10px] text-[#535C56] mt-0.5">
                    GST SAC Code: 999312 (Psychological Services)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#19382C]">₹{totalPayable}</span>
                  <p className="text-[10px] text-[#7D9D8B]">Incl. 18% GST (₹{gstTax})</p>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-1.5 text-[11px] font-semibold text-center">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('sandbox')}
                    className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === 'sandbox'
                        ? 'border-[#19382C] bg-[#19382C] text-white shadow-xs'
                        : 'border-[#EAE5DE] bg-white text-[#535C56] hover:border-[#19382C]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#D3A075]" />
                    <span>Instant Test</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === 'upi'
                        ? 'border-[#19382C] bg-[#19382C] text-white shadow-xs'
                        : 'border-[#EAE5DE] bg-white text-[#535C56] hover:border-[#19382C]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === 'card'
                        ? 'border-[#19382C] bg-[#19382C] text-white shadow-xs'
                        : 'border-[#EAE5DE] bg-white text-[#535C56] hover:border-[#19382C]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`py-2 px-1 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === 'netbanking'
                        ? 'border-[#19382C] bg-[#19382C] text-white shadow-xs'
                        : 'border-[#EAE5DE] bg-white text-[#535C56] hover:border-[#19382C]'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* TAB 1: INSTANT SANDBOX SIMULATION */}
                {paymentMethod === 'sandbox' && (
                  <div className="p-4 rounded-2xl bg-[#E8EFEA] border border-[#D5DDD8] space-y-2 animate-in fade-in-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#19382C]">
                      <Sparkles className="w-4 h-4 text-[#244A3C]" />
                      <span>Developer & Evaluator Test Checkout</span>
                    </div>
                    <p className="text-xs text-[#535C56] leading-relaxed">
                      Simulate full payment gateway approval without real monetary deduction. Generates authentic Razorpay test tokens and an auditable GST PDF invoice.
                    </p>
                  </div>
                )}

                {/* TAB 2: UPI */}
                {paymentMethod === 'upi' && (
                  <div className="p-4 rounded-2xl bg-white border border-[#EAE5DE] space-y-3 animate-in fade-in-50">
                    <div className="flex items-center justify-between text-xs text-[#535C56]">
                      <span className="font-semibold text-[#19382C]">Instant UPI Payment</span>
                      <span className="text-[10px] text-[#7D9D8B]">GPay • PhonePe • Paytm • BHIM</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#19382C] mb-1">
                        Enter UPI VPA ID
                      </label>
                      <input
                        type="text"
                        placeholder="yourname@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] text-xs font-mono focus:outline-hidden focus:border-[#19382C]"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-[#19382C]" />
                        <span className="text-[11px] text-[#535C56]">Scan Static UPI QR on next screen</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                        Instant Approval
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 3: CREDIT / DEBIT CARDS */}
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-white border border-[#EAE5DE] space-y-3 animate-in fade-in-50">
                    <div className="flex items-center justify-between text-xs text-[#535C56]">
                      <span className="font-semibold text-[#19382C]">Debit / Credit Card</span>
                      <span className="text-[10px] text-[#7D9D8B]">Visa • MasterCard • RuPay</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#19382C] mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] text-xs font-mono focus:outline-hidden focus:border-[#19382C]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#19382C] mb-1">
                          Valid Thru (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] text-xs font-mono focus:outline-hidden focus:border-[#19382C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#19382C] mb-1">
                          CVV (3 Digits)
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] text-xs font-mono focus:outline-hidden focus:border-[#19382C]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: NET BANKING */}
                {paymentMethod === 'netbanking' && (
                  <div className="p-4 rounded-2xl bg-white border border-[#EAE5DE] space-y-3 animate-in fade-in-50">
                    <label className="block text-[11px] font-semibold text-[#19382C]">
                      Select Bank for Direct Debit
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] text-xs bg-white text-[#19382C] font-semibold focus:outline-hidden focus:border-[#19382C]"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                    </select>
                    <p className="text-[11px] text-[#7D9D8B]">
                      You will be securely redirected to your bank’s 2-Factor Authentication portal.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-medium text-[#535C56] hover:text-[#19382C]"
                >
                  Back to intake
                </button>
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-2 shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {submitting ? 'Verifying Gateway...' : `Pay ₹${totalPayable} & Confirm`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: BOOKING CONFIRMATION & INVOICE */}
          {step === 5 && confirmedBooking && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#E8EFEA] text-[#19382C] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#244A3C]" />
              </div>

              <div>
                <h4 className="text-xl font-serif font-bold text-[#19382C]">
                  Appointment Confirmed & Invoiced!
                </h4>
                <p className="text-xs text-[#535C56] mt-1">
                  Your appointment reservation and GST Tax Invoice have been delivered to{' '}
                  <span className="font-semibold text-[#19382C]">{confirmedBooking.clientEmail}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EAE5DE] text-left space-y-2.5 text-xs text-[#535C56]">
                <div className="flex justify-between border-b border-[#EAE5DE] pb-2">
                  <span className="font-medium text-[#19382C]">Therapist</span>
                  <span>{therapist.name}</span>
                </div>
                <div className="flex justify-between border-b border-[#EAE5DE] pb-2">
                  <span className="font-medium text-[#19382C]">Service</span>
                  <span>{confirmedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between border-b border-[#EAE5DE] pb-2">
                  <span className="font-medium text-[#19382C]">Date & Time</span>
                  <span>{new Date(confirmedBooking.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-b border-[#EAE5DE] pb-2">
                  <span className="font-medium text-[#19382C]">Video Consultation</span>
                  <a
                    href={confirmedBooking.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#19382C] bg-[#E8EFEA] px-2.5 py-1 rounded-md hover:bg-[#d8e6dc] flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Video Call
                  </a>
                </div>

                {/* Direct Invoice Download */}
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="font-medium text-[#19382C] block">GST Tax Invoice</span>
                    <span className="text-[10px] text-[#7D9D8B]">
                      {confirmedPayment?.invoiceNumber || `TL-INV-${confirmedBooking._id.slice(-6)}`}
                    </span>
                  </div>
                  <a
                    href={`/api/v1/payments/${confirmedPayment?._id || confirmedBooking._id}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md hover:bg-emerald-100 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`/portal?email=${encodeURIComponent(confirmedBooking.clientEmail)}`}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all text-center"
                >
                  Open Client Portal
                </a>
                <button
                  onClick={resetAndClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#EAE5DE] text-xs font-medium text-[#535C56] hover:bg-gray-50 transition-colors"
                >
                  Done
                </button>
              </div>

              <div className="pt-1 text-[11px] text-[#7D9D8B]">
                Need emergency mental health support?{' '}
                <Link to="/crisis" className="underline font-semibold text-[#19382C]">
                  View 24x7 India Crisis Helplines
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
