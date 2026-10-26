import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Lock,
  Share2,
  Trash2,
  Edit3,
  Search,
  Filter,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Calendar,
  User,
  CheckCircle2,
} from 'lucide-react';
import NoteEditor from '../../components/notes/NoteEditor';
import UpgradeModal from '../../components/common/UpgradeModal';
import { useAuth } from '../../context/AuthContext';
import { useEntitlement } from '../../hooks/useEntitlement';
import api from '../../api/axiosInstance';

export default function Notes() {
  const { therapist } = useAuth();
  const { checkFeatureAccess } = useEntitlement();

  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterClientId, setFilterClientId] = useState('');
  const [filterType, setFilterType] = useState(''); // 'private' | 'shared'
  const [search, setSearch] = useState('');

  // Editor Modal/Panel
  const [isComposing, setIsComposing] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [hasAdvancedTemplates, setHasAdvancedTemplates] = useState(false);

  // Upgrade Modal
  const [upgradeModal, setUpgradeModal] = useState({
    isOpen: false,
    title: '',
    reason: '',
  });

  const fetchNotesAndClients = async () => {
    setLoading(true);
    try {
      const [notesRes, clientsRes, sessionsRes, templateCheck] = await Promise.all([
        api.get('/notes', {
          params: {
            clientId: filterClientId || undefined,
            noteType: filterType || undefined,
          },
        }),
        api.get('/clients'),
        api.get('/scheduling/sessions'),
        checkFeatureAccess('advanced_note_templates'),
      ]);

      if (notesRes.data?.success) {
        setNotes(notesRes.data.notes || []);
      }
      if (clientsRes.data?.success) {
        setClients(clientsRes.data.clients || []);
      }
      if (sessionsRes.data?.success) {
        setSessions(sessionsRes.data.sessions || []);
      }
      setHasAdvancedTemplates(Boolean(templateCheck?.allowed));
    } catch (err) {
      console.warn('Failed to load clinical notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesAndClients();
  }, [filterClientId, filterType]);

  const handleSaveNote = async (payload) => {
    try {
      if (editingNote) {
        const res = await api.put(`/notes/${editingNote._id}`, payload);
        if (res.data?.success) {
          setNotes((prev) =>
            prev.map((n) => (n._id === editingNote._id ? res.data.note : n))
          );
        }
      } else {
        const res = await api.post('/notes', payload);
        if (res.data?.success) {
          setNotes((prev) => [res.data.note, ...prev]);
        }
      }
      setIsComposing(false);
      setEditingNote(null);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === 'TIER_LIMIT_REACHED') {
        setUpgradeModal({
          isOpen: true,
          title: 'Structured Note Templates Gated',
          reason: err.response.data.message || 'SOAP & DAP notes require Growth or Unlimited plans.',
        });
      } else {
        alert(err.response?.data?.message || 'Failed to save note.');
      }
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this clinical documentation note?')) {
      return;
    }
    try {
      const res = await api.delete(`/notes/${noteId}`);
      if (res.data?.success) {
        setNotes((prev) => prev.filter((n) => n._id !== noteId));
      }
    } catch (err) {
      alert('Failed to delete note.');
    }
  };

  const handleTogglePrivacy = async (note) => {
    const newType = note.noteType === 'private' ? 'shared' : 'private';
    const confirmMsg =
      newType === 'shared'
        ? 'Share this clinical note with the client in their portal? (Clients will be able to see treatment takeaways and homework).'
        : 'Make this note private? (It will be immediately removed from the client portal).';

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.put(`/notes/${note._id}`, { noteType: newType });
      if (res.data?.success) {
        setNotes((prev) =>
          prev.map((n) => (n._id === note._id ? res.data.note : n))
        );
      }
    } catch (err) {
      alert('Failed to update note privacy.');
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      n.title?.toLowerCase().includes(term) ||
      n.clientId?.name?.toLowerCase().includes(term) ||
      n.content?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
                Clinical Documentation Suite
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E8EFEA] text-[#19382C] border border-[#D5DDD8]">
                {hasAdvancedTemplates ? 'SOAP & DAP Unlocked' : 'Starter Tier (Freeform)'}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19382C]">
              Session & Clinical Notes
            </h1>
            <p className="text-xs text-[#535C56]">
              Secure rich-text and structured SOAP/DAP notes. Defaults strictly to private with zero client leakage.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingNote(null);
              setIsComposing(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Clinical Note</span>
          </button>
        </div>

        {/* Note Composer Modal/Drawer */}
        {isComposing && (
          <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE5DE] mb-4">
              <h2 className="text-base font-bold text-[#19382C]">
                {editingNote ? 'Edit Clinical Documentation' : 'New Clinical Progress Note'}
              </h2>
              <button
                onClick={() => {
                  setIsComposing(false);
                  setEditingNote(null);
                }}
                className="text-xs text-[#535C56] hover:text-[#19382C]"
              >
                Close Editor
              </button>
            </div>

            <NoteEditor
              clients={clients}
              sessions={sessions}
              initialNote={editingNote}
              hasAdvancedTemplates={hasAdvancedTemplates}
              onSave={handleSaveNote}
              onCancel={() => {
                setIsComposing(false);
                setEditingNote(null);
              }}
              onRequestUpgrade={(key, title, reason) => {
                setUpgradeModal({ isOpen: true, title, reason });
              }}
            />
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#EAE5DE] shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search notes by title, client, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5] focus:outline-hidden focus:border-[#19382C]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <select
              value={filterClientId}
              onChange={(e) => setFilterClientId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5] text-[#1F2421]"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#EAE5DE] text-xs bg-[#FAF8F5] text-[#1F2421]"
            >
              <option value="">All Types (Private & Shared)</option>
              <option value="private">Private Only (Protected)</option>
              <option value="shared">Shared with Client</option>
            </select>
          </div>
        </div>

        {/* Notes Grid / List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-xs text-[#7D9D8B] animate-pulse">
              Loading clinical notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE5DE] space-y-2">
              <FileText className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-[#19382C]">No Notes Recorded</h3>
              <p className="text-xs text-[#535C56]">
                Click "Compose Clinical Note" to record session takeaways, observations, or SOAP summaries.
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const client = note.clientId;
              const isPrivate = note.noteType === 'private';

              return (
                <div
                  key={note._id}
                  className="bg-white rounded-2xl border border-[#EAE5DE] p-5 sm:p-6 shadow-xs space-y-4 hover:border-[#7D9D8B] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DE]">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPrivate ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isPrivate ? <Lock className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#19382C]">{note.title}</h3>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isPrivate
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isPrivate ? 'Private' : 'Shared with Client'}
                          </span>
                          <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            {note.format}
                          </span>
                        </div>
                        <p className="text-xs text-[#535C56]">
                          Client: <span className="font-semibold text-[#19382C]">{client?.name || 'Unassigned'}</span>{' '}
                          • Created {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleTogglePrivacy(note)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                          isPrivate
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        }`}
                        title={isPrivate ? 'Share note with client' : 'Make note strictly private'}
                      >
                        {isPrivate ? <Share2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isPrivate ? 'Share' : 'Make Private'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingNote(note);
                          setIsComposing(true);
                        }}
                        className="p-1.5 rounded-lg border border-[#EAE5DE] text-[#535C56] hover:text-[#19382C] hover:bg-[#FAF8F5]"
                        title="Edit note"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="p-1.5 rounded-lg border border-[#EAE5DE] text-[#535C56] hover:text-red-600 hover:bg-red-50"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Note Content Display */}
                  {note.format === 'SOAP' && note.soapData && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE5DE]">
                      <div>
                        <span className="font-bold text-[#19382C] uppercase text-[10px]">
                          S — Subjective
                        </span>
                        <p className="text-[#535C56] mt-0.5">{note.soapData.subjective || '—'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-[#19382C] uppercase text-[10px]">
                          O — Objective
                        </span>
                        <p className="text-[#535C56] mt-0.5">{note.soapData.objective || '—'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-[#19382C] uppercase text-[10px]">
                          A — Assessment
                        </span>
                        <p className="text-[#535C56] mt-0.5">{note.soapData.assessment || '—'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-[#19382C] uppercase text-[10px]">
                          P — Plan
                        </span>
                        <p className="text-[#535C56] mt-0.5">{note.soapData.plan || '—'}</p>
                      </div>
                    </div>
                  )}

                  {note.format === 'DAP' && note.dapData && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE5DE]">
                      <div>
                        <span className="font-bold text-[#19382C] uppercase text-[10px]">
                          D — Data
                        </span>
                        <p className="text-[#535C56] mt-0.5">{note.dapData.data || '—'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-[#19382C] uppercase text-[10px]">
                          A — Assessment
                        </span>
                        <p className="text-[#535C56] mt-0.5">{note.dapData.assessment || '—'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-[#19382C] uppercase text-[10px]">
                          P — Plan
                        </span>
                        <p className="text-[#535C56] mt-0.5">{note.dapData.plan || '—'}</p>
                      </div>
                    </div>
                  )}

                  {note.content && (
                    <div
                      className="text-xs text-[#1F2421] leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={upgradeModal.isOpen}
          onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
          title={upgradeModal.title}
          reason={upgradeModal.reason}
          featureKey="advanced_note_templates"
        />
      </div>
    </div>
  );
}
