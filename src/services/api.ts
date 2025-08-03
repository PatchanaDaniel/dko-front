// API service layer for Django backend integration
// Ce fichier contient toutes les fonctions pour communiquer avec le backend Django

import { APIResponse, PaginatedResponse } from '../types';
import { 
  CollectionPoint, 
  Truck, 
  Report, 
  Schedule, 
  Incident, 
  Statistics, 
  User 
} from '../types';

// Configuration API
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
};

// Configuration de base pour les requêtes
const baseHeaders = {
  'Content-Type': 'application/json',
};

// Fonction utilitaire pour ajouter le token d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    ...baseHeaders,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fonction utilitaire pour gérer les erreurs HTTP
const handleResponse = async <T>(response: Response): Promise<APIResponse<T>> => {
  console.log('📡 Réponse HTTP:', response.status, response.statusText);
  const json = await response.json().catch(() => ({}));
  console.log('📄 Données JSON reçues:', json);
  
  if (!response.ok) {
    console.error('❌ Erreur HTTP:', response.status, json);
    return {
      success: false,
      message: json.message || `HTTP ${response.status}: ${response.statusText}`,
      data: null as T,
    };
  }
  console.log('✅ Réponse HTTP réussie');
  return {
    success: true,
    data: json,
  };
};

// === AUTHENTICATION SERVICES ===
export const authAPI = {
  // Connexion utilisateur
  login: async (email: string, password: string): Promise<APIResponse<{ token: string; user: User }>> => {
    console.log('🔐 Appel API login pour:', email);
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify({ email, password }),
    });
    console.log('📡 Réponse brute login:', response);
    return handleResponse(response);
  },

  // Déconnexion
  logout: async (): Promise<APIResponse<{}>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Récupérer le profil utilisateur
  getProfile: async (): Promise<APIResponse<User>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/profile/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// === COLLECTION POINTS SERVICES ===
export const collectionPointsAPI = {
  // Récupérer tous les points de collecte
  getAll: async (): Promise<APIResponse<PaginatedResponse<CollectionPoint>>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/collection-points/`, {
      headers: baseHeaders,
    });
    return handleResponse(response);
  },

  // Récupérer un point de collecte par ID
  getById: async (id: string): Promise<APIResponse<CollectionPoint>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/collection-points/${id}/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Mettre à jour le statut d'un point de collecte
  updateStatus: async (id: string, status: CollectionPoint['status']): Promise<APIResponse<CollectionPoint>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/collection-points/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },
};

// === TRUCKS SERVICES ===
export const trucksAPI = {
  // Récupérer tous les camions
  getAll: async (): Promise<APIResponse<PaginatedResponse<Truck>>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/trucks/`, {
      headers: baseHeaders,
    });
    return handleResponse(response);
  },

  // Créer un camion
  create: async (truck: Partial<Truck>): Promise<APIResponse<Truck>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/trucks/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(truck),
    });
    return handleResponse(response);
  },

  // Mettre à jour un camion
  update: async (id: string, updates: Partial<Truck>): Promise<APIResponse<Truck>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/trucks/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  // Supprimer un camion
  delete: async (id: string): Promise<APIResponse<{}>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/trucks/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Mettre à jour la position d'un camion
  updateLocation: async (id: string, location: { latitude: number; longitude: number }): Promise<APIResponse<Truck>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/trucks/${id}/update_location/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ current_location: location }),
    });
    return handleResponse(response);
  },

  // Mettre à jour le statut d'un camion
  updateStatus: async (id: string, status: Truck['status']): Promise<APIResponse<Truck>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/trucks/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  // Mettre à jour le temps estimé d'un camion
  updateEstimatedTime: async (id: string, data: { 
    estimated_time: number; 
    next_collection_point_id: string;
    last_updated?: string;
  }): Promise<APIResponse<Truck>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/trucks/${id}/estimated-time/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// === REPORTS SERVICES ===
