import React, { useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS, Step, CallBackProps } from 'react-joyride';
import { useHelp } from '@/contexts/HelpContext';

const tourStyles = {
  options: {
    primaryColor: 'hsl(var(--primary))',
    backgroundColor: 'hsl(var(--background))',
    textColor: 'hsl(var(--foreground))',
    overlayColor: 'rgba(0, 0, 0, 0.4)',
    spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  tooltip: {
    backgroundColor: 'hsl(var(--background))',
    borderRadius: '12px',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    fontSize: '14px',
    maxWidth: '400px',
  },
  tooltipTitle: {
    color: 'hsl(var(--foreground))',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  tooltipContent: {
    color: 'hsl(var(--muted-foreground))',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  button: {
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonClose: {
    color: 'hsl(var(--muted-foreground))',
    backgroundColor: 'transparent',
    border: '1px solid hsl(var(--border))',
  },
  buttonSkip: {
    color: 'hsl(var(--muted-foreground))',
    backgroundColor: 'transparent',
  },
  beacon: {
    backgroundColor: 'hsl(var(--primary))',
    border: '2px solid hsl(var(--background))',
  },
  beaconInner: {
    backgroundColor: 'hsl(var(--primary))',
  },
  spotlight: {
    backgroundColor: 'transparent',
    borderRadius: '8px',
  },
};

const tourLocale = {
  back: 'Voltar',
  close: 'Fechar',
  last: 'Finalizar',
  next: 'Próximo',
  open: 'Abrir',
  skip: 'Pular',
};

export const InteractiveTour: React.FC = () => {
  const { isTourRunning, currentTour, tours, stopTour, markCompleted } = useHelp();

  const currentSteps: Step[] = currentTour && tours[currentTour] 
    ? tours[currentTour].map(step => ({
        ...step,
        disableBeacon: step.disableBeacon ?? false,
        spotlightClicks: step.spotlightClicks ?? false,
      }))
    : [];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (type === 'step:after' || type === 'error:target_not_found') {
      // Update state to advance the tour
      if (action === ACTIONS.NEXT && index === currentSteps.length - 1) {
        // Tour completed
        if (currentTour) {
          markCompleted(currentTour);
        }
        stopTour();
      }
    } else if (status === 'finished' || status === 'skipped') {
      // User finished or skipped the tour
      if (currentTour && status === 'finished') {
        markCompleted(currentTour);
      }
      stopTour();
    }
  };

  // Auto-start onboarding tour for first-time users
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('oliver-onboarding-completed');
    if (!hasSeenOnboarding && !isTourRunning) {
      // Give a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // You can trigger the dashboard tour here
        // startTour('dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isTourRunning || !currentTour || currentSteps.length === 0) {
    return null;
  }

  return (
    <Joyride
      steps={currentSteps}
      run={isTourRunning}
      continuous
      showProgress
      showSkipButton
      spotlightClicks
      disableOverlayClose
      callback={handleJoyrideCallback}
      locale={tourLocale}
      styles={tourStyles}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
};