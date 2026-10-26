import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import api from '../../api/axiosInstance';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Schedule() {
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'availability' | 'blocked'
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Availability Config State
  const [availability, setAvailability] = useState(null);
  const [savingAvail, setSavingAvail] = useState(false);
  const [availSavedMsg, setAvailSavedMsg] = useState('');

  // Blocked Date input
  const [newBlockedDate, setNewBlockedDate] = useState('');

  // Fetch booked sessions
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await api.get('/scheduling/sessions');
      if (res.data?.success) {
        setSessions(res.data.sessions || []);
      }
    } catch (err) {
      console.warn('Failed to fetch sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Fetch availability config
  const fetchAvailability = async () => {
    try {
      const res = await api.get('/scheduling/availability');
      if (res.data?.success) {
        setAvailability(res.data.availability);
      }
    } catch (err) {
      console.warn('Failed to fetch availability:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchAvailability();
  }, []);

  const handleUpdateStatus = async (sessionId, newStatus) => {
    try {
      const res = await api.put(`/scheduling/sessions/${sessionId}/status`, { status: newStatus });
      if (res.data?.success) {
        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? { ...s, status: newStatus } : s))
        );
      }
    } catch (err) {
      alert('Failed to update session status.');
    }
  };

  const handleWeeklyToggle = (dayOfWeek) => {
    if (!availability) return;
    const schedule = [...(availability.weeklySchedule || [])];
    const index = schedule.findIndex((d) => d.dayOfWeek === dayOfWeek);

    if (index >= 0) {
      schedule[index] = {
        ...schedule[index],
        isAvailable: !schedule[index].isAvailable,
      };
    } else {
      schedule.push({
        dayOfWeek,
        isAvailable: true,
        timeSlots: [{ startTime: '10:00', endTime: '18:00' }],
      });
    }

    setAvailability({ ...availability, weeklySchedule: schedule });
  };

  const handleTimeSlotChange = (dayOfWeek, field, value) => {
    if (!availability) return;
    const schedule = [...(availability.weeklySchedule || [])];
    const index = schedule.findIndex((d) => d.dayOfWeek === dayOfWeek);

    if (index >= 0) {
      const slots = [...schedule[index].timeSlots];
      if (slots.length > 0) {
        slots[0] = { ...slots[0], [field]: value };
        schedule[index].timeSlots = slots;
      }
      setAvailability({ ...availability, weeklySchedule: schedule });
    }
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate) return;
    const current = availability?.blockedDates || [];
    if (!current.includes(newBlockedDate)) {
      setAvailability({
        ...availability,
        blockedDates: [...current, newBlockedDate],
      });
    }
    setNewBlockedDate('');
  };

  const handleRemoveBlockedDate = (dateToRemove) => {
    const current = availability?.blockedDates || [];
    setAvailability({
      ...availability,
      blockedDates: current.filter((d) => d !== dateToRemove),
    });
  };

  const handleSaveAvailability = async () => {
    setSavingAvail(true);
    setAvailSavedMsg('');
    try {
      const res = await api.put('/scheduling/availability', {
        weeklySchedule: availability.weeklySchedule,
        slotDuration: Number(availability.slotDuration) || 50,
        bufferTimeMinutes: Number(availability.bufferTimeMinutes) || 10,
        blockedDates: availability.blockedDates,
      });

      if (res.data?.success) {
        setAvailSavedMsg('Availability template & buffer settings updated successfully!');
        setTimeout(() => setAvailSavedMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to save availability settings.');
    } finally {
      setSavingAvail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
              Scheduling System
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19382C]">
              Appointment Calendar & Hours
            </h1>
            <p className="text-xs text-[#535C56]">
              Set weekly recurring hours, manage buffer times, and launch encrypted telehealth consultations.
            </p>
          </div>

          {/* Tab Pill Buttons */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-[#EAE5DE] shadow-xs">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-[#19382C] text-white shadow-xs'
                  : 'text-[#535C56] hover:text-[#19382C]'
              }`}
            >
              Session Agenda ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'availability'
                  ? 'bg-[#19382C] text-white shadow-xs'
                  : 'text-[#535C56] hover:text-[#19382C]'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'blocked'
                  ? 'bg-[#19382C] text-white shadow-xs'
                  : 'text-[#535C56] hover:text-[#19382C]'
              }`}
            >
              Blocked Dates ({availability?.blockedDates?.length || 0})
            </button>
          </div>
        </div>

        {availSavedMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{availSavedMsg}</span>
          </div>
        )}

        {/* TAB 1: SESSIONS CALENDAR / AGENDA */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            {loadingSessions ? (
              <div className="bg-white rounded-3xl p-12 text-center text-xs text-[#7D9D8B] animate-pulse">
                Loading practice sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE5DE] space-y-2">
                <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-[#19382C]">No Appointments Scheduled</h3>
                <p className="text-xs text-[#535C56]">
                  When clients book slots through your public link, appointments will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((s) => (
                  <div
                    key={s._id}
                    className="bg-white rounded-2xl border border-[#EAE5DE] p-5 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D9D8B]">
                          {s.serviceName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            s.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : s.status === 'completed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : s.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {s.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <Avatar name={s.clientName} size="md" />
                        <div>
                          <h3 className="text-sm font-bold text-[#19382C]">{s.clientName}</h3>
                          <p className="text-xs text-[#535C56]">{s.clientEmail}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs text-[#535C56] space-y-1">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-[#7D9D8B]" />
                          <span>
                            {new Date(s.startTime).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#7D9D8B]" />
                          <span>
                            {new Date(s.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(s.endTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            (IST)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#EAE5DE] space-y-2">
                      <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center justify-center gap-2 shadow-2xs"
                      >
                        <Video className="w-3.5 h-3.5 text-[#A9BDA9]" />
                        <span>Launch Telehealth Video</span>
                      </a>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        {s.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(s._id, 'completed')}
                            className="text-[11px] font-semibold text-emerald-700 hover:underline"
                          >
                            Mark Completed
                          </button>
                        )}
                        {s.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(s._id, 'cancelled')}
                            className="text-[11px] font-semibold text-rose-600 hover:underline"
                          >
                            Cancel Session
                          </button>
                        )}
                        {s.status !== 'no_show' && (
                          <button
                            onClick={() => handleUpdateStatus(s._id, 'no_show')}
                            className="text-[11px] font-semibold text-amber-700 hover:underline"
                          >
                            Mark No-Show
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WEEKLY AVAILABILITY CONFIG */}
        {activeTab === 'availability' && availability && (
          <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 space-y-6 shadow-xs max-w-4xl">
            <div>
              <h2 className="text-base font-bold text-[#19382C]">
                Weekly Working Hours
              </h2>
              <p className="text-xs text-[#535C56]">
                Configure when clients can book therapy slots. Times are in Indian Standard Time (IST).
              </p>
            </div>

            {/* Durations & Buffers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs">
              <div>
                <label className="block font-semibold text-[#19382C] mb-1">
                  Default Session Duration (Minutes)
                </label>
                <select
                  value={availability.slotDuration || 50}
                  onChange={(e) =>
                    setAvailability({ ...availability, slotDuration: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] bg-white text-[#1F2421]"
                >
                  <option value="30">30 minutes (Check-in / Brief)</option>
                  <option value="45">45 minutes</option>
                  <option value="50">50 minutes (Standard Clinical Hour)</option>
                  <option value="60">60 minutes (In-depth Psychotherapy)</option>
                  <option value="90">90 minutes (Couples / Extended)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#19382C] mb-1">
                  Buffer Time Between Sessions (Minutes)
                </label>
                <select
                  value={availability.bufferTimeMinutes || 10}
                  onChange={(e) =>
                    setAvailability({ ...availability, bufferTimeMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] bg-white text-[#1F2421]"
                >
                  <option value="0">0 minutes (No buffer)</option>
                  <option value="10">10 minutes (Notes & transition)</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                </select>
              </div>
            </div>

            {/* Days Schedule */}
            <div className="divide-y divide-[#EAE5DE] border-t border-b border-[#EAE5DE]">
              {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
                const dayConfig = availability.weeklySchedule?.find((w) => w.dayOfWeek === dayOfWeek);
                const isAvail = dayConfig ? dayConfig.isAvailable : false;
                const slot = dayConfig?.timeSlots?.[0] || { startTime: '10:00', endTime: '18:00' };

                return (
                  <div key={dayOfWeek} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 w-36">
                      <input
                        type="checkbox"
                        checked={isAvail}
                        onChange={() => handleWeeklyToggle(dayOfWeek)}
                        className="rounded-md text-[#19382C] focus:ring-[#19382C]"
                      />
                      <span className={`font-semibold ${isAvail ? 'text-[#19382C]' : 'text-gray-400'}`}>
                        {DAY_NAMES[dayOfWeek]}
                      </span>
                    </div>

                    {isAvail ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeSlotChange(dayOfWeek, 'startTime', e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#EAE5DE] bg-[#FAF8F5]"
                        />
                        <span className="text-[#535C56]">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeSlotChange(dayOfWeek, 'endTime', e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#EAE5DE] bg-[#FAF8F5]"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveAvailability}
                disabled={savingAvail}
                className="px-6 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{savingAvail ? 'Saving...' : 'Save Availability'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: BLOCKED DATES & VACATION */}
        {activeTab === 'blocked' && (
          <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 space-y-6 shadow-xs max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-[#19382C]">
                Blocked Dates & Out of Office
              </h2>
              <p className="text-xs text-[#535C56]">
                Slots will not be generated on blocked dates. Useful for holidays, conferences, and personal time off.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5]"
              />
              <button
                type="button"
                onClick={handleAddBlockedDate}
                disabled={!newBlockedDate}
                className="px-4 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all"
              >
                Block Date
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#19382C]">Currently Blocked Dates:</h4>
              {(availability?.blockedDates || []).length === 0 ? (
                <p className="text-xs text-[#7D9D8B] italic">No dates blocked.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availability.blockedDates.map((d) => (
                    <div
                      key={d}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs text-[#19382C]"
                    >
                      <span>{d}</span>
                      <button
                        onClick={() => handleRemoveBlockedDate(d)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#EAE5DE]">
              <button
                type="button"
                onClick={handleSaveAvailability}
                disabled={savingAvail}
                className="px-6 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E]"
              >
                {savingAvail ? 'Saving...' : 'Save Blocked Dates'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
