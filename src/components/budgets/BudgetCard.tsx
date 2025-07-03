import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageCircle, Eye, Edit, Clock, Trash2 } from '@/components/ui/icons';
import { Checkbox } from '@/components/ui/checkbox';
import { useLayout } from '@/contexts/LayoutContext';
import { cn } from '@/lib/utils';
interface BudgetCardProps {
  budget: any;
  profile: any;
  isGenerating: boolean;
  isSelected: boolean;
  onSelect: (budgetId: string, isSelected: boolean) => void;
  onShareWhatsApp: (budget: any) => void;
  onViewPDF: (budget: any) => void;
  onEdit: (budget: any) => void;
  onDelete: (budget: any) => void;
}
const isBudgetOld = (createdAt: string, warningDays: number | undefined | null): boolean => {
  if (!createdAt || !warningDays) return false;
  const now = new Date();
  const budgetDate = new Date(createdAt);
  const diffTime = now.getTime() - budgetDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > warningDays;
};
export const BudgetCard = ({
  budget,
  profile,
  isGenerating,
  isSelected,
  onSelect,
  onShareWhatsApp,
  onViewPDF,
  onEdit,
  onDelete
}: BudgetCardProps) => {
  const {
    isMobile
  } = useLayout();
  if (!budget || !budget.id) {
    console.warn('BudgetCard: budget inválido:', budget);
    return null;
  }
  return <Card className="glass-card border-0 shadow-md bg-white/50 dark:bg-black/50 backdrop-blur-xl transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-4 space-y-4">
        {/* Header com checkbox e data */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            
            <div>
              <h3 className="font-bold text-lg text-foreground">
                {budget.device_model || 'Dispositivo não informado'}
              </h3>
              <Badge variant="outline" className="text-xs mt-1">
                {budget.device_type || 'Tipo não informado'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {budget.created_at ? new Date(budget.created_at).toLocaleDateString('pt-BR') : 'Data não informada'}
            </span>
            {profile?.budget_warning_enabled && budget.created_at && isBudgetOld(budget.created_at, profile.budget_warning_days) && <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Clock className="h-4 w-4 text-destructive" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Este orçamento tem mais de {profile.budget_warning_days} dias.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>}
          </div>
        </div>

        {/* Informações do cliente */}
        {budget.client_name && <div>
            <p className="text-sm text-primary/80 font-semibold">Cliente: {budget.client_name}</p>
          </div>}

        {/* Problema/Issue */}
        <div>
          <p className="text-sm text-muted-foreground font-medium">Problema:</p>
          <p className="text-sm">{budget.issue || 'Problema não informado'}</p>
        </div>

        <Separator />

        {/* Preço */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-xl text-foreground">
              R$ {((budget.total_price || 0) / 100).toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}
            </p>
            {budget.installments > 1 && <p className="text-xs text-muted-foreground">{budget.installments}x</p>}
          </div>
        </div>

        <Separator />

        {/* Botões de ação - GARANTINDO VISIBILIDADE EM MOBILE */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => onShareWhatsApp(budget)} className={cn("flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950 transition-all duration-150", isMobile ? "h-10 px-3 text-sm" : "h-9")}>
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => onViewPDF(budget)} disabled={isGenerating} className={cn("flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-150 disabled:opacity-50", isMobile ? "h-10 px-3 text-sm" : "h-9")}>
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Ver PDF</span>
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => onEdit(budget)} className={cn("flex items-center gap-2 hover:bg-muted/20 hover:text-[#fec832] transition-all duration-150", isMobile ? "h-10 px-3 text-sm" : "h-9")}>
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          
          {/* BOTÃO DE LIXEIRA - SEMPRE VISÍVEL, INCLUINDO MOBILE */}
          <Button variant="ghost" size="sm" onClick={() => onDelete(budget)} className={cn("flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-150", isMobile ? "h-10 px-3 text-sm" : "h-9")}>
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Excluir</span>
          </Button>
        </div>
      </CardContent>
    </Card>;
};