import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  Lock,
  Share2,
  FileText,
  Sparkles,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#FAF8F5] border-b border-[#EAE5DE] text-[#535C56]">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-md hover:bg-white hover:text-[#19382C] transition-colors ${
          editor.isActive('bold') ? 'bg-white text-[#19382C] shadow-xs' : ''
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-md hover:bg-white hover:text-[#19382C] transition-colors ${
          editor.isActive('italic') ? 'bg-white text-[#19382C] shadow-xs' : ''
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <div className="h-4 w-px bg-[#EAE5DE] mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-md hover:bg-white hover:text-[#19382C] transition-colors ${
          editor.isActive('heading', { level: 1 }) ? 'bg-white text-[#19382C] shadow-xs' : ''
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-md hover:bg-white hover:text-[#19382C] transition-colors ${
          editor.isActive('heading', { level: 2 }) ? 'bg-white text-[#19382C] shadow-xs' : ''
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <div className="h-4 w-px bg-[#EAE5DE] mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-md hover:bg-white hover:text-[#19382C] transition-colors ${
          editor.isActive('bulletList') ? 'bg-white text-[#19382C] shadow-xs' : ''
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-md hover:bg-white hover:text-[#19382C] transition-colors ${
          editor.isActive('orderedList') ? 'bg-white text-[#19382C] shadow-xs' : ''
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-md hover:bg-white hover:text-[#19382C] transition-colors ${
          editor.isActive('blockquote') ? 'bg-white text-[#19382C] shadow-xs' : ''
        }`}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <div className="h-4 w-px bg-[#EAE5DE] mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded-md hover:bg-white hover:text-[#19382C] disabled:opacity-40 transition-colors"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded-md hover:bg-white hover:text-[#19382C] disabled:opacity-40 transition-colors"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function NoteEditor({
  clients = [],
  sessions = [],
  initialNote = null,
  onSave,
  onCancel,
  hasAdvancedTemplates = true,
  onRequestUpgrade,
}) {
  const [title, setTitle] = useState(initialNote?.title || 'Session Progress Note');
  const [selectedClientId, setSelectedClientId] = useState(initialNote?.clientId || (clients[0]?._id || ''));
  const [selectedSessionId, setSelectedSessionId] = useState(initialNote?.sessionId || '');
  
  // Security Default: ALWAYS default to 'private'
  const [noteType, setNoteType] = useState(initialNote?.noteType || 'private');
  const [format, setFormat] = useState(initialNote?.format || 'freeform');

  // Structured SOAP State
  const [soapData, setSoapData] = useState(
    initialNote?.soapData || { subjective: '', objective: '', assessment: '', plan: '' }
  );

  // Structured DAP State
  const [dapData, setDapData] = useState(
    initialNote?.dapData || { data: '', assessment: '', plan: '' }
  );

  const [saving, setSaving] = useState(false);

  // TipTap Freeform Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialNote?.content || '<p>Record clinical observations, patient affect, interventions, and homework assignments...</p>',
  });

  const handleFormatChange = (newFormat) => {
    if (newFormat !== 'freeform' && !hasAdvancedTemplates) {
      if (onRequestUpgrade) {
        onRequestUpgrade(
          'advanced_note_templates',
          'Structured SOAP & DAP Notes Gated',
          'Evidence-based SOAP and DAP templates are included with Growth and Unlimited plans.'
        );
      }
      return;
    }
    setFormat(newFormat);
  };

  const handleSaveNote = async () => {
    if (!selectedClientId) {
      alert('Please select a client for this note.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        clientId: selectedClientId,
        sessionId: selectedSessionId || null,
        noteType, // 'private' or 'shared'
        format, // 'freeform' | 'SOAP' | 'DAP'
        content: editor ? editor.getHTML() : '',
        soapData: format === 'SOAP' ? soapData : undefined,
        dapData: format === 'DAP' ? dapData : undefined,
      };

      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EAE5DE] shadow-xs overflow-hidden">
      {/* Top Config Bar */}
      <div className="p-4 sm:p-5 border-b border-[#EAE5DE] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title (e.g., Session 4: Cognitive Restructuring)"
            className="text-base font-bold text-[#19382C] border-none focus:outline-hidden focus:ring-0 p-0 placeholder:text-gray-400 w-full"
          />

          {/* Privacy Toggle: Critical Security Element */}
          <div className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#EAE5DE] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setNoteType('private')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                noteType === 'private'
                  ? 'bg-[#19382C] text-white shadow-xs'
                  : 'text-[#535C56] hover:text-[#19382C]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Private (Therapist Only)</span>
            </button>
            <button
              type="button"
              onClick={() => setNoteType('shared')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                noteType === 'shared'
                  ? 'bg-[#7D9D8B] text-white shadow-xs'
                  : 'text-[#535C56] hover:text-[#19382C]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Shared with Client</span>
            </button>
          </div>
        </div>

        {/* Association Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-[#19382C] mb-1">Associate with Client *</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5] text-[#1F2421] focus:outline-hidden focus:border-[#19382C]"
            >
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#19382C] mb-1">Session Association (Optional)</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#EAE5DE] bg-[#FAF8F5] text-[#1F2421] focus:outline-hidden focus:border-[#19382C]"
            >
              <option value="">No specific session</option>
              {sessions.map((s) => (
                <option key={s._id} value={s._id}>
                  {new Date(s.startTime).toLocaleDateString()} - {s.serviceName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Note Template Format Selector */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#EAE5DE]">
          <span className="text-xs font-semibold text-[#535C56] mr-1">Documentation Format:</span>
          <button
            type="button"
            onClick={() => handleFormatChange('freeform')}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
              format === 'freeform'
                ? 'bg-[#19382C] text-white border-[#19382C]'
                : 'bg-white text-[#535C56] border-[#EAE5DE] hover:border-[#7D9D8B]'
            }`}
          >
            Freeform Rich Text
          </button>
          <button
            type="button"
            onClick={() => handleFormatChange('SOAP')}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              format === 'SOAP'
                ? 'bg-[#19382C] text-white border-[#19382C]'
                : 'bg-white text-[#535C56] border-[#EAE5DE] hover:border-[#7D9D8B]'
            }`}
          >
            <span>SOAP Framework</span>
            {!hasAdvancedTemplates && <Sparkles className="w-3 h-3 text-amber-500" />}
          </button>
          <button
            type="button"
            onClick={() => handleFormatChange('DAP')}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              format === 'DAP'
                ? 'bg-[#19382C] text-white border-[#19382C]'
                : 'bg-white text-[#535C56] border-[#EAE5DE] hover:border-[#7D9D8B]'
            }`}
          >
            <span>DAP Framework</span>
            {!hasAdvancedTemplates && <Sparkles className="w-3 h-3 text-amber-500" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {format === 'freeform' && (
        <div className="divide-y divide-[#EAE5DE]">
          <MenuBar editor={editor} />
          <div className="p-4 sm:p-5">
            <EditorContent editor={editor} className="tiptap prose prose-sm max-w-none text-[#1F2421]" />
          </div>
        </div>
      )}

      {/* SOAP Structured Fields */}
      {format === 'SOAP' && (
        <div className="p-4 sm:p-5 space-y-4 bg-[#FAF8F5]/50">
          <div>
            <label className="block text-xs font-bold text-[#19382C] uppercase tracking-wide mb-1">
              S — Subjective (Client's self-report, symptoms & mood)
            </label>
            <textarea
              rows="2"
              value={soapData.subjective}
              onChange={(e) => setSoapData({ ...soapData, subjective: e.target.value })}
              placeholder="e.g. Client reports heightened anxiety in social meetings (6/10)..."
              className="w-full p-3 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#19382C] uppercase tracking-wide mb-1">
              O — Objective (Therapist's clinical observations, affect, speech)
            </label>
            <textarea
              rows="2"
              value={soapData.objective}
              onChange={(e) => setSoapData({ ...soapData, objective: e.target.value })}
              placeholder="e.g. Well-groomed, oriented x3, rapid speech initially, calmed with paced breathing..."
              className="w-full p-3 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#19382C] uppercase tracking-wide mb-1">
              A — Assessment (Clinical impressions, response to interventions)
            </label>
            <textarea
              rows="2"
              value={soapData.assessment}
              onChange={(e) => setSoapData({ ...soapData, assessment: e.target.value })}
              placeholder="e.g. Receptive to cognitive re-framing; progress in identifying automatic negative thoughts..."
              className="w-full p-3 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#19382C] uppercase tracking-wide mb-1">
              P — Plan (Treatment plan modifications, homework, next session date)
            </label>
            <textarea
              rows="2"
              value={soapData.plan}
              onChange={(e) => setSoapData({ ...soapData, plan: e.target.value })}
              placeholder="e.g. Thought-record diary for next 7 days. Next session scheduled for next Thursday..."
              className="w-full p-3 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
            />
          </div>
        </div>
      )}

      {/* DAP Structured Fields */}
      {format === 'DAP' && (
        <div className="p-4 sm:p-5 space-y-4 bg-[#FAF8F5]/50">
          <div>
            <label className="block text-xs font-bold text-[#19382C] uppercase tracking-wide mb-1">
              D — Data (Subjective and objective session information)
            </label>
            <textarea
              rows="3"
              value={dapData.data}
              onChange={(e) => setDapData({ ...dapData, data: e.target.value })}
              placeholder="Record both what the client reported and what was clinically observed during session..."
              className="w-full p-3 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#19382C] uppercase tracking-wide mb-1">
              A — Assessment (Clinical evaluation of progress and barriers)
            </label>
            <textarea
              rows="2"
              value={dapData.assessment}
              onChange={(e) => setDapData({ ...dapData, assessment: e.target.value })}
              placeholder="Therapist assessment of therapeutic progress and behavioral dynamics..."
              className="w-full p-3 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#19382C] uppercase tracking-wide mb-1">
              P — Plan (Actions, assignments, follow-up)
            </label>
            <textarea
              rows="2"
              value={dapData.plan}
              onChange={(e) => setDapData({ ...dapData, plan: e.target.value })}
              placeholder="Interventions planned and next appointment timing..."
              className="w-full p-3 rounded-xl border border-[#EAE5DE] text-xs bg-white focus:outline-hidden focus:border-[#19382C]"
            />
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE5DE] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#535C56]">
          {noteType === 'private' ? (
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <Lock className="w-3.5 h-3.5" />
              Private: Protected from client portal & shared APIs
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <Share2 className="w-3.5 h-3.5" />
              Shared: Visible to client in their portal
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#535C56] hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#19382C] text-white text-xs font-semibold hover:bg-[#244E3E] transition-all flex items-center gap-2 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving Note...' : 'Save Clinical Note'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
