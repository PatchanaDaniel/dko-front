import React from 'react';
import { Recycle, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  onViewChange: (view: string) => void;
  onLoginClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen, onViewChange, onLoginClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et nom */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center ml-2 md:ml-0">
              <Recycle className="h-8 w-8 text-green-600" />
              <div className="ml-2">
                <h1 className="text-xl font-bold text-gray-900">Déchets KO</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Gestion intelligente des déchets</p>
              </div>
            </div>
          </div>

          {/* Navigation principale - caché sur mobile */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => onViewChange('map')}
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Carte interactive
            </button>
            <button 
              onClick={() => onViewChange('tracking')}
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Suivi camions
            </button>
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700 hidden sm:block">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user.name || user.email}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {user.role === 'citizen' ? 'Citoyen' : 
                     user.role === 'collector' ? 'Collecteur' :
                     user.role === 'coordinator' ? 'Coordinateur' :
                     user.role === 'municipality' ? 'Municipalité' : 
                     user.role === 'prn_agent' ? 'Agent PRN' : 'Admin'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm hidden sm:block">Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={onLoginClick}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Se connecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-3 space-y-1">
            <button 
              onClick={() => onViewChange('map')}
              className="w-full text-left block text-gray-700 hover:text-green-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Carte interactive
            </button>
            <button 
              onClick={() => onViewChange('tracking')}
              className="w-full text-left block text-gray-700 hover:text-green-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Suivi camions
            </button>
            <button 
              onClick={() => onViewChange('report')}
              className="w-full text-left block text-gray-700 hover:text-green-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Signaler un problème
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};