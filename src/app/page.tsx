import { api } from '@/services/api';
import { DashboardView } from '@/components/DashboardView';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const dashboardData = await api.getDashboardStats();
  
  if (!dashboardData || !dashboardData.hoje) {
    return <div>Erro ao carregar os dados do dashboard. Verifique se a API está rodando.</div>;
  }

  return <DashboardView data={dashboardData} />;
}
