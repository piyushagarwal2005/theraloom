import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export const useEntitlement = () => {
  const { therapist, refreshTherapist } = useAuth();
  const [modalState, setModalState] = useState({
    isOpen: false,
    featureKey: '',
    title: '',
    reason: '',
  });

  const checkFeatureAccess = useCallback(
    async (featureKey) => {
      if (!therapist) return { allowed: false, reason: 'Not authenticated' };

      try {
        const res = await api.get(`/tiers/check/${featureKey}`);
        if (res.data?.success) {
          return res.data.access;
        }
      } catch (err) {
        if (err.response?.data?.code === 'TIER_LIMIT_REACHED') {
          return {
            allowed: false,
            reason: err.response.data.message,
            maxAllowed: err.response.data.maxAllowed,
            currentCount: err.response.data.currentCount,
          };
        }
      }
      return { allowed: true };
    },
    [therapist]
  );

  const promptUpgrade = (featureKey, customTitle, customReason) => {
    let title = customTitle || 'Upgrade Your Practice Plan';
    let reason = customReason;

    if (!reason) {
      switch (featureKey) {
        case 'active_clients_limit':
          title = 'Active Client Capacity Reached';
          reason = 'You have reached the client limit for the Starter plan. Upgrade to the Growth tier to manage up to 30 active clients.';
          break;
        case 'advanced_note_templates':
          title = 'Structured Clinical Documentation (SOAP & DAP)';
          reason = 'Evidence-based SOAP and DAP note templates are available on Growth and Unlimited plans.';
          break;
        case 'advanced_analytics':
          title = 'Deep Practice Analytics & Forecasting';
          reason = 'Advanced metrics, including real-time no-show rates and client retention forecasting, are available on the Growth plan.';
          break;
        default:
          reason = 'This premium feature is restricted to the Growth and Unlimited tiers.';
      }
    }

    setModalState({
      isOpen: true,
      featureKey,
      title,
      reason,
    });
  };

  const closeUpgradeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    tierKey: therapist?.subscription?.tierKey || 'starter',
    checkFeatureAccess,
    promptUpgrade,
    modalState,
    closeUpgradeModal,
    refreshTherapist,
  };
};
