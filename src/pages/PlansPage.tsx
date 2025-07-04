import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { supabase } from '@/integrations/supabase/client';
import { PlansHero } from '@/components/plans/PlansHero';
import { BenefitsSection } from '@/components/plans/BenefitsSection';
import { PlanCard } from '@/components/plans/PlanCard';
import { TestimonialsSection } from '@/components/plans/TestimonialsSection';
import { FAQSection } from '@/components/plans/FAQSection';
import { FinalCTA } from '@/components/plans/FinalCTA';
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
export const PlansPage = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  // Fetch site settings from database
  const {
    data: settings,
    isLoading
  } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('site_settings').select('*').single();
      if (error) {
        console.error('Error fetching site settings:', error);
        // Return default fallback values
        return {
          plan_name: 'Plano Profissional',
          plan_description: 'Para assistências técnicas que querem crescer',
          plan_price: 15,
          plan_currency: 'R$',
          plan_period: '/mês',
          plan_features: ["Sistema completo de orçamentos", "Gestão de clientes ilimitada", "Relatórios e estatísticas", "Cálculos automáticos", "Controle de dispositivos", "Suporte técnico incluso", "Atualizações gratuitas", "Backup automático"],
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

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  // Show loading state while fetching settings
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 flex items-center justify-center">
        <div className="loading-shimmer w-16 h-16 rounded-full"></div>
      </div>;
  }

  // Use settings or fallback values
  const config = settings || {
    plan_name: 'Plano Profissional',
    plan_description: 'Para assistências técnicas que querem crescer',
    plan_price: 15,
    plan_currency: 'R$',
    plan_period: '/mês',
    plan_features: ["Sistema completo de orçamentos", "Gestão de clientes ilimitada", "Relatórios e estatísticas", "Cálculos automáticos", "Controle de dispositivos", "Suporte técnico incluso", "Atualizações gratuitas", "Backup automático"],
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
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Background decoration com as novas cores */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-primary/15 to-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-primary/5 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }}></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/8 rounded-full blur-2xl animate-pulse" style={{
        animationDelay: '2s'
      }}></div>
      </div>

      {/* Navigation */}
      <div className="absolute top-6 left-6 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleGoBack} 
          className="interactive-scale glass backdrop-blur-xl text-foreground hover:text-primary hover:bg-primary/10 border border-border/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 space-y-20">
        <PlansHero pageTitle={config.page_title} pageSubtitle={config.page_subtitle} />
        <BenefitsSection />
        <PlanCard config={config} onPlanSelection={handlePlanSelection} />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTA 
          additionalInfo={config.additional_info} 
          ctaButtonText={config.cta_button_text}
          onPlanSelection={handlePlanSelection}
        />
      </div>

      {/* Contact Section */}
      

      {/* Confirmation Dialog */}
      <ConfirmationDialog open={showConfirmation} onOpenChange={setShowConfirmation} onConfirm={handleConfirmPayment} title="Confirmar Assinatura" description="Você será redirecionado para o MercadoPago para finalizar o pagamento. Após a confirmação do pagamento, envie o comprovante para nosso WhatsApp para ativarmos sua conta imediatamente." confirmButtonText="Ir para Pagamento" cancelButtonText="Cancelar" />
    </div>;
};