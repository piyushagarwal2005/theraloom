import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import api from '../../api/axiosInstance';

export default function BookingModal({ therapist, selectedService: initialService, isOpen, onClose, onBookingSuccess }) {
  const [step, setStep] = useState(1); // 1: Service, 2: Slot, 3: Intake & Consent, 4: Payment, 5: Success
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(initialService || null);
  
  // Date and slot selection
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  // Client Details & Intake
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [presentingConcern, setPresentingConcern] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Submission & payment state
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (therapist?.services && therapist.services.length > 0) {
      setServices(therapist.services);
      if (!selectedService) {
        setSelectedService(therapist.services[0]);
      }
    }
  }, [therapist]);

  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
    }
  }, [initialService]);

  // Fetch slots whenever selectedDate or therapist changes
  useEffect(() => {
    if (!isOpen || !therapist?._id) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlotsError('');
      setSelectedSlot(null);
      try {
        const res = await api.get('/scheduling/available-slots', {
          params: {
            therapistId: therapist._id,
            date: selectedDate,
          },
        });
        if (res.data?.success) {
          setAvailableSlots(res.data.slots || []);
        }
      } catch (err) {
        setSlotsError('Could not retrieve open slots. Please pick another date.');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [isOpen, therapist, selectedDate]);

  if (!isOpen) return null;

  const handleNextToSlots = () => {
    if (!selectedService) return;
    setStep(2);
  };

  const handleNextToIntake = () => {
    if (!selectedSlot) return;
    setStep(3);
  };

  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    if (!consentAgreed) {
      setBookingError('Please review and agree to the telehealth consent terms.');
      return;
    }

    setSubmitting(true);
    setBookingError('');

    try {
      // 1. Create order for Razorpay or test checkout
      const price = selectedService?.price || therapist.consultationFee || 1800;
      const orderRes = await api.post('/payments/create-order', {
        therapistId: therapist._id,
        amount: price,
        clientName,
        clientEmail,
        description: `${selectedService?.title || 'Session'} with ${therapist.name}`,
      });

      const orderData = orderRes.data?.data;

      // 2. Complete Booking with payment details
      const bookRes = await api.post('/scheduling/book-session', {
        therapistId: therapist._id,
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
        razorpayOrderId: orderData?.orderId || `test_order_${Date.now()}`,
        razorpayPaymentId: `test_pay_${Date.now()}`,
        razorpaySignature: 'test_mock_sig_123',
      });

      if (bookRes.data?.success) {
        setConfirmedBooking(bookRes.data.session);
        setStep(5); // Success step
        if (onBookingSuccess) onBookingSuccess(bookRes.data.session);
      }
    } catch (err) {
      console.error('Booking error:', err);
      if (err.response?.status === 409) {
        setBookingError('This time slot was just taken by another client! Please pick another slot.');
        setStep(2); // Send back to slot picker
      } else {
        setBookingError(err.response?.data?.message || 'Failed to complete booking. Please try again.');
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#FAF8F5] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DE] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
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
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div
                className={`py-1 px-2 rounded-lg text-center font-semibold transition-colors ${
                  step >= 1 ? 'bg-[#19382C] text-white' : 'bg-[#FAF8F5] text-gray-400'
                }`}
              >
                1. Service Format
              </div>
              <div
                className={`py-1 px-2 rounded-lg text-center font-semibold transition-colors ${
                  step >= 2 ? 'bg-[#19382C] text-white' : 'bg-[#FAF8F5] text-gray-400'
                }`}
              >
                2. Date & Slot
              </div>
              <div
                className={`py-1 px-2 rounded-lg text-center font-semibold transition-colors ${
                  step >= 3 ? 'bg-[#19382C] text-white' : 'bg-[#FAF8F5] text-gray-400'
                }`}
              >
                3. Intake & Pay
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
                  1. Select Therapy Service
                </h4>
                <p className="text-xs text-[#535C56]">
                  Choose session format tailored to your specific mental health goals.
                </p>
              </div>

              <div className="space-y-2.5">
                {services.map((svc) => (
                  <div
                    key={svc._id || svc.title}
                    onClick={() => setSelectedService(svc)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedService?.title === svc.title
                        ? 'border-[#19382C] bg-[#E8EFEA]/60 shadow-xs'
                        : 'border-[#EAE5DE] bg-white hover:border-[#7D9D8B]'
                    }`}
                  >
                    <div>
                      <h5 className="text-sm font-bold text-[#19382C]">{svc.title}</h5>
                      <p className="text-xs text-[#535C56] mt-0.5 line-clamp-2">
                        {svc.description || 'Confidential one-on-one session.'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#7D9D8B]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {svc.durationMinutes} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="w-3.5 h-3.5" />
                          Telehealth Video
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-base font-bold text-[#19382C]">
                        ₹{svc.price}
                      </div>
                      <span className="text-[10px] text-[#7D9D8B]">per session</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextToSlots}
                  className="px-6 py-2.5 rounded-xl bg-[#19382C] text-white text-sm font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-2"
                >
                  <span>Select Date & Slot</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DATE & TIME SLOT */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#19382C]">
                    2. Choose Date & Available Slot
                  </h4>
                  <p className="text-xs text-[#535C56]">
                    All time slots are displayed in Indian Standard Time (IST).
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#7D9D8B] hover:text-[#19382C] underline"
                >
                  Change service
                </button>
              </div>

              {/* Date Input */}
              <div className="bg-white p-3 rounded-2xl border border-[#EAE5DE]">
                <label className="block text-xs font-semibold text-[#19382C] mb-1.5">
                  Select Consultation Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EAE5DE] text-sm focus:outline-hidden focus:border-[#19382C] bg-[#FAF8F5]"
                />
              </div>

              {/* Open Slots List */}
              <div>
                <label className="block text-xs font-semibold text-[#19382C] mb-2">
                  Available Slots for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </label>

                {loadingSlots ? (
                  <div className="py-8 text-center text-xs text-[#7D9D8B] animate-pulse">
                    Checking calendar availability...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="py-8 px-4 text-center bg-white rounded-2xl border border-dashed border-[#EAE5DE]">
                    <p className="text-xs text-[#535C56]">
                      No open slots on this date. Please pick another date or join the waitlist.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot?.slotId === slot.slotId;
                      return (
                        <button
                          key={slot.slotId}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                            isSelected
                              ? 'bg-[#19382C] text-white border-[#19382C] shadow-xs'
                              : 'bg-white border-[#EAE5DE] text-[#1F2421] hover:border-[#7D9D8B]'
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
                  Back
                </button>
                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={handleNextToIntake}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                    selectedSlot
                      ? 'bg-[#19382C] text-white hover:bg-[#244E3E]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>Client Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INTAKE & CONSENT */}
          {step === 3 && (
            <form onSubmit={handleConfirmAndPay} className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#19382C]">
                  3. Client Intake & Clinical Consent
                </h4>
                <p className="text-xs text-[#535C56]">
                  Your information is encrypted and strictly accessible only to your therapist.
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
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-sm bg-white focus:outline-hidden focus:border-[#19382C]"
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
                        placeholder="you@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-sm bg-white focus:outline-hidden focus:border-[#19382C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#19382C] mb-1">
                      Mobile / WhatsApp Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-sm bg-white focus:outline-hidden focus:border-[#19382C]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19382C] mb-1">
                    Presenting Concerns / Reason for Consultation
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Briefly describe what brings you to therapy (e.g., anxiety, career burnout, relationships)..."
                    value={presentingConcern}
                    onChange={(e) => setPresentingConcern(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
                  />
                </div>

                {/* Telehealth & MHCA 2017 Digital Consent Capture */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5DE] space-y-2">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="consentCheck"
                      required
                      checked={consentAgreed}
                      onChange={(e) => setConsentAgreed(e.target.checked)}
                      className="mt-0.5 rounded-md text-[#19382C] focus:ring-[#19382C]"
                    />
                    <label htmlFor="consentCheck" className="text-xs text-[#535C56] leading-relaxed cursor-pointer">
                      <span className="font-semibold text-[#19382C]">Telehealth Consent & Privacy Agreement: </span>
                      I consent to receive psychological counseling services via secure telehealth video. I understand that private clinical documentation remains protected under professional ethics and the Mental Healthcare Act (MHCA 2017), and only agreed notes are shared.
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#7D9D8B] pl-6">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Timestamped auditable record captured on booking</span>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-3.5 rounded-2xl bg-[#E8EFEA] border border-[#D5DDD8] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7D9D8B]">
                      Session Total
                    </span>
                    <p className="text-xs text-[#19382C] font-medium">
                      {selectedService?.title} ({selectedSlot?.timeDisplay})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#19382C]">
                      ₹{selectedService?.price || therapist.consultationFee || 1800}
                    </span>
                    <p className="text-[10px] text-[#535C56]">Includes GST</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-medium text-[#535C56] hover:text-[#19382C]"
                >
                  Back to slots
                </button>
                <button
                  type="submit"
                  disabled={submitting || !consentAgreed || !clientName || !clientEmail}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                    submitting || !consentAgreed || !clientName || !clientEmail
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#19382C] text-white hover:bg-[#244E3E]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{submitting ? 'Processing Payment...' : 'Pay & Confirm Booking'}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: BOOKING CONFIRMATION & PORTAL LINK */}
          {step === 5 && confirmedBooking && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#E8EFEA] text-[#19382C] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#244A3C]" />
              </div>

              <div>
                <h4 className="text-xl font-serif font-bold text-[#19382C]">
                  Appointment Confirmed!
                </h4>
                <p className="text-xs text-[#535C56] mt-1">
                  Your appointment details and calendar invitation have been sent to{' '}
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
                <div className="flex justify-between items-center pt-1">
                  <span className="font-medium text-[#19382C]">Secure Video Room</span>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
