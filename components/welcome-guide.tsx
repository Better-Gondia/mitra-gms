
'use client';

import React from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Rocket, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function WelcomeGuide() {
  const { t } = useLanguage();
  const { showWelcome, finishOnboarding } = useOnboarding();

  const handleStartTour = () => {
    // In a real implementation, this would trigger the first step of the tour.
    // For now, it will just dismiss the modal.
    console.log("Starting interactive tour...");
    finishOnboarding(); // We'll replace this later with tour logic
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  return (
    <Dialog open={showWelcome} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="bg-primary/10 p-3 rounded-full mb-4 inline-block">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">{t('welcome_title')}</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            {t('welcome_desc')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-4">
          <Button type="button" variant="outline" onClick={handleSkip} className="w-full">
            {t('explore_on_my_own')}
          </Button>
          <Button type="button" onClick={handleStartTour} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {t('quick_tour_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

