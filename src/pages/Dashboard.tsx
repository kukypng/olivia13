
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/AuthGuard';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { HelpProvider } from '@/contexts/HelpContext';
import { AdaptiveLayout } from '@/components/adaptive/AdaptiveLayout';
import { AdaptiveDashboard } from '@/components/adaptive/AdaptiveDashboard';
import { BudgetsContent } from '@/components/BudgetsContent';
import { NewBudgetContent } from '@/components/NewBudgetContent';
import { SettingsContent } from '@/components/SettingsContent';
import { DataManagementContent } from '@/components/DataManagementContent';
import { AdminPanel } from '@/components/AdminPanel';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ClientsContent } from '@/components/ClientsContent';
import { InteractiveTour } from '@/components/help/InteractiveTour';
import { HelpAssistant } from '@/components/help/HelpAssistant';
import { HelpButton } from '@/components/help/HelpButton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { profile, hasPermission, user } = useAuth();

  // Listener para navegação entre abas do HelpAssistant
  useEffect(() => {
    const handleNavigateTab = (event: any) => {
      setActiveTab(event.detail.tab);
    };
    
    window.addEventListener('navigate-tab', handleNavigateTab);
    return () => window.removeEventListener('navigate-tab', handleNavigateTab);
  }, []);

  const { data: stats } = useQuery({
    queryKey: ['dashboard-weekly-growth', user?.id],
    queryFn: async () => {
      if (!user) return { weeklyGrowth: 0 };

      const today = new Date();
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { error, count } = await supabase
        .from('budgets')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .gte('created_at', weekStart.toISOString());

      if (error) throw error;
      return { weeklyGrowth: count || 0 };
    },
    enabled: !!user,
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdaptiveDashboard
            onTabChange={setActiveTab}
            profile={profile}
            weeklyGrowth={stats?.weeklyGrowth || 0}
            hasPermission={hasPermission}
          />
        );
      case 'budgets':
        return <BudgetsContent onTabChange={setActiveTab} />;
      case 'new-budget':
        return <NewBudgetContent />;
      case 'clients':
        return <ClientsContent />;
      case 'data-management':
        return <DataManagementContent />;
      case 'admin':
        return (
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        );
      case 'settings':
        return <SettingsContent />;
      default:
        return (
          <AdaptiveDashboard
            onTabChange={setActiveTab}
            profile={profile}
            weeklyGrowth={stats?.weeklyGrowth || 0}
            hasPermission={hasPermission}
          />
        );
    }
  };

  return (
    <AuthGuard>
      <HelpProvider>
        <LayoutProvider>
          <AdaptiveLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
            <InteractiveTour />
            <HelpAssistant />
            <HelpButton variant="fab" showProgress />
          </AdaptiveLayout>
        </LayoutProvider>
      </HelpProvider>
    </AuthGuard>
  );
};
