import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { LoginModal } from './components/Common/LoginModal';
import { PublicView } from './components/Views/PublicView';
import { CollectorView } from './components/Views/CollectorView';
import { CoordinatorView } from './components/Views/CoordinatorView';
import { MunicipalityView } from './components/Views/MunicipalityView';
import { MapView } from './components/Views/MapView';
import { TruckTrackingView } from './components/Views/TruckTrackingView';
import { ReportView } from './components/Views/ReportView';
import { PRNAgentView } from './components/Views/PRNAgentView';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState(user ? 'dashboard' : 'home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Écouter les changements d'utilisateur pour forcer la mise à jour
  useEffect(() => {
    const handleUserChange = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('userChanged', handleUserChange);
    return () => window.removeEventListener('userChanged', handleUserChange);
  }, []);

  const handleMenuToggle = () => {
    if (user) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      // Pour les utilisateurs non connectés, on peut quand même ouvrir le menu
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setIsSidebarOpen(false); // Fermer la sidebar sur mobile après sélection
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const renderMainContent = () => {
    // Navigation disponible pour tous les utilisateurs
    switch (activeView) {
      case 'map':
        return <MapView />;
      
      case 'tracking':
        return <TruckTrackingView />;
      
      case 'home':
        return <PublicView />;
    }

    // Vues nécessitant une authentification
    if (!user) {
      return <PublicView />;
    }
    
    switch (activeView) {
      case 'reports':
        // Diriger vers l'onglet reports du CoordinatorView pour les coordinateurs
        if (user.role === 'coordinator') return <CoordinatorView initialTab='reports' />;
        return <ReportView />;
        
      case 'dashboard':
        // Tableau de bord spécifique selon le rôle
        if (user.role === 'collector') return <CollectorView />;
        if (user.role === 'coordinator') return <CoordinatorView />;
        if (user.role === 'municipality') return <MunicipalityView />;
        return <PublicView />;
      
      case 'schedule':
        if (user.role === 'collector') return <CollectorView />;
        return <PublicView />;
      /*case 'incidents':
        return <CollectorView />;*/
      
      case 'planning': 
        if (user.role === 'coordinator') return <CoordinatorView initialTab='planning' />;
        return <PublicView />;
       
      case 'teams':
        if (user.role === 'coordinator') return <CoordinatorView initialTab="teams" />;
        return <PublicView />;
      case 'trucks':
        if (user.role === 'coordinator') return <CoordinatorView initialTab='trucks' />;
        return <PublicView />;
      
      case 'statistics':
        if (user.role === 'municipality') return <MunicipalityView />;
        if (user.role === 'coordinator') return <CoordinatorView initialTab='statistics'/>;
        return <PublicView />;
      
      case 'overview':
        return <MunicipalityView />;
      
      case 'points':
        if (user.role === 'prn_agent') return <PRNAgentView />;
        return <PublicView />;
      
      case 'incidents':
        if (user.role === 'collector') return <CollectorView />;
        return <PublicView />;
      
      default:
        return <PublicView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuToggle={handleMenuToggle}
        isMobileMenuOpen={isSidebarOpen}
        onViewChange={handleViewChange}
        onLoginClick={handleLoginClick}
      />
      
      <div className="flex">
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          isOpen={isSidebarOpen}
        />
        
        <main className="flex-1 p-6">
          {renderMainContent()}
        </main>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;