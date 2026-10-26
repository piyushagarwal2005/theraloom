import React, { useState, useEffect } from 'react';
import {
  User,
  Link as LinkIcon,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Globe,
  Award,
  MapPin,
  Phone,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/common/Avatar';
import api from '../../api/axiosInstance';

export default function Settings() {
  const { therapist, updateTherapist } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    qualifications: '',
    bio: '',
    location: '',
    phone: '',
    experienceYears: 5,
    consultationFee: 1800,
    customSlug: '',
    specializations: [],
    languages: [],
    services: [],
  });

  const [newSpec, setNewSpec] = useState('');
  const [newLang, setNewLang] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Service creation modal
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    durationMinutes: 50,
    price: 1800,
  });

  useEffect(() => {
    if (therapist) {
      setFormData({
        name: therapist.name || '',
        title: therapist.title || '',
        qualifications: therapist.qualifications || '',
        bio: therapist.bio || '',
        location: therapist.location || '',
        phone: therapist.phone || '',
        experienceYears: therapist.experienceYears || 5,
        consultationFee: therapist.consultationFee || 1800,
        customSlug: therapist.slug || '',
        specializations: therapist.specializations || ['Anxiety', 'Depression', 'Stress Management'],
        languages: therapist.languages || ['English', 'Hindi'],
        services: therapist.services || [],
      });
    }
  }, [therapist]);

  const handleAddSpec = () => {
    if (!newSpec.trim()) return;
    if (!formData.specializations.includes(newSpec.trim())) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, newSpec.trim()],
      });
    }
    setNewSpec('');
  };

  const handleRemoveSpec = (specToRemove) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter((s) => s !== specToRemove),
    });
  };

  const handleAddLang = () => {
    if (!newLang.trim()) return;
    if (!formData.languages.includes(newLang.trim())) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLang.trim()],
      });
    }
    setNewLang('');
  };

  const handleRemoveLang = (langToRemove) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((l) => l !== langToRemove),
    });
  };

  const handleAddService = () => {
    if (!newService.title.trim()) return;
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        {
          ...newService,
          durationMinutes: Number(newService.durationMinutes) || 50,
          price: Number(newService.price) || 1800,
        },
      ],
    });
    setNewService({ title: '', description: '', durationMinutes: 50, price: 1800 });
  };

  const handleRemoveService = (index) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.put('/therapists/profile', {
        name: formData.name,
        title: formData.title,
        qualifications: formData.qualifications,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        experienceYears: Number(formData.experienceYears),
        consultationFee: Number(formData.consultationFee),
        customSlug: formData.customSlug,
        specializations: formData.specializations,
        languages: formData.languages,
        services: formData.services,
      });

      if (res.data?.success) {
        updateTherapist(res.data.therapist);
        setSuccessMsg('Your practice profile and public booking settings have been saved!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save practice settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
            Practice Settings
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19382C]">
            Profile & Consultation Services
          </h1>
          <p className="text-xs text-[#535C56]">
            Manage your public presentation, branded URL slug, offered consultation formats, and fees.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Branded Link & Slug */}
          <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#19382C]">
              Your Branded Public URL
            </h2>
            <p className="text-xs text-[#535C56]">
              This is the unique link you share with clients and on your professional credentials.
            </p>

            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs">
              <span className="font-mono text-[#7D9D8B]">theraloom.in/</span>
              <input
                type="text"
                value={formData.customSlug}
                onChange={(e) => setFormData({ ...formData, customSlug: e.target.value })}
                className="font-mono font-bold text-[#19382C] bg-transparent focus:outline-hidden flex-1"
              />
            </div>
          </div>

          {/* Practitioner Core Info */}
          <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#19382C]">
              Practitioner Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#19382C] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#19382C] mb-1">Professional Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#19382C] mb-1">Qualifications & Degrees</label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#19382C] mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#19382C] mb-1">Location / Practice City</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#19382C] mb-1">Practice Mobile / WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#19382C] text-xs mb-1">Clinical Biography</label>
              <textarea
                rows="4"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-3.5 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5] leading-relaxed"
              />
            </div>
          </div>

          {/* Specializations & Languages */}
          <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#19382C]">
                Clinical Specializations & Languages
              </h2>
              <p className="text-xs text-[#535C56]">
                Helps clients filter and find your practice based on presenting concerns.
              </p>
            </div>

            {/* Specializations */}
            <div className="space-y-3">
              <label className="block font-semibold text-[#19382C] text-xs">Clinical Specializations</label>
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs text-[#19382C]"
                  >
                    <span>{spec}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(spec)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="e.g. PTSD, OCD, Trauma"
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5]"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="px-3.5 py-1.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-3 pt-3 border-t border-[#EAE5DE]">
              <label className="block font-semibold text-[#19382C] text-xs">Consultation Languages</label>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] text-xs text-[#19382C]"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLang(lang)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="e.g. Bengali, Marathi, Tamil"
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5]"
                />
                <button
                  type="button"
                  onClick={handleAddLang}
                  className="px-3.5 py-1.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Consultation Services & Fees */}
          <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#19382C]">
                  Consultation Services & Durations
                </h2>
                <p className="text-xs text-[#535C56]">
                  Configure session formats clients can book from your public link.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {formData.services.map((svc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-[#EAE5DE] bg-[#FAF8F5] flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#19382C]">{svc.title}</h4>
                    <p className="text-[11px] text-[#535C56] mt-0.5">{svc.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#7D9D8B]">
                      <span>{svc.durationMinutes} mins</span>
                      <span>•</span>
                      <span>₹{svc.price} INR</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Service Box */}
            <div className="p-4 rounded-2xl bg-white border border-dashed border-[#7D9D8B] space-y-3">
              <h4 className="text-xs font-bold text-[#19382C]">Add Another Consultation Service</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <input
                    type="text"
                    placeholder="Service Name (e.g. Couples Counseling)"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>
                <div>
                  <select
                    value={newService.durationMinutes}
                    onChange={(e) => setNewService({ ...newService, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="50">50 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Fee in INR (e.g. 2200)"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-4 py-2 rounded-xl bg-[#19382C] text-white text-xs font-semibold"
                >
                  Add Service
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Practice Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
