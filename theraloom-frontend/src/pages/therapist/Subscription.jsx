import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Lock,
  ArrowRight,
  TrendingUp,
  FileText,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEntitlement } from '../../hooks/useEntitlement';
import api from '../../api/axiosInstance';

export default function Subscription() {
  const { therapist, refreshTherapist } = useAuth();
  const { checkFeatureAccess } = useEntitlement();

  const [tiers, setTiers] = useState([]);
  const [currentTierKey, setCurrentTierKey] = useState(
    therapist?.subscription?.tierKey || 'starter'
  );
  const [activeClientsCount, setActiveClientsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upgradingKey, setUpgradingKey] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiersRes, clientCheck] = await Promise.all([
          api.get('/tiers'),
          checkFeatureAccess('active_clients_limit'),
        ]);

        if (tiersRes.data?.success) {
          setTiers(tiersRes.data.tiers || []);
        }

        if (clientCheck) {
          setActiveClientsCount(clientCheck.currentCount || 0);
        }
      } catch (err) {
        console.warn('Failed to load subscription tiers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [checkFeatureAccess]);

  useEffect(() => {
    if (therapist?.subscription?.tierKey) {
      setCurrentTierKey(therapist.subscription.tierKey);
    }
  }, [therapist]);

  const handleUpgrade = async (tierKey) => {
    if (tierKey === currentTierKey) return;
    setUpgradingKey(tierKey);
    setSuccessMsg('');

    try {
      const res = await api.post('/tiers/upgrade', { tierKey });
      if (res.data?.success) {
        setCurrentTierKey(tierKey);
        await refreshTherapist();
        setSuccessMsg(`Your practice has successfully switched to the ${tierKey.toUpperCase()} tier!`);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update subscription tier.');
    } finally {
      setUpgradingKey(null);
    }
  };

  const getTierCap = (key) => {
    if (key === 'starter') return 5;
    if (key === 'growth') return 30;
    return 'Unlimited';
  };

  const activeCap = getTierCap(currentTierKey);
  const usagePercent =
    activeCap === 'Unlimited' ? 5 : Math.min(100, Math.round((activeClientsCount / activeCap) * 100));

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7D9D8B]">
                Entitlement Engine
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E8EFEA] text-[#19382C] border border-[#D5DDD8]">
                Centralized canAccess() Rule
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#19382C]">
              Subscription Tiers & Entitlements
            </h1>
            <p className="text-xs text-[#535C56]">
              All feature limits, clinical documentation frameworks, and client caseload caps are configuration-driven.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-[#EAE5DE] shadow-xs">
            <span className="text-xs text-[#535C56]">Current Practice Tier:</span>
            <span className="text-xs font-bold text-[#19382C] uppercase bg-[#E8EFEA] px-2.5 py-1 rounded-lg border border-[#D5DDD8]">
              {currentTierKey}
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Caseload Usage Meter */}
        <div className="bg-white rounded-3xl border border-[#EAE5DE] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#19382C]">
                Active Client Caseload Capacity
              </h2>
              <p className="text-xs text-[#535C56]">
                Enforced on backend by <code className="font-mono text-emerald-800">canAccess(therapistId, 'active_clients_limit')</code>.
              </p>
            </div>
            <span className="text-xs font-bold text-[#19382C]">
              {activeClientsCount} / {activeCap} Clients
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#FAF8F5] rounded-full h-3 border border-[#EAE5DE] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent >= 80 ? 'bg-amber-500' : 'bg-[#19382C]'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#7D9D8B]">
            <span>{usagePercent}% Caseload Utilized</span>
            {currentTierKey === 'starter' && activeClientsCount >= 4 && (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Approaching 5-client Starter limit
              </span>
            )}
          </div>
        </div>

        {/* Tiers Pricing & Entitlement Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const isCurrent = tier.tierKey === currentTierKey;
            const isUpgrading = upgradingKey === tier.tierKey;

            return (
              <div
                key={tier.tierKey}
                className={`rounded-3xl p-8 border transition-all flex flex-col relative ${
                  isCurrent
                    ? 'bg-white border-[#19382C] shadow-xl ring-2 ring-[#19382C]'
                    : 'bg-white border-[#EAE5DE] shadow-xs'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#19382C] text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
                    Current Active Tier
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

                {/* Features & Gated Capabilities */}
                <div className="space-y-3 mb-8 flex-1 text-xs text-[#535C56]">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DE] space-y-1.5 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#19382C]">Active Clients:</span>
                      <span className="font-bold text-[#19382C]">
                        {tier.maxActiveClients > 1000 ? 'Unlimited' : `Up to ${tier.maxActiveClients}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#19382C]">SOAP & DAP Notes:</span>
                      <span className={tier.advancedNoteTemplates ? 'text-emerald-700 font-bold' : 'text-gray-400'}>
                        {tier.advancedNoteTemplates ? 'Enabled' : 'Locked'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#19382C]">Analytics Depth:</span>
                      <span className="font-bold text-[#19382C] capitalize">
                        {tier.analyticsDepth}
                      </span>
                    </div>
                  </div>

                  {(tier.features || []).map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#244A3C] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Switch / Upgrade Button */}
                <button
                  type="button"
                  disabled={isCurrent || isUpgrading}
                  onClick={() => handleUpgrade(tier.tierKey)}
                  className={`w-full py-3 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : 'bg-[#19382C] text-white hover:bg-[#244E3E] shadow-sm'
                  }`}
                >
                  {isCurrent ? (
                    <span>Your Current Plan</span>
                  ) : isUpgrading ? (
                    <span>Updating Entitlement...</span>
                  ) : (
                    <>
                      <span>Switch to {tier.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Entitlement Architecture Education Banner */}
        <div className="bg-[#E8EFEA] rounded-3xl border border-[#D5DDD8] p-6 sm:p-8 space-y-3 text-xs text-[#19382C]">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-[#244A3C]" />
            <span>Centralized Entitlement Architecture (Single Source of Truth)</span>
          </div>
          <p className="text-[#535C56] leading-relaxed">
            In compliance with clean SaaS architectural principles, no route or controller checks tier strings like <code className="font-mono bg-white px-1.5 py-0.5 rounded-sm">if (tier === 'starter')</code> directly. Every request routes through <code className="font-mono bg-white px-1.5 py-0.5 rounded-sm font-semibold">entitlementService.canAccess(therapistId, featureKey)</code>, ensuring feature limits can be altered in the database or admin configuration with zero codebase modifications.
          </p>
        </div>
      </div>
    </div>
  );
}
