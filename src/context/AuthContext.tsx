import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('user');
    const authToken = localStorage.getItem('authToken');
    
    // Vérifier que les données existent et ne sont pas "undefined"
    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null' && authToken && authToken !== 'undefined') {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.id) {
          setUser(parsedUser);
          console.log('🔐 Utilisateur restauré depuis localStorage:', parsedUser);
        } else {
          console.log('❌ Données utilisateur invalides, nettoyage...');
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        // Nettoyer les données corrompues
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    } else {
      // Nettoyer les données invalides
      if (savedUser === 'undefined' || authToken === 'undefined') {
        console.log('🧹 Nettoyage des données "undefined" du localStorage');
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔑 Tentative de connexion pour:', email);
      // Appel API réel avec Django backend
      const response = await authAPI.login(email, password);
      
      console.log('📡 Réponse API login:', response);
      
      if (response.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;
        
        // Vérifier que les données sont valides avant de les stocker
        if (userData && userData.id && token) {
          console.log('✅ Données de connexion valides:', { user: userData, token: token.substring(0, 20) + '...' });
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('authToken', token);
          
          console.log('💾 Données stockées dans localStorage');
        } else {
          console.error('❌ Données de connexion invalides:', response.data);
          return false;
        }
        
        // Forcer la mise à jour de l'interface
        setTimeout(() => {
          console.log('🔄 Déclenchement de l\'événement userChanged');
          window.dispatchEvent(new Event('userChanged'));
        }, 100);
        
        return true;
      } else {
        console.error('❌ Échec de la connexion:', response);
        return false;
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Déconnexion en cours...');
      await authAPI.logout();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
    
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    console.log('🧹 Données de session supprimées');
    
    // Forcer la mise à jour de l'interface
    setTimeout(() => {
      console.log('🔄 Déclenchement de l\'événement userChanged (logout)');
      window.dispatchEvent(new Event('userChanged'));
    }, 100);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};