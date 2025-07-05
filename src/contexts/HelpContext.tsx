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
      content: 'Este é seu painel principal onde você pode ver um resumo da sua assistência técnica. Aqui você acompanha o crescimento do seu negócio.',
      placement: 'bottom'
    },
    {
      target: '.quick-access',
      title: 'Acesso Rápido - Suas Ferramentas Principais',
      content: 'Use estes botões para acessar rapidamente as funcionalidades mais importantes. Comece criando um orçamento!',
      placement: 'bottom'
    },
    {
      target: '.stats-cards',
      title: 'Suas Métricas de Crescimento',
      content: 'Acompanhe quantos orçamentos você criou esta semana. Esse número vai crescer conforme você usa o sistema!',
      placement: 'top'
    }
  ],
  budgets: [
    {
      target: '.budgets-header',
      title: 'Central de Orçamentos',
      content: 'Aqui você visualiza e gerencia todos os seus orçamentos. Veja quantos você já criou!',
      placement: 'bottom'
    },
    {
      target: '.budget-search',
      title: 'Busca Inteligente',
      content: 'Digite o nome do cliente, modelo do dispositivo ou qualquer palavra-chave para encontrar orçamentos rapidamente.',
      placement: 'bottom'
    },
    {
      target: '.budget-actions',
      title: 'Ações do Orçamento',
      content: 'Compartilhe via WhatsApp, edite, visualize ou delete orçamentos. Tudo em um clique!',
      placement: 'left'
    }
  ],
  newBudget: [
    {
      target: '.budget-form',
      title: 'Formulário de Orçamento',
      content: 'Preencha as informações para criar um orçamento profissional. Comece sempre pelas informações do dispositivo.',
      placement: 'top'
    },
    {
      target: '.device-section',
      title: 'Passo 1: Informações do Dispositivo',
      content: 'Preencha o modelo do aparelho e o tipo de serviço (campos obrigatórios). Isso é essencial para um orçamento preciso.',
      placement: 'bottom'
    },
    {
      target: '.pricing-section',
      title: 'Passo 2: Defina os Preços',
      content: 'Configure o valor à vista (obrigatório) e ative o parcelamento se desejar. Você pode definir condições de pagamento personalizadas.',
      placement: 'top'
    }
  ],
  settings: [
    {
      target: '.company-settings',
      title: 'Configure Sua Empresa',
      content: 'Defina nome da loja, endereço e telefone. Essas informações aparecerão nos seus orçamentos para dar credibilidade.',
      placement: 'left'
    },
    {
      target: '.profile-settings',
      title: 'Suas Preferências',
      content: 'Atualize seus dados pessoais e configure alertas de orçamentos. Personalize sua experiência no Oliver.',
      placement: 'left'
    }
  ],
  // Tours para onboarding de primeiros passos
  'getting-started': [
    {
      target: '.dashboard-header',
      title: '👋 Bem-vindo ao Oliver!',
      content: 'Parabéns por escolher o Oliver! Este é seu dashboard onde tudo acontece. Vamos te ensinar os primeiros passos.',
      placement: 'bottom'
    },
    {
      target: '.quick-access',
      title: '🚀 Seus Atalhos Principais',
      content: 'Estes botões são seus melhores amigos! Use "Novo Orçamento" para começar e "Configurações" para personalizar.',
      placement: 'bottom'
    }
  ],
  'budget-mastery': [
    {
      target: '.budget-form',
      title: '💼 Dominando os Orçamentos',
      content: 'Aqui está o coração do Oliver! Vamos criar seu primeiro orçamento profissional juntos.',
      placement: 'top'
    },
    {
      target: '.device-section',
      title: '📱 Informações Essenciais',
      content: 'Sempre comece aqui: modelo do aparelho e tipo de serviço são obrigatórios. O resto você preenche conforme necessário.',
      placement: 'bottom'
    },
    {
      target: '.pricing-section',
      title: '💰 Precificação Inteligente',
      content: 'Defina o valor à vista e ative parcelamento se quiser. Dica: valores justos geram mais vendas!',
      placement: 'top'
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