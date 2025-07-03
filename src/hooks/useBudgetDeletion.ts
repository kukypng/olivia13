
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';

interface DeletionOptions {
  budgetId?: string;
  budgetIds?: string[];
  deletionReason?: string;
  isConfirmed?: boolean;
}

interface DatabaseResponse {
  success: boolean;
  error?: string;
  budget_id?: string;
  deleted_at?: string;
  deleted_count?: number;
}

export const useBudgetDeletion = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  // Single budget soft deletion
  const deleteSingleBudget = useMutation({
    mutationFn: async ({ budgetId, deletionReason }: { budgetId: string; deletionReason?: string }) => {
      console.log('Iniciando soft delete do orçamento:', budgetId);
      
      const { data, error } = await supabase.rpc('soft_delete_budget_with_audit', {
        p_budget_id: budgetId,
        p_deletion_reason: deletionReason
      });
      
      if (error) {
        console.error('Erro no soft delete:', error);
        throw new Error(error.message || 'Erro ao excluir orçamento');
      }

      const response = data as unknown as DatabaseResponse;
      if (!response?.success) {
        throw new Error(response?.error || 'Falha na exclusão do orçamento');
      }
      
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess({
        title: "Orçamento excluído",
        description: "O orçamento foi movido para a lixeira com sucesso.",
      });
    },
    onError: (error: Error) => {
      console.error('Erro na exclusão:', error);
      showError({
        title: "Erro ao excluir",
        description: error.message || "Ocorreu um erro ao excluir o orçamento.",
      });
    },
  });

  // Mass budget deletion
  const deleteAllBudgets = useMutation({
    mutationFn: async ({ deletionReason }: { deletionReason?: string }) => {
      console.log('Iniciando exclusão em massa');
      
      const { data, error } = await supabase.rpc('soft_delete_all_user_budgets', {
        p_deletion_reason: deletionReason || 'Exclusão em massa pelo usuário'
      });
      
      if (error) {
        console.error('Erro na exclusão em massa:', error);
        throw new Error(error.message || 'Erro ao excluir orçamentos');
      }

      const response = data as unknown as DatabaseResponse;
      if (!response?.success) {
        throw new Error(response?.error || 'Falha na exclusão em massa');
      }
      
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess({
        title: "Exclusão concluída",
        description: `${data.deleted_count} orçamento(s) foram movidos para a lixeira.`,
      });
    },
    onError: (error: Error) => {
      console.error('Erro na exclusão em massa:', error);
      showError({
        title: "Erro na exclusão",
        description: error.message || "Ocorreu um erro ao excluir os orçamentos.",
      });
    },
  });

  // Selected budgets deletion (batch)
  const deleteSelectedBudgets = useMutation({
    mutationFn: async ({ budgetIds, deletionReason }: { budgetIds: string[]; deletionReason?: string }) => {
      console.log('Iniciando exclusão em lote:', budgetIds);
      
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const budgetId of budgetIds) {
        try {
          const { data, error } = await supabase.rpc('soft_delete_budget_with_audit', {
            p_budget_id: budgetId,
            p_deletion_reason: deletionReason || 'Exclusão em lote'
          });
          
          if (error) {
            console.error(`Erro ao excluir orçamento ${budgetId}:`, error);
            errorCount++;
          } else {
            const response = data as unknown as DatabaseResponse;
            if (response?.success) {
              successCount++;
            } else {
              errorCount++;
            }
          }
          
          results.push({ budgetId, success: (data as unknown as DatabaseResponse)?.success || false, error: error?.message });
        } catch (err) {
          console.error(`Falha ao excluir orçamento ${budgetId}:`, err);
          errorCount++;
          results.push({ budgetId, success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' });
        }
      }
      
      return { results, successCount, errorCount, totalCount: budgetIds.length };
    },
    onSuccess: ({ successCount, errorCount, totalCount }) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      
      if (errorCount === 0) {
        showSuccess({
          title: "Exclusão concluída",
          description: `${successCount} orçamento(s) foram movidos para a lixeira.`,
        });
      } else if (successCount > 0) {
        showSuccess({
          title: "Exclusão parcial",
          description: `${successCount} de ${totalCount} orçamentos foram excluídos. Alguns falharam.`,
        });
      } else {
        showError({
          title: "Falha na exclusão",
          description: `Não foi possível excluir nenhum dos ${totalCount} orçamentos selecionados.`,
        });
      }
    },
    onError: (error: Error) => {
      console.error('Erro na exclusão em lote:', error);
      showError({
        title: "Erro na exclusão",
        description: error.message || "Ocorreu um erro ao excluir os orçamentos selecionados.",
      });
    },
  });

  // Restore budget function
  const restoreBudget = useMutation({
    mutationFn: async (budgetId: string) => {
      console.log('Restaurando orçamento:', budgetId);
      
      const { data, error } = await supabase.rpc('restore_deleted_budget', {
        p_budget_id: budgetId
      });
      
      if (error) {
        console.error('Erro ao restaurar:', error);
        throw new Error(error.message || 'Erro ao restaurar orçamento');
      }

      const response = data as unknown as DatabaseResponse;
      if (!response?.success) {
        throw new Error(response?.error || 'Falha na restauração do orçamento');
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-budgets'] });
      showSuccess({
        title: "Orçamento restaurado",
        description: "O orçamento foi restaurado com sucesso.",
      });
    },
    onError: (error: Error) => {
      console.error('Erro na restauração:', error);
      showError({
        title: "Erro ao restaurar",
        description: error.message || "Ocorreu um erro ao restaurar o orçamento.",
      });
    },
  });

  const handleSingleDeletion = useCallback(async (options: DeletionOptions) => {
    if (!options.budgetId) {
      showError({
        title: "Erro",
        description: "ID do orçamento não fornecido.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSingleBudget.mutateAsync({
        budgetId: options.budgetId,
        deletionReason: options.deletionReason
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteSingleBudget, showError]);

  const handleMassDeletion = useCallback(async (options: DeletionOptions = {}) => {
    setIsDeleting(true);
    try {
      await deleteAllBudgets.mutateAsync({
        deletionReason: options.deletionReason
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteAllBudgets]);

  const handleBatchDeletion = useCallback(async (options: DeletionOptions) => {
    if (!options.budgetIds || options.budgetIds.length === 0) {
      showError({
        title: "Erro",
        description: "Nenhum orçamento selecionado.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSelectedBudgets.mutateAsync({
        budgetIds: options.budgetIds,
        deletionReason: options.deletionReason
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteSelectedBudgets, showError]);

  const handleRestore = useCallback(async (budgetId: string) => {
    await restoreBudget.mutateAsync(budgetId);
  }, [restoreBudget]);

  return {
    // States
    isDeleting: isDeleting || deleteSingleBudget.isPending || deleteAllBudgets.isPending || deleteSelectedBudgets.isPending,
    isRestoring: restoreBudget.isPending,
    
    // Actions
    handleSingleDeletion,
    handleMassDeletion,
    handleBatchDeletion,
    handleRestore,
    
    // Raw mutations (for advanced usage)
    deleteSingleBudget,
    deleteAllBudgets,
    deleteSelectedBudgets,
    restoreBudget,
  };
};
