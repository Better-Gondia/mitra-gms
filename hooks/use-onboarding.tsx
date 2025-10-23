
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ONBOARDING_STORAGE_KEY = 'app-onboarding-completed';

type OnboardingContextType = {
  hasCompletedOnboarding: boolean;
  showWelcome: boolean;
  finishOnboarding: () => void;
  startOnboarding: () => void;
  // We will add more state and functions here to manage tour steps
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
      setHasCompletedOnboarding(hasCompleted);
      if (!hasCompleted) {
        setShowWelcome(true);
      }
    } catch (error) {
      console.error("Could not read from localStorage", error);
      // Default to completed if localStorage is unavailable
      setHasCompletedOnboarding(true);
    }
  }, []);

  const finishOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      setHasCompletedOnboarding(true);
      setShowWelcome(false);
    } catch (error) {
       console.error("Could not write to localStorage", error);
    }
  }, []);

  const startOnboarding = useCallback(() => {
     try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      setHasCompletedOnboarding(false);
      setShowWelcome(true);
    } catch (error) {
       console.error("Could not write to localStorage", error);
    }
  }, []);


  const value = useMemo(() => ({
    hasCompletedOnboarding,
    showWelcome,
    finishOnboarding,
    startOnboarding,
  }), [hasCompletedOnboarding, showWelcome, finishOnboarding, startOnboarding]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
