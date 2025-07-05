import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Sparkles } from 'lucide-react';
import { useHelp } from '@/contexts/HelpContext';

interface HelpButtonProps {
  variant?: 'fab' | 'header' | 'sidebar';
  showProgress?: boolean;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ 
  variant = 'header', 
  showProgress = false 
}) => {
  const { openHelp, getCompletionRate, isFirstTime } = useHelp();
  const completionRate = getCompletionRate();

  if (variant === 'fab') {
    return (
      <div className="fixed bottom-24 right-6 z-40 lg:bottom-6">
        <Button
          onClick={openHelp}
          className="fab shadow-xl hover:shadow-2xl group"
          size="lg"
        >
          <HelpCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          {isFirstTime && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
        {showProgress && completionRate > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs px-2 py-1"
          >
            {completionRate}%
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <Button
        onClick={openHelp}
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Ajuda</span>
        {isFirstTime && (
          <Sparkles className="h-3 w-3 text-primary ml-auto animate-pulse" />
        )}
      </Button>
    );
  }

  // Header variant (default)
  return (
    <Button
      onClick={openHelp}
      variant="outline"
      size="sm"
      className="relative gap-2 hover:bg-primary/10 hover:border-primary/30"
    >
      <HelpCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Ajuda</span>
      {isFirstTime && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
      )}
      {showProgress && completionRate > 0 && (
        <Badge 
          variant="secondary" 
          className="ml-2 bg-primary/10 text-primary text-xs px-1.5 py-0.5"
        >
          {completionRate}%
        </Badge>
      )}
    </Button>
  );
};