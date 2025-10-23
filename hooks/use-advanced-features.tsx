

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ADVANCED_FEATURES_STORAGE_KEY = 'advanced-features-settings';

const defaultFeatures = {
  enableAIAttentionScore: false,
  enableAdvancedFilters: false,
  enableAiSummary: false,
  enableAdvancedColumns: false,
  enableStaleFilter: false,
  enableRoleAndAnalyticsViews: false,
};

type FeatureKeys = keyof typeof defaultFeatures;

type AdvancedFeaturesContextType = {
  features: typeof defaultFeatures;
  setFeatureEnabled: (feature: FeatureKeys, enabled: boolean) => void;
  toggleAllFeatures: () => void;
  areAllFeaturesEnabled: () => boolean;
};

const AdvancedFeaturesContext = createContext<AdvancedFeaturesContextType | undefined>(undefined);

export function AdvancedFeaturesProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState(defaultFeatures);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem(ADVANCED_FEATURES_STORAGE_KEY);
      if (storedState) {
        setFeatures(prev => ({ ...defaultFeatures, ...JSON.parse(storedState) }));
      }
    } catch (error) {
      console.error("Could not read advanced features state from localStorage", error);
    }
  }, []);

  const setFeatureEnabled = useCallback((feature: FeatureKeys, enabled: boolean) => {
    setFeatures(prev => {
      const newState = { ...prev, [feature]: enabled };
      try {
        localStorage.setItem(ADVANCED_FEATURES_STORAGE_KEY, JSON.stringify(newState));
      } catch (error) {
        console.error("Could not write advanced features state to localStorage", error);
      }
      return newState;
    });
  }, []);

  const areAllFeaturesEnabled = useCallback(() => {
    return Object.values(features).every(Boolean);
  }, [features]);

  const toggleAllFeatures = useCallback(() => {
    const shouldEnableAll = !areAllFeaturesEnabled();
    const newState = { ...features };
    for (const key in newState) {
      newState[key as FeatureKeys] = shouldEnableAll;
    }
    setFeatures(newState);
    try {
      localStorage.setItem(ADVANCED_FEATURES_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Could not write advanced features state to localStorage", error);
    }
  }, [features, areAllFeaturesEnabled]);

  const value = useMemo(() => ({
    features,
    setFeatureEnabled,
    toggleAllFeatures,
    areAllFeaturesEnabled,
  }), [features, setFeatureEnabled, toggleAllFeatures, areAllFeaturesEnabled]);

  return (
    <AdvancedFeaturesContext.Provider value={value}>
      {children}
    </AdvancedFeaturesContext.Provider>
  );
}

export function useAdvancedFeatures() {
  const context = useContext(AdvancedFeaturesContext);
  if (context === undefined) {
    throw new Error('useAdvancedFeatures must be used within an AdvancedFeaturesProvider');
  }
  return context;
}