export const reportsAPI = {
  // Récupérer tous les signalements
  getAll: async (): Promise<APIResponse<PaginatedResponse<Report>>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/reports/`, {
      headers: baseHeaders,
    });
    return handleResponse(response);
  },

  // Créer un nouveau signalement
  create: async (report: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<APIResponse<Report>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/reports/`, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify(report),
    });
    return handleResponse(response);
  },

  // Mettre à jour un signalement
  update: async (id: string, updates: Partial<Report>): Promise<APIResponse<Report>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/reports/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  // Supprimer un signalement
  delete: async (id: string): Promise<APIResponse<{}>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/reports/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Assigner une équipe à un signalement
  assignTeam: async (reportId: string, teamId: string): Promise<APIResponse<Report>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/reports/${reportId}/assign-team/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ team_id: teamId }),
    });
    return handleResponse(response);
  },

  // Récupérer un signalement par ID
  getById: async (id: string): Promise<APIResponse<Report>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/reports/${id}/`, {
      headers: baseHeaders,
    });
    return handleResponse(response);
  },
};

// === SCHEDULES SERVICES ===
export const schedulesAPI = {
  // Récupérer tous les plannings
  getAll: async (): Promise<APIResponse<PaginatedResponse<Schedule>>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/schedules/`, {
      headers: baseHeaders,
    });
    return handleResponse(response);
  },

  // Créer un nouveau planning
  create: async (schedule: Omit<Schedule, 'id'>): Promise<APIResponse<Schedule>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/schedules/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(schedule),
    });
    return handleResponse(response);
  },

  // Mettre à jour un planning
  update: async (id: string, updates: Partial<Schedule>): Promise<APIResponse<Schedule>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/schedules/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  // Supprimer un planning
  delete: async (id: string): Promise<APIResponse<null>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/schedules/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// === INCIDENTS SERVICES ===
export const incidentsAPI = {
  // Récupérer tous les incidents
  getAll: async (): Promise<APIResponse<PaginatedResponse<Incident>>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/incidents/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Créer un nouvel incident
  create: async (incident: Omit<Incident, 'id' | 'createdAt'>): Promise<APIResponse<Incident>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/incidents/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(incident),
    });
    return handleResponse(response);
  },

  // Résoudre un incident
  resolve: async (id: string): Promise<APIResponse<Incident>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/incidents/${id}/resolve/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// === STATISTICS SERVICES ===
export const statisticsAPI = {
  // Récupérer les statistiques
  get: async (period?: string): Promise<APIResponse<Statistics>> => {
    const url = period 
      ? `${API_CONFIG.BASE_URL}/statistics/?period=${period}`
      : `${API_CONFIG.BASE_URL}/statistics/`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// === USERS SERVICES ===
export const usersAPI = {
  // Récupérer tous les utilisateurs (admin uniquement)
  getAll: async (): Promise<APIResponse<PaginatedResponse<User>>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Créer un nouvel utilisateur
  create: async (user: Omit<User, 'id'>): Promise<APIResponse<User>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    return handleResponse(response);
  },

  // Mettre à jour un utilisateur
  update: async (id: string, updates: Partial<User>): Promise<APIResponse<User>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  // Supprimer un utilisateur
  delete: async (id: string): Promise<APIResponse<{}>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// === TEAMS SERVICES ===
export const teamsAPI = {
  // Récupérer toutes les équipes
  getAll: async (): Promise<APIResponse<PaginatedResponse<any>>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/teams/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Créer une nouvelle équipe
  create: async (team: Partial<any>): Promise<APIResponse<any>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/teams/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(team),
    });
    return handleResponse(response);
  },

  // Mettre à jour une équipe
  update: async (id: string, updates: Partial<any>): Promise<APIResponse<any>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/teams/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  // Supprimer une équipe
  delete: async (id: string): Promise<APIResponse<{}>> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/teams/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};