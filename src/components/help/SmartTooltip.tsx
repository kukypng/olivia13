import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, Play } from 'lucide-react';
import { useHelp } from '@/contexts/HelpContext';

interface SmartTooltipProps {
  children: React.ReactNode;
  content: string;
  title?: string;
  tourId?: string;
  showOnce?: boolean;
  delay?: number;
  className?: string;
  triggerOnFirstVisit?: boolean;
  actionButton?: {
    label: string;
    action: () => void;
  };
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  children,
  content,
  title,
  tourId,
  showOnce = false,
  delay = 0,
  className = '',
  triggerOnFirstVisit = true,
  actionButton
}) => {
  const { showHints, startTour } = useHelp();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!showHints) return;
    
    if (showOnce) {
      const key = `tooltip-shown-${title || content}`;
      const shown = localStorage.getItem(key);
      if (shown) {
        setHasBeenShown(true);
        return;
      }
    }

    // Only show on first interaction if triggerOnFirstVisit is true
    if (triggerOnFirstVisit && !hasInteracted) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [showHints, showOnce, title, content, delay, triggerOnFirstVisit, hasInteracted]);

  // Track first interaction
  const handleFirstInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      if (!triggerOnFirstVisit && showHints) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (showOnce) {
      const key = `tooltip-shown-${title || content}`;
      localStorage.setItem(key, 'true');
      setHasBeenShown(true);
    }
  };

  const handleStartTour = () => {
    if (tourId) {
      startTour(tourId);
      handleDismiss();
    }
  };

  if (!showHints || (showOnce && hasBeenShown)) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={isVisible} onOpenChange={setIsVisible}>
        <TooltipTrigger 
          asChild 
          className={className}
          onMouseEnter={handleFirstInteraction}
          onClick={handleFirstInteraction}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-sm p-4 bg-background border border-border shadow-xl"
          sideOffset={8}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary flex-shrink-0" />
                {title && (
                  <h4 className="font-semibold text-sm text-foreground">{title}</h4>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content}
            </p>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                Dica
              </Badge>
              {tourId && (
                <Button
                  onClick={handleStartTour}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                >
                  <Play className="h-3 w-3" />
                  Ver tutorial
                </Button>
              )}
              {actionButton && (
                <Button
                  onClick={() => {
                    actionButton.action();
                    handleDismiss();
                  }}
                  size="sm"
                  variant="default"
                  className="h-7 text-xs gap-1"
                >
                  {actionButton.label}
                </Button>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Hook para criar tooltips condicionais baseados no contexto
export const useSmartTooltip = (condition: boolean, delay: number = 2000) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (condition) {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [condition, delay]);

  return shouldShow;
};