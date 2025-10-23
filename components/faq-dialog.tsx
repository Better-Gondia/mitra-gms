
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';

interface FaqDialogProps {
  item: { q: string; a: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FaqDialog({ item, open, onOpenChange }: FaqDialogProps) {
  if (!item) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="text-primary" />
            {item.q}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-sm text-muted-foreground whitespace-pre-wrap">
          {item.a}
        </div>
      </DialogContent>
    </Dialog>
  );
}
