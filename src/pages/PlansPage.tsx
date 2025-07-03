import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, MessageCircle, ArrowLeft, Shield, Zap, Users, Award, Phone, Mail, Globe, Clock, Headphones, Smartphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    $MPC_loaded?: boolean;
    attachEvent?: (event: string, callback: () => void) => void;
  }
}

interface SiteSettings {
  plan_name: string;
  plan_description: string;
  plan_price: number;
  plan_currency: string;
  plan_period: string;
  plan_features: string[];
  whatsapp_number: string;
  page_title: string;
  page_subtitle: string;
  popular_badge_text: string;
  cta_button_text: string;
  support_text: string;
  show_popular_badge: boolean;
  show_support_info: boolean;
  additional_info: string;
}

// Link fixo de pagamento - não pode ser alterado
const FIXED_PAYMENT_URL = 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=bbb0d6d04e3440f395e562d80f870761';

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Proprietário - TechRepair",
    content: "O Oliver transformou minha assistência. Agora consigo fazer orçamentos profissionais em minutos!",
    rating: 5
  },
  {
    name: "Ana Maria",
    role: "Gerente - CelFix",
    content: "Sistema incrível! Organização total dos clientes e orçamentos. Recomendo muito!",
    rating: 5
  },
  {
    name: "João Santos",
    role: "Técnico - MobileTech",
    content: "Interface simples e funcional. Perfeito para quem quer profissionalizar o negócio.",
    rating: 5
  }
];

const benefits = [
  {
    icon: Zap,
    title: "Rápido e Eficiente",
    description: "Crie orçamentos profissionais em menos de 2 minutos"
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    description: "Seus dados protegidos com tecnologia de ponta"
  },
  {
    icon: Users,
    title: "Suporte Dedicado",
    description: "Atendimento brasileiro via WhatsApp quando precisar"
  },
  {
    icon: Award,
    title: "Resultados Comprovados",
    description: "Mais de 500+ assistências técnicas já confiam no Oliver"
  }
];

const faqs = [
  {
    question: "Como funciona o período de teste?",
    answer: "Você tem 7 dias para testar todas as funcionalidades gratuitamente."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Não há fidelidade. Cancele quando quiser pelo WhatsApp."
  },
  {
    question: "O suporte está incluso?",
    answer: "Sim! Suporte completo via WhatsApp está incluído em todos os planos."
  },
  {
    question: "Funciona no celular?",
    answer: "Perfeitamente! O sistema é responsivo e funciona em qualquer dispositivo."
  }
];

export const PlansPage = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  // Fetch site settings from database
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching site settings:', error);
        // Return default fallback values
        return {
          plan_name: 'Plano Profissional',
          plan_description: 'Para assistências técnicas que querem crescer',
          plan_price: 15,
          plan_currency: 'R$',
          plan_period: '/mês',
          plan_features: [
            "Sistema completo de orçamentos",
            "Gestão de clientes ilimitada", 
            "Relatórios e estatísticas",
            "Cálculos automáticos",
            "Controle de dispositivos",
            "Suporte técnico incluso",
            "Atualizações gratuitas",
            "Backup automático"
          ],
          whatsapp_number: '556496028022',
          page_title: 'Escolha seu Plano',
          page_subtitle: 'Tenha acesso completo ao sistema de gestão de orçamentos mais eficiente para assistências técnicas.',
          popular_badge_text: 'Mais Popular',
          cta_button_text: 'Assinar Agora',
          support_text: 'Suporte via WhatsApp incluso',
          show_popular_badge: true,
          show_support_info: true,
          additional_info: '✓ Sem taxa de setup • ✓ Cancele quando quiser • ✓ Suporte brasileiro'
        } as SiteSettings;
      }
      return data as SiteSettings;
    }
  });

  useEffect(() => {
    // Load MercadoPago script
    const loadMercadoPagoScript = () => {
      if (window.$MPC_loaded) return;
      
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = `${window.location.protocol}//secure.mlstatic.com/mptools/render.js`;
      
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      }
      
      window.$MPC_loaded = true;
    };

    if (window.$MPC_loaded !== true) {
      if (window.attachEvent) {
        window.attachEvent('onload', loadMercadoPagoScript);
      } else {
        window.addEventListener('load', loadMercadoPagoScript, false);
      }
    }
    
    loadMercadoPagoScript();
  }, []);

  const handlePlanSelection = () => {
    setShowConfirmation(true);
  };

  const handleConfirmPayment = () => {
    setShowConfirmation(false);
    console.log('Redirecting to fixed payment URL:', FIXED_PAYMENT_URL);
    window.location.href = FIXED_PAYMENT_URL;
  };

  // Show loading state while fetching settings
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 flex items-center justify-center">
        <div className="loading-shimmer w-16 h-16 rounded-full"></div>
      </div>
    );
  }

  // Use settings or fallback values
  const config = settings || {
    plan_name: 'Plano Profissional',
    plan_description: 'Para assistências técnicas que querem crescer',
    plan_price: 15,
    plan_currency: 'R$',
    plan_period: '/mês',
    plan_features: [
      "Sistema completo de orçamentos",
      "Gestão de clientes ilimitada",
      "Relatórios e estatísticas", 
      "Cálculos automáticos",
      "Controle de dispositivos",
      "Suporte técnico incluso",
      "Atualizações gratuitas",
      "Backup automático"
    ],
    whatsapp_number: '556496028022',
    page_title: 'Escolha seu Plano',
    page_subtitle: 'Tenha acesso completo ao sistema de gestão de orçamentos mais eficiente para assistências técnicas.',
    popular_badge_text: 'Mais Popular',
    cta_button_text: 'Assinar Agora',
    support_text: 'Suporte via WhatsApp incluso',
    show_popular_badge: true,
    show_support_info: true,
    additional_info: '✓ Sem taxa de setup • ✓ Cancele quando quiser • ✓ Suporte brasileiro'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 relative overflow-hidden">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-primary/10 to-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <div className="absolute top-6 left-6 z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="interactive-scale glass backdrop-blur-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 space-y-20">
        {/* Hero Section */}
        <section className="text-center animate-fade-in-up">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <img alt="Oliver Logo" className="h-16 w-16 interactive-scale" src="/oliver-logo.png" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Oliver
            </h1>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
            {config.page_title}
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {config.page_subtitle}
          </p>
        </section>

        {/* Benefits Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="glass-card text-center group hover:scale-105 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mx-auto flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Main Plan Card */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="max-w-lg mx-auto">
            <Card className="glass-card border-0 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl p-[1px]">
                <div className="bg-card/90 backdrop-blur-xl rounded-3xl h-full"></div>
              </div>
              
              <div className="relative z-10">
                {/* Popular badge */}
                {config.show_popular_badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                      <Star className="h-4 w-4" />
                      {config.popular_badge_text}
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pt-12 pb-6">
                  <CardTitle className="text-3xl lg:text-4xl text-foreground mb-3">
                    {config.plan_name}
                  </CardTitle>
                  <CardDescription className="text-lg mb-6 text-muted-foreground">
                    {config.plan_description}
                  </CardDescription>
                  <div className="mb-8">
                    <div className="flex items-baseline justify-center">
                      <span className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        {config.plan_currency} {config.plan_price}
                      </span>
                      <span className="text-xl text-muted-foreground ml-2">
                        {config.plan_period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Primeiro mês com 50% de desconto
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8 px-8 pb-8">
                  {/* Features List */}
                  <div className="space-y-4">
                    {config.plan_features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/20 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-foreground font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    onClick={handlePlanSelection} 
                    className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    size="lg"
                  >
                    {config.cta_button_text}
                  </Button>

                  {/* Support Info */}
                  {config.show_support_info && (
                    <div className="text-center pt-6 border-t border-border/30">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        {config.support_text}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              O que nossos clientes dizem
            </h3>
            <p className="text-muted-foreground text-lg">
              Centenas de assistências técnicas já confiam no Oliver
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass-card group hover:scale-105 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              Perguntas Frequentes
            </h3>
            <p className="text-muted-foreground text-lg">
              Tire suas dúvidas sobre o Oliver
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="glass-card transition-all duration-300">
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-foreground">{faq.question}</h4>
                      <div className={`transform transition-transform duration-200 ${expandedFaq === index ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6 animate-fade-in">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12 glass backdrop-blur-xl">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              Pronto para revolucionar sua assistência técnica?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {config.additional_info}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handlePlanSelection}
                className="btn-apple text-lg px-8 py-4"
              >
                {config.cta_button_text}
              </Button>
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link to="/auth" className="font-semibold text-primary hover:underline">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Contact Section */}
      <section className="py-12 border-t border-border/30 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              Precisa de ajuda? Entre em contato
            </h4>
            <div className="flex justify-center items-center gap-6 text-muted-foreground">
              <a 
                href={`https://wa.me/${config.whatsapp_number}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors interactive-scale"
              >
                <Phone className="h-4 w-4" />
                WhatsApp
              </a>
              <a 
                href="mailto:contato@oliver.com.br" 
                className="flex items-center gap-2 hover:text-primary transition-colors interactive-scale"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                oliver.com.br
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Dialog */}
      <ConfirmationDialog 
        open={showConfirmation} 
        onOpenChange={setShowConfirmation} 
        onConfirm={handleConfirmPayment} 
        title="Confirmar Assinatura" 
        description="Você será redirecionado para o MercadoPago para finalizar o pagamento. Após a confirmação do pagamento, envie o comprovante para nosso WhatsApp para ativarmos sua conta imediatamente." 
        confirmButtonText="Ir para Pagamento" 
        cancelButtonText="Cancelar" 
      />
    </div>
  );
};