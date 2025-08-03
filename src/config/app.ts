// Configuration de l'application DKO-Front

export const APP_CONFIG = {
  // Informations générales
  APP_NAME: 'DKO - Système de Gestion des Déchets',
  VERSION: '1.0.0',
  
  // Configuration API
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    TIMEOUT: 30000, // 30 secondes
  },
  
  // Configuration GPS
  GPS: {
    UPDATE_INTERVAL: 30000, // 30 secondes
    HIGH_ACCURACY: true,
    TIMEOUT: 10000,
    MAX_AGE: 60000,
  },
  
  // Configuration des plannings
  SCHEDULING: {
    DEFAULT_COLLECTION_TIME: 30, // minutes par point
    MIN_POINTS_PER_ROUTE: 1,
    MAX_POINTS_PER_ROUTE: 20,
    WORKING_HOURS: {
      START: '06:00',
      END: '18:00',
    },
  },
  
  // Statuts
  STATUSES: {
    TRUCK: {
      AVAILABLE: 'available',
      COLLECTING: 'collecting',
      MAINTENANCE: 'maintenance',
      OFFLINE: 'offline',
      UNAVAILABLE: 'unavailable',
    },
    COLLECTION_POINT: {
      EMPTY: 'empty',
      HALF: 'half',
      FULL: 'full',
      OVERFLOW: 'overflow',
    },
    SCHEDULE: {
      PLANNED: 'planned',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    },
    REPORT: {
      PENDING: 'pending',
      IN_PROGRESS: 'in_progress',
      RESOLVED: 'resolved',
      CLOSED: 'closed',
    },
  },
  
  // Priorités
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  
  // Types d'utilisateurs
  USER_ROLES: {
    CITIZEN: 'citizen',
    COLLECTOR: 'collector',
    COORDINATOR: 'coordinator',
    MUNICIPALITY: 'municipality',
    ADMIN: 'admin',
    PRN_AGENT: 'prn_agent',
  },
  
  // Localisation par défaut (Dakar)
  DEFAULT_LOCATION: {
    latitude: 14.6928,
    longitude: -17.4467,
    zoom: 12,
  },
  
  // Configuration de devise (Sénégal)
  CURRENCY: {
    CODE: 'XOF', // Code ISO du Franc CFA
    SYMBOL: 'FCFA',
    NAME: 'Franc CFA',
    EURO_RATE: 655.957, // 1 EUR = 655.957 FCFA (taux fixe)
  },
  
  // Messages
  MESSAGES: {
    ERRORS: {
      NETWORK: 'Erreur de connexion. Vérifiez votre connexion internet.',
      UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
      NOT_FOUND: 'Ressource non trouvée.',
      SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
      GPS_NOT_SUPPORTED: 'La géolocalisation n\'est pas supportée par ce navigateur.',
      GPS_PERMISSION_DENIED: 'Permission de géolocalisation refusée.',
    },
    SUCCESS: {
      SCHEDULE_CREATED: 'Planning créé avec succès !',
      TRUCK_STATUS_UPDATED: 'Statut du camion mis à jour avec succès !',
      COLLECTION_CONFIRMED: 'Collecte confirmée avec succès !',
      INCIDENT_REPORTED: 'Incident signalé avec succès !',
    },
  },
};

// Types pour la configuration
export type TruckStatus = keyof typeof APP_CONFIG.STATUSES.TRUCK;
export type CollectionPointStatus = keyof typeof APP_CONFIG.STATUSES.COLLECTION_POINT;
export type ScheduleStatus = keyof typeof APP_CONFIG.STATUSES.SCHEDULE;
export type ReportStatus = keyof typeof APP_CONFIG.STATUSES.REPORT;
export type Priority = keyof typeof APP_CONFIG.PRIORITIES;
export type UserRole = keyof typeof APP_CONFIG.USER_ROLES;
