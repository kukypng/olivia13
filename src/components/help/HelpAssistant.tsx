import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Play, 
  Search, 
  Trophy, 
  BookOpen, 
  MessageSquare,
  Rocket,
  FileText,
  Users,
  BarChart3,
  Settings,
  CheckCircle2,
  Star,
  Lightbulb
} from 'lucide-react';
import { useHelp } from '@/contexts/HelpContext';

const iconMap = {
  Rocket,
  FileText,
  Users,
  BarChart3,
  Settings,
};

const faqData = [
  {
    question: 'Como criar meu primeiro orçamento?',
    answer: 'Clique em "Novo Orçamento" no menu lateral ou use o botão de acesso rápido no dashboard. Preencha as informações do cliente e dispositivo, adicione os serviços necessários e finalize.',
    category: 'Orçamentos'
  },
  {
    question: 'Posso personalizar as informações da minha empresa?',
    answer: 'Sim! Vá em Configurações > Empresa e adicione logo, dados de contato, endereço e outras informações que aparecerão nos seus orçamentos.',
    category: 'Configurações'
  },
  {
    question: 'Como compartilhar um orçamento com o cliente?',
    answer: 'Na lista de orçamentos, clique no botão de compartilhar (ícone do WhatsApp) ao lado do orçamento desejado. O link será enviado automaticamente.',
    category: 'Orçamentos'
  },
  {
    question: 'Posso definir diferentes condições de pagamento?',
    answer: 'Sim! Em Configurações > Gestão de Dados você pode criar condições personalizadas de pagamento que aparecerão como opções nos orçamentos.',
    category: 'Configurações'
  },
  {
    question: 'Como acompanhar minhas métricas de vendas?',
    answer: 'No dashboard principal você encontra cards com faturamento total, ticket médio e crescimento semanal. Use esses dados para acompanhar a performance da sua assistência.',
    category: 'Relatórios'
  }
];

const quickActions = [
  { icon: Rocket, label: 'Tour Inicial', action: 'dashboard', description: 'Conheça o básico do sistema' },
  { icon: FileText, label: 'Criar Orçamento', action: 'newBudget', description: 'Aprenda a criar orçamentos profissionais' },
  { icon: Settings, label: 'Configurar Sistema', action: 'settings', description: 'Personalize sua assistência técnica' },
];

export const HelpAssistant: React.FC = () => {
  const { 
    isHelpOpen, 
    closeHelp, 
    modules, 
    startTour, 
    getCompletionRate,
    userProgress,
    showHints,
    toggleHints
  } = useHelp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(faqData.map(item => item.category)))];
  const completionRate = getCompletionRate();

  return (
    <Dialog open={isHelpOpen} onOpenChange={closeHelp}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            Oliver Assistant
          </DialogTitle>
          <DialogDescription>
            Seu guia completo para dominar o sistema de gestão de orçamentos
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="modules" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="modules">Módulos</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="quickstart">Início Rápido</TabsTrigger>
              <TabsTrigger value="progress">Progresso</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="flex-1 mt-4">
              <ScrollArea className="h-full pr-4">
                <div className="grid gap-4">
                  {modules.map((module) => {
                    const IconComponent = iconMap[module.icon as keyof typeof iconMap];
                    const isCompleted = userProgress[module.id];
                    
                    return (
                      <div 
                        key={module.id}
                        className="card-premium p-4 hover:shadow-strong transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isCompleted ? 'bg-green-500/10' : 'bg-primary/10'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                IconComponent && <IconComponent className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{module.title}</h3>
                                {isCompleted && (
                                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                                    Concluído
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                            </div>
                          </div>
                          {module.steps.length > 0 && (
                            <Button
                              size="sm"
                              onClick={() => startTour(module.id)}
                              className="ml-4"
                              variant={isCompleted ? "outline" : "default"}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              {isCompleted ? 'Revisar' : 'Iniciar'}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="faq" className="flex-1 mt-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar dúvidas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'Todas as categorias' : category}
                      </option>
                    ))}
                  </select>
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {filteredFAQ.map((item, index) => (
                      <div key={index} className="card-premium p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground mb-2">{item.question}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="quickstart" className="flex-1 mt-4">
              <div className="grid gap-4">
                <div className="card-premium p-6 text-center">
                  <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Comece Agora!</h3>
                  <p className="text-muted-foreground mb-4">
                    Escolha uma das ações abaixo para começar a usar o Oliver de forma eficiente.
                  </p>
                </div>

                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <div key={index} className="card-premium p-4 hover:shadow-strong transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{action.label}</h4>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => startTour(action.action)}
                          size="sm"
                        >
                          Iniciar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="flex-1 mt-4">
              <div className="space-y-6">
                <div className="card-premium p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{completionRate}% Completo</h3>
                  <p className="text-muted-foreground mb-4">Seu progresso no Oliver Assistant</p>
                  <Progress value={completionRate} className="max-w-md mx-auto" />
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between card-premium p-4">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <span className="font-medium">Dicas Contextuais</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleHints}
                    >
                      {showHints ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>

                  <div className="card-premium p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Conquistas
                    </h4>
                    <div className="space-y-2">
                      {modules.map((module) => {
                        const isCompleted = userProgress[module.id];
                        return (
                          <div key={module.id} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-500' : 'bg-muted'
                            }`}>
                              {isCompleted && <CheckCircle2 className="h-4 w-4 text-white" />}
                            </div>
                            <span className={`text-sm ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {module.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};