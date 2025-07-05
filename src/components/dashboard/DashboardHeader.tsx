
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { UserProfile } from './types';
import { HelpButton } from '@/components/help/HelpButton';
import { SmartTooltip } from '@/components/help/SmartTooltip';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

interface DashboardHeaderProps {
  profile: UserProfile | null;
  weeklyGrowth: number;
}

export const DashboardHeader = ({ profile, weeklyGrowth }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 dashboard-header">
      <div className="animate-slide-up">
        <SmartTooltip
          content="Este é seu painel principal! Aqui você tem uma visão geral de toda sua assistência técnica."
          title="Bem-vindo ao Oliver!"
          tourId="dashboard"
          showOnce
          delay={1000}
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">{getGreeting()}, {profile?.name || 'usuário'}!</h1>
        </SmartTooltip>
        <div className="flex items-center space-x-3 mt-2">
          <p className="text-base lg:text-lg text-muted-foreground">
            Seja bem-vindo(a) de volta!
          </p>
          {profile && (
            <Badge variant="secondary" className="bg-[#fec832]/20 text-[#fec832] border-none text-xs font-semibold py-1 px-3 rounded-full">
              {profile.role.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <HelpButton variant="header" showProgress />
        <SmartTooltip
          content="Acompanhe seu crescimento semanal e veja quantos orçamentos você criou!"
          title="Suas Métricas"
          showOnce
          delay={3000}
        >
          <div className="flex items-center space-x-3 text-sm text-muted-foreground glass-card p-3 px-4 rounded-full border-none shadow-soft animate-scale-in stats-cards">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <span className="font-medium text-foreground/90">{weeklyGrowth || 0} orçamentos esta semana</span>
          </div>
        </SmartTooltip>
      </div>
    </div>
  );
};
