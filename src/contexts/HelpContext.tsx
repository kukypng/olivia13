import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface TourStep {
  target: string;
  content: string;
  title: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
  disableBeacon?: boolean;
  spotlightClicks?: boolean;
}

export interface HelpModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  steps: TourStep[];
}

interface HelpContextType {
  // Tour state
  isTourRunning: boolean;
  currentTour: string | null;
  startTour: (tourId: string) => void;
  stopTour: () => void;
  
  // Help state
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  
  // Progress tracking
  userProgress: Record<string, boolean>;
  markCompleted: (moduleId: string) => void;
  getCompletionRate: () => number;
  
  // Available tours and modules
  tours: Record<string, TourStep[]>;
  modules: HelpModule[];
  
  // User preferences
  showHints: boolean;
  toggleHints: () => void;
  
  // Onboarding state
  isFirstTime: boolean;
  completeOnboarding: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

// Tour definitions
const TOURS: Record<string, TourStep[]> = {
  dashboard: [
    {
      target: '.dashboard-header',
      title: 'Bem-vindo ao Oliver!',
      content: 'Este é seu painel principal onde você pode ver um resumo da sua assistência técnica.',
      placement: 'bottom'
    },
    {
      target: '.quick-access',
      title: 'Acesso Rápido',
      content: 'Use estes botões para acessar rapidamente as funcionalidades mais importantes.',
      placement: 'bottom'
    },
    {
      target: '.stats-cards',
      title: 'Estatísticas',
      content: 'Acompanhe suas métricas principais: faturamento, ticket médio e crescimento.',
      placement: 'top'
    }
  ],
  budgets: [
    {
      target: '.budgets-header',
      title: 'Gerenciamento de Orçamentos',
      content: 'Aqui você visualiza e gerencia todos os seus orçamentos.',
      placement: 'bottom'
    },
    {
      target: '.budget-filters',
      title: 'Filtros Inteligentes',
      content: 'Use os filtros para encontrar rapidamente orçamentos específicos.',
      placement: 'bottom'
    },
    {
      target: '.budget-actions',
      title: 'Ações Rápidas',
      content: 'Edite, compartilhe ou delete orçamentos diretamente da lista.',
      placement: 'left'
    }
  ],
  newBudget: [
    {
      target: '.budget-form',
      title: 'Criando um Novo Orçamento',
      content: 'Preencha as informações do cliente e do dispositivo para criar um orçamento profissional.',
      placement: 'top'
    },
    {
      target: '.device-section',
      title: 'Informações do Dispositivo',
      content: 'Selecione o tipo, marca e modelo do dispositivo para um orçamento mais preciso.',
      placement: 'right'
    },
    {
      target: '.pricing-section',
      title: 'Preços e Condições',
      content: 'Configure preços, condições de pagamento e prazos de garantia.',
      placement: 'left'
    }
  ],
  settings: [
    {
      target: '.company-settings',
      title: 'Configurações da Empresa',
      content: 'Configure as informações da sua assistência técnica que aparecerão nos orçamentos.',
      placement: 'right'
    },
    {
      target: '.profile-settings',
      title: 'Perfil do Usuário',
      content: 'Gerencie suas informações pessoais e preferências do sistema.',
      placement: 'right'
    }
  ]
};

// Help modules definition
const HELP_MODULES: HelpModule[] = [
  {
    id: 'getting-started',
    title: 'Primeiros Passos',
    description: 'Aprenda o básico para começar a usar o Oliver',
    icon: 'Rocket',
    completed: false,
    steps: TOURS.dashboard
  },
  {
    id: 'budget-management',
    title: 'Gerenciamento de Orçamentos',
    description: 'Domine a criação e gestão de orçamentos profissionais',
    icon: 'FileText',
    completed: false,
    steps: TOURS.budgets
  },
  {
    id: 'client-management',
    title: 'Gestão de Clientes',
    description: 'Organize e mantenha relacionamento com seus clientes',
    icon: 'Users',
    completed: false,
    steps: []
  },
  {
    id: 'analytics',
    title: 'Análise e Relatórios',
    description: 'Entenda seus números e tome decisões baseadas em dados',
    icon: 'BarChart3',
    completed: false,
    steps: []
  },
  {
    id: 'advanced-settings',
    title: 'Configurações Avançadas',
    description: 'Personalize o sistema para suas necessidades específicas',
    icon: 'Settings',
    completed: false,
    steps: TOURS.settings
  }
];

interface HelpProviderProps {
  children: ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(!localStorage.getItem('oliver-onboarding-completed'));

  const startTour = useCallback((tourId: string) => {
    if (TOURS[tourId]) {
      setCurrentTour(tourId);
      setIsTourRunning(true);
      setIsHelpOpen(false);
    }
  }, []);

  const stopTour = useCallback(() => {
    setIsTourRunning(false);
    setCurrentTour(null);
  }, []);

  const openHelp = useCallback(() => {
    setIsHelpOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  const markCompleted = useCallback((moduleId: string) => {
    setUserProgress(prev => ({ ...prev, [moduleId]: true }));
    localStorage.setItem(`oliver-module-${moduleId}`, 'completed');
  }, []);

  const getCompletionRate = useCallback(() => {
    const totalModules = HELP_MODULES.length;
    const completedModules = Object.values(userProgress).filter(Boolean).length;
    return Math.round((completedModules / totalModules) * 100);
  }, [userProgress]);

  const toggleHints = useCallback(() => {
    setShowHints(prev => {
      const newValue = !prev;
      localStorage.setItem('oliver-show-hints', String(newValue));
      return newValue;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsFirstTime(false);
    localStorage.setItem('oliver-onboarding-completed', 'true');
  }, []);

  const value: HelpContextType = {
    isTourRunning,
    currentTour,
    startTour,
    stopTour,
    isHelpOpen,
    openHelp,
    closeHelp,
    userProgress,
    markCompleted,
    getCompletionRate,
    tours: TOURS,
    modules: HELP_MODULES,
    showHints,
    toggleHints,
    isFirstTime,
    completeOnboarding
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  );
};

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};