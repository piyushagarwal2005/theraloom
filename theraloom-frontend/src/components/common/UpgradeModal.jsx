import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, X, ArrowRight, ShieldAlert } from 'lucide-react';

export default function UpgradeModal({ isOpen, onClose, title, reason, featureKey }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    onClose();
    navigate('/dashboard/subscription');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DE] animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8EFEA] flex items-center justify-center text-[#19382C]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
              Practice Plan Entitlement
            </span>
            <h3 className="text-lg font-bold text-[#19382C]">
              {title || 'Feature Restricted on Current Plan'}
            </h3>
          </div>
        </div>

        <p className="text-sm text-[#535C56] mb-6 leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE5DE]">
          {reason || 'This feature is part of our advanced practice suite. Upgrade your tier to unlock complete functionality.'}
        </p>

        {/* Feature Comparison highlight */}
        <div className="space-y-2.5 mb-6">
          <p className="text-xs font-semibold text-[#1F2421] uppercase tracking-wide">
            Included in Growth & Unlimited Tiers:
          </p>
          <div className="flex items-center gap-2 text-xs text-[#535C56]">
            <Check className="w-4 h-4 text-[#244A3C] shrink-0" />
            <span>Expanded active client capacity (30+ clients)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#535C56]">
            <Check className="w-4 h-4 text-[#244A3C] shrink-0" />
            <span>Structured SOAP & DAP clinical note templates</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#535C56]">
            <Check className="w-4 h-4 text-[#244A3C] shrink-0" />
            <span>Deep business analytics, no-show rate tracking & multi-year trends</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#535C56]">
            <Check className="w-4 h-4 text-[#244A3C] shrink-0" />
            <span>Multi-session packages (3, 6, 12 sessions) and automated GST invoices</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE5DE]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#535C56] hover:bg-[#F4EFEB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgradeClick}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#19382C] text-white hover:bg-[#244E3E] transition-all shadow-sm flex items-center gap-2 group"
          >
            <span>View Subscription Plans</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
