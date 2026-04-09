import { useState } from 'react';
import AdminPasswordGate from '@/components/cinema/AdminPasswordGate';
import AdminSidebar, { type AdminPage } from '@/components/admin/AdminSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminFilmes from '@/components/admin/AdminFilmes';
import AdminPagamentos from '@/components/admin/AdminPagamentos';
import AdminConfiguracoes from '@/components/admin/AdminConfiguracoes';
import AdminProtecao from '@/components/admin/AdminProtecao';

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('admin_authenticated') === 'true'
  );
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  if (!authenticated) {
    return <AdminPasswordGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setAuthenticated(false);
  };

  const handleNewMovie = () => {
    setCurrentPage('filmes');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />
      <main className="flex-1 p-4 lg:p-6 overflow-auto pt-20 lg:pt-6">
        {currentPage === 'dashboard' && <AdminDashboard onNavigate={setCurrentPage} onNewMovie={handleNewMovie} />}
        {currentPage === 'filmes' && <AdminFilmes />}
        {currentPage === 'pagamentos' && <AdminPagamentos />}
        {currentPage === 'protecao' && <AdminProtecao />}
        {currentPage === 'configuracoes' && <AdminConfiguracoes />}
      </main>
    </div>
  );
}
