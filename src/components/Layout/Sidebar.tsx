import React from 'react';
import { 
  Map, 
  Truck, 
  AlertTriangle, 
  Calendar, 
  BarChart3, 
  Users, 
  Settings,
  Home,
  ClipboardList,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    // Menu de base accessible à tous
    const baseItems = [
      { id: 'home', label: 'Accueil', icon: Home },
      { id: 'map', label: 'Carte interactive', icon: Map },
      { id: 'tracking', label: 'Suivi camions', icon: Truck },
    ];

    if (!user) {
      return baseItems;
    }

    // Ajouter le dashboard pour les utilisateurs connectés
    const authenticatedItems = [
      { id: 'dashboard', label: 'Tableau de bord', icon: Home },
      ...baseItems.slice(1), // Exclure l'accueil pour les connectés
    ];
    
    switch (user.role) {
      case 'citizen':
        return [
          ...authenticatedItems,
          { id: 'incidents', label: 'Signaler incident', icon: AlertTriangle },
        ];

      case 'collector':
        return [
          ...authenticatedItems,
          { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
          { id: 'schedule', label: 'Mon planning', icon: Calendar },
        ];

      case 'coordinator':
        return [
          ...authenticatedItems,
          { id: 'planning', label: 'Planification', icon: Calendar },
          { id: 'reports', label: 'Signalements', icon: AlertTriangle },
          { id: 'teams', label: 'Équipes', icon: Users },
          { id: 'trucks', label: 'Camions', icon: Truck },
          { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
        ];

      case 'municipality':
        return [
          ...authenticatedItems,
          { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
          { id: 'reports', label: 'Signalements', icon: AlertTriangle },
          { id: 'planning', label: 'Planning', icon: Calendar },
          { id: 'overview', label: 'Vue d\'ensemble', icon: Map },
        ];

      case 'admin':
        return [
          ...authenticatedItems,
          { id: 'users', label: 'Utilisateurs', icon: Users },
          { id: 'reports', label: 'Signalements', icon: AlertTriangle },
          { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
          { id: 'planning', label: 'Planification', icon: Calendar },
          { id: 'settings', label: 'Paramètres', icon: Settings },
        ];

      case 'prn_agent':
        return [
          ...authenticatedItems,
          { id: 'points', label: 'Points de collecte', icon: MapPin },
          { id: 'reports', label: 'Mes signalements', icon: AlertTriangle },
        ];

      default:
        return authenticatedItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => onViewChange(activeView)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:shadow-none md:border-r md:border-gray-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header sidebar - visible uniquement sur mobile */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer info utilisateur */}
          {user && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Connecté en tant que
              </div>
              <div className="text-sm font-medium text-gray-900">
                <div>
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user.name || user.email}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {user.role === 'citizen' ? 'Citoyen' : 
                   user.role === 'collector' ? 'Équipe de collecte' :
                   user.role === 'coordinator' ? 'Coordinateur' :
                   user.role === 'municipality' ? 'Municipalité' : 
                   user.role === 'prn_agent' ? 'Agent PRN' : 'Administrateur'}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};