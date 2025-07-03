import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Trash2, RotateCcw, AlertTriangle } from '@/components/ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { useBudgetDeletion } from '@/hooks/useBudgetDeletion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DeletedBudget {
  id: string;
  budget_data: any;
  created_at: string;
  deletion_reason?: string;
  can_restore: boolean;
}

export const TrashManagement = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const { handleRestore, isRestoring } = useBudgetDeletion();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Buscar orçamentos excluídos
  const { data: deletedBudgets, isLoading, refetch } = useQuery({
    queryKey: ['deleted-budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_deletion_audit')
        .select('*')
        .eq('deleted_by', (await supabase.auth.getUser()).data.user?.id)
        .eq('can_restore', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DeletedBudget[];
    },
  });

  // Função para invalidar todas as queries relacionadas
  const invalidateAllQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['deleted-budgets'] });
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    // Forçar refetch da query atual
    refetch();
  };

  // Excluir permanentemente - versão corrigida com melhor sincronização
  const permanentDeleteMutation = useMutation({
    mutationFn: async (budgetId: string) => {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      // Primeiro, excluir as partes do orçamento
      const { error: partsError } = await supabase
        .from('budget_parts')
        .delete()
        .eq('budget_id', budgetId);
      
      if (partsError) {
        console.error('Erro ao excluir partes:', partsError);
        throw new Error('Erro ao excluir partes do orçamento');
      }

      // Depois, excluir o orçamento principal
      const { error: budgetError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('owner_id', userId);
      
      if (budgetError) {
        console.error('Erro ao excluir orçamento:', budgetError);
        throw new Error('Erro ao excluir orçamento da base de dados');
      }

      // Por fim, marcar como não restaurável na auditoria
      const { error: auditError } = await supabase
        .from('budget_deletion_audit')
        .update({ can_restore: false })
        .eq('budget_id', budgetId)
        .eq('deleted_by', userId);
      
      if (auditError) {
        console.error('Erro ao atualizar auditoria:', auditError);
      }

      return { budgetId, success: true };
    },
    onSuccess: () => {
      // Invalidar todas as queries e forçar re-fetch
      invalidateAllQueries();
      showSuccess({
        title: "Orçamento excluído permanentemente",
        description: "O orçamento foi completamente removido da base de dados.",
      });
    },
    onError: (error: Error) => {
      console.error('Erro na exclusão permanente:', error);
      showError({
        title: "Erro ao excluir permanentemente",
        description: error.message || "Não foi possível excluir o orçamento permanentemente.",
      });
    },
  });

  // Excluir todos permanentemente - versão corrigida com melhor sincronização
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      if (!deletedBudgets || deletedBudgets.length === 0) {
        throw new Error('Nenhum orçamento na lixeira para excluir');
      }

      let successCount = 0;
      let errorCount = 0;

      // Processar cada orçamento excluído
      for (const item of deletedBudgets) {
        try {
          const budgetId = item.budget_data.id;

          // Primeiro, excluir as partes do orçamento
          const { error: partsError } = await supabase
            .from('budget_parts')
            .delete()
            .eq('budget_id', budgetId);
          
          if (partsError) {
            console.error(`Erro ao excluir partes do orçamento ${budgetId}:`, partsError);
            errorCount++;
            continue;
          }

          // Depois, excluir o orçamento principal
          const { error: budgetError } = await supabase
            .from('budgets')
            .delete()
            .eq('id', budgetId)
            .eq('owner_id', userId);
          
          if (budgetError) {
            console.error(`Erro ao excluir orçamento ${budgetId}:`, budgetError);
            errorCount++;
            continue;
          }

          // Por fim, marcar como não restaurável na auditoria
          const { error: auditError } = await supabase
            .from('budget_deletion_audit')
            .update({ can_restore: false })
            .eq('budget_id', budgetId)
            .eq('deleted_by', userId);
          
          if (auditError) {
            console.error(`Erro ao atualizar auditoria do orçamento ${budgetId}:`, auditError);
          }

          successCount++;
        } catch (error) {
          console.error(`Falha ao processar orçamento:`, error);
          errorCount++;
        }
      }

      return { successCount, errorCount, totalCount: deletedBudgets.length };
    },
    onSuccess: ({ successCount, errorCount, totalCount }) => {
      // Invalidar todas as queries e forçar re-fetch
      invalidateAllQueries();
      
      if (errorCount === 0) {
        showSuccess({
          title: "Lixeira esvaziada",
          description: `${successCount} orçamento(s) foram excluídos permanentemente da base de dados.`,
        });
      } else if (successCount > 0) {
        showSuccess({
          title: "Limpeza parcial da lixeira",
          description: `${successCount} de ${totalCount} orçamentos foram excluídos. ${errorCount} falharam.`,
        });
      } else {
        showError({
          title: "Falha ao esvaziar lixeira",
          description: `Não foi possível excluir nenhum dos ${totalCount} orçamentos da lixeira.`,
        });
      }
    },
    onError: (error: Error) => {
      console.error('Erro na exclusão em massa da lixeira:', error);
      showError({
        title: "Erro ao esvaziar lixeira",
        description: error.message || "Não foi possível esvaziar a lixeira.",
      });
    },
  });

  const handleRestoreBudget = async (budgetId: string) => {
    try {
      await handleRestore(budgetId);
      invalidateAllQueries();
    } catch (error) {
      console.error('Erro ao restaurar:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      invalidateAllQueries();
    } finally {
      setIsRefreshing(false);
    }
  };

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Lixeira
          </CardTitle>
          <CardDescription>
            Carregando orçamentos excluídos...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Lixeira
        </CardTitle>
        <CardDescription>
          Gerencie os orçamentos excluídos. Os orçamentos ficam na lixeira por 90 dias antes da exclusão automática.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {deletedBudgets && deletedBudgets.length > 0 && (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>{deletedBudgets.length} orçamento(s) na lixeira</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {deletedBudgets && deletedBudgets.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteAllMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Esvaziar Lixeira
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Esvaziar Lixeira Permanentemente
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      <strong>Esta ação não pode ser desfeita!</strong>
                      <br />
                      Todos os {deletedBudgets.length} orçamentos na lixeira serão completamente removidos da base de dados e não poderão ser recuperados.
                      <br /><br />
                      Tem certeza de que deseja continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteAllMutation.mutate()}
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={deleteAllMutation.isPending}
                    >
                      {deleteAllMutation.isPending ? 'Esvaziando...' : 'Confirmar Exclusão de Todos'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {!deletedBudgets || deletedBudgets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum orçamento na lixeira</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deletedBudgets.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {item.budget_data.device_model || 'Dispositivo não informado'}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {item.budget_data.device_type || 'Tipo não informado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {item.budget_data.client_name || 'Não informado'}
                    </p>
                    <p className="text-sm font-medium">
                      Valor: {formatPrice(item.budget_data.total_price || 0)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {formatDate(item.created_at)}
                  </Badge>
                </div>
                
                {item.deletion_reason && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Motivo:</strong> {item.deletion_reason}
                  </p>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreBudget(item.budget_data.id)}
                      disabled={isRestoring}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restaurar
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                          disabled={permanentDeleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir Permanentemente
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Exclusão Permanente
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            <strong>Esta ação não pode ser desfeita!</strong>
                            <br />
                            O orçamento será completamente removido da base de dados e não poderá ser recuperado.
                            <br /><br />
                            Orçamento: <strong>{item.budget_data.device_model}</strong>
                            <br />
                            Cliente: <strong>{item.budget_data.client_name || 'Não informado'}</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => permanentDeleteMutation.mutate(item.budget_data.id)}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={permanentDeleteMutation.isPending}
                          >
                            {permanentDeleteMutation.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    <span>
                      {getDaysUntilDeletion(item.created_at) > 0 
                        ? `Será excluído automaticamente em ${getDaysUntilDeletion(item.created_at)} dias`
                        : 'Programado para exclusão automática'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
