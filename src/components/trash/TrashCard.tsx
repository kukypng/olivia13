import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, RotateCcw, Trash2, AlertTriangle, Clock, User, DollarSign } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
interface DeletedBudget {
  id: string;
  budget_data: any;
  created_at: string;
  deletion_reason?: string;
  can_restore: boolean;
}
interface TrashCardProps {
  item: DeletedBudget;
  onRestore: (budgetId: string) => void;
  onPermanentDelete: (budgetId: string) => void;
  isRestoring: boolean;
  isPermanentDeleting: boolean;
  className?: string;
}
export const TrashCard: React.FC<TrashCardProps> = ({
  item,
  onRestore,
  onPermanentDelete,
  isRestoring,
  isPermanentDeleting,
  className
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  const getDaysUntilDeletion = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 90 - diffDays);
  };
  const daysLeft = getDaysUntilDeletion(item.created_at);
  const isExpiring = daysLeft <= 7;
  return <Card className={cn("transition-all duration-200 hover:shadow-md", "border-l-4", isExpiring ? "border-l-orange-500" : "border-l-muted", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header com informações principais */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-lg leading-tight">
                  {item.budget_data.device_model || 'Dispositivo não informado'}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {item.budget_data.device_type || 'Tipo não informado'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                
                
                <div className="flex items-center gap-2 font-medium">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>{formatPrice(item.budget_data.total_price || 0)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
            </div>
            
            <Badge variant={isExpiring ? "destructive" : "secondary"} className="ml-4 whitespace-nowrap">
              {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Expirando'}
            </Badge>
          </div>

          {/* Motivo da exclusão */}
          {item.deletion_reason}

          <Separator />

          {/* Ações e informações de expiração */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onRestore(item.budget_data.id)} disabled={isRestoring || isPermanentDeleting} className="flex items-center gap-2">
                <RotateCcw className={cn("h-4 w-4", isRestoring && "animate-spin")} />
                {isRestoring ? 'Restaurando...' : 'Restaurar'}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex items-center gap-2" disabled={isRestoring || isPermanentDeleting}>
                    <Trash2 className="h-4 w-4" />
                    {isPermanentDeleting ? 'Excluindo...' : 'Excluir Permanentemente'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Exclusão Permanente
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p><strong>Esta ação não pode ser desfeita!</strong></p>
                      <p>O orçamento será completamente removido da base de dados e não poderá ser recuperado.</p>
                      
                      <div className="mt-4 p-3 bg-muted rounded-lg space-y-1">
                        <p><strong>Orçamento:</strong> {item.budget_data.device_model}</p>
                        <p><strong>Cliente:</strong> {item.budget_data.client_name || 'Não informado'}</p>
                        <p><strong>Valor:</strong> {formatPrice(item.budget_data.total_price || 0)}</p>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onPermanentDelete(item.budget_data.id)} className="bg-destructive hover:bg-destructive/90" disabled={isPermanentDeleting}>
                      {isPermanentDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <div className={cn("flex items-center gap-2 text-xs", isExpiring ? "text-orange-600" : "text-muted-foreground")}>
              
              <span>
                {daysLeft > 0 ? `Exclusão automática em ${daysLeft} dias` : 'Programado para exclusão automática'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};