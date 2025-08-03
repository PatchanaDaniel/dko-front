import { CollectionPoint, Truck, Report, Schedule, Incident, Statistics, User, Team } from '../types';

// Utilisateurs avec contexte sénégalais
export const mockUsers: User[] = [
  { id: '1', name: 'Amadou Diallo', email: 'amadou@citizen.sn', role: 'citizen', phone: '+221701234567' },
  { id: '2', name: 'Mohamed Diop', email: 'mohamed@dechetsko.com', role: 'collector', phone: '+221702345678', teamId: 'team-alpha' },
  { id: '3', name: 'Omar Coordinator', email: 'omar@dechetsko.com', role: 'coordinator', phone: '+221703456789' },
  { id: '4', name: 'Maire Municipal', email: 'maire@mairiedakar.com', role: 'municipality', phone: '+221704567890' },
  { id: '5', name: 'Agent PRN', email: 'agent@dechetsko.com', role: 'prn_agent', phone: '+221705678901' },
  { id: '6', name: 'Daniel Tchaamie', email: 'daniel@dechetsko.com', role: 'collector', phone: '+221706789012', teamId: 'team-gamma' },
  { id: '7', name: 'Mamadou Seck', email: 'mamadou@dechetsko.com', role: 'collector', phone: '+221707890123', teamId: 'team-alpha' },
  { id: '8', name: 'Fatou Ba', email: 'fatou@dechetsko.com', role: 'collector', phone: '+221708901234', teamId: 'team-beta' },
];

// Équipes avec leaders sénégalais
export const mockTeams: Team[] = [
  {
    id: 'team-alpha',
    name: 'Équipe Alpha',
    leaderId: '2',
    leaderName: 'Mohamed Diop',
    status: 'active',
    specialization: 'general',
    createdAt: '2024-01-15T08:00:00Z',
    members: [
      {
        id: '2',
        name: 'Mohamed Diop',
        role: 'leader',
        phone: '+221702345678',
        email: 'mohamed@dechetsko.com',
        joinedAt: '2024-01-15T08:00:00Z'
      },
      {
        id: '7',
        name: 'Mamadou Seck',
        role: 'collector',
        phone: '+221707890123',
        email: 'mamadou@dechetsko.com',
        joinedAt: '2024-02-01T08:00:00Z'
      },
      {
        id: '9',
        name: 'Ibrahima Fall',
        role: 'driver',
        phone: '+221709012345',
        email: 'ibrahima@dechetsko.com',
        joinedAt: '2025-01-20T08:00:00Z'
      }
    ]
  },
  {
    id: 'team-beta',
    name: 'Équipe Beta',
    leaderId: '8',
    leaderName: 'Fatou Ba',
    status: 'active',
    specialization: 'recycling',
    createdAt: '2025-01-20T08:00:00Z',
    members: [
      {
        id: '8',
        name: 'Fatou Ba',
        role: 'leader',
        phone: '+221708901234',
        email: 'fatou@dechetsko.com',
        joinedAt: '2025-01-20T08:00:00Z'
      },
      {
        id: '10',
        name: 'Ousmane Ndiaye',
        role: 'collector',
        phone: '+221710123456',
        email: 'ousmane@dechetsko.com',
        joinedAt: '2025-02-10T08:00:00Z'
      }
    ]
  },
  {
    id: 'team-gamma',
    name: 'Équipe Gamma',
    leaderId: '6',
    leaderName: 'Daniel Tchaamie',
    status: 'active',
    specialization: 'organic',
    createdAt: '2025-02-01T08:00:00Z',
    members: [
      {
        id: '6',
        name: 'Daniel Tchaamie',
        role: 'leader',
        phone: '+221706789012',
        email: 'daniel@dechetsko.com',
        joinedAt: '2025-02-01T08:00:00Z'
      }
    ]
  }
];

// Points de collecte dans les quartiers de Dakar
export const mockCollectionPoints: CollectionPoint[] = [
  {
    id: '1',
    name: 'Marché de Yoff',
    address: 'Avenue Léopold Sédar Senghor, Yoff, Dakar',
    latitude: 14.7395,
    longitude: -17.4734,
    type: 'container',
    status: 'half',
    lastCollection: '2025-01-15T08:00:00Z',
    nextCollection: '2025-01-17T08:00:00Z'
  },
  {
    id: '2',
    name: 'Ouest Foire Centre',
    address: 'Route de l\'Aéroport, Ouest Foire, Dakar',
    latitude: 14.7167,
    longitude: -17.4833,
    type: 'bin',
    status: 'full',
    lastCollection: '2025-01-14T10:30:00Z',
    nextCollection: '2025-01-16T10:30:00Z'
  },
  {
    id: '3',
    name: 'HLM Grand Yoff',
    address: 'Cité HLM Grand Yoff, Dakar',
    latitude: 14.7500,
    longitude: -17.4667,
    type: 'recycling',
    status: 'empty',
    lastCollection: '2025-01-15T14:00:00Z',
    nextCollection: '2025-01-18T14:00:00Z'
  },
  {
    id: '4',
    name: 'Point E',
    address: 'Avenue Cheikh Anta Diop, Point E, Dakar',
    latitude: 14.6928,
    longitude: -17.4467,
    type: 'container',
    status: 'overflow',
    lastCollection: '2025-01-13T16:00:00Z',
    nextCollection: '2025-01-16T09:00:00Z'
  },
  {
    id: '5',
    name: 'Mbao Centre',
    address: 'Route Nationale, Mbao, Pikine',
    latitude: 14.7297,
    longitude: -17.3436,
    type: 'container',
    status: 'half',
    lastCollection: '2025-01-15T11:00:00Z',
    nextCollection: '2025-01-17T11:00:00Z'
  },
  {
    id: '6',
    name: 'Ouakam Village',
    address: 'Route de la Corniche Ouest, Ouakam, Dakar',
    latitude: 14.7167,
    longitude: -17.5000,
    type: 'bin',
    status: 'full',
    lastCollection: '2025-01-14T15:00:00Z',
    nextCollection: '2025-01-16T15:00:00Z'
  },
  {
    id: '7',
    name: 'Ngor Almadies',
    address: 'Route des Almadies, Ngor, Dakar',
    latitude: 14.7500,
    longitude: -17.5167,
    type: 'recycling',
    status: 'empty',
    lastCollection: '2025-01-15T09:00:00Z',
    nextCollection: '2025-01-18T09:00:00Z'
  },
  {
    id: '8',
    name: 'Guédiawaye Marché',
    address: 'Marché Central, Guédiawaye',
    latitude: 14.7667,
    longitude: -17.4167,
    type: 'container',
    status: 'full',
    lastCollection: '2025-01-14T12:00:00Z',
    nextCollection: '2025-01-16T12:00:00Z'
  },
  {
    id: '9',
    name: 'Pikine Icotaf',
    address: 'Avenue Blaise Diagne, Pikine',
    latitude: 14.7547,
    longitude: -17.3928,
    type: 'bin',
    status: 'half',
    lastCollection: '2025-01-15T13:00:00Z',
    nextCollection: '2025-01-17T13:00:00Z'
  },
  {
    id: '10',
    name: 'Dakar Plateau',
    address: 'Place de l\'Indépendance, Dakar Plateau',
    latitude: 14.6928,
    longitude: -17.4467,
    type: 'container',
    status: 'empty',
    lastCollection: '2025-01-15T16:00:00Z',
    nextCollection: '2025-01-18T16:00:00Z'
  }
];

// Camions avec immatriculations sénégalaises
export const mockTrucks: Truck[] = [
  {
    id: '1',
    plate_number: 'DK-2024-AB',
    driverId: '2',
    driverName: 'Mohamed Diop',
    current_location: { latitude: 14.7395, longitude: -17.4734 },
    status: 'collecting',
    route: [mockCollectionPoints[0], mockCollectionPoints[1]],
    estimatedTime: 15
  },
  {
    id: '2',
    plate_number: 'DK-2024-CD',
    driverId: '8',
    driverName: 'Fatou Ba',
    current_location: { latitude: 14.7167, longitude: -17.5000 },
    status: 'available',
    route: [mockCollectionPoints[5]],
    estimatedTime: 30
  },
  {
    id: '3',
    plate_number: 'DK-2024-EF',
    driverId: '6',
    driverName: 'Daniel Tchaamie',
    current_location: { latitude: 14.6928, longitude: -17.4467 },
    status: 'maintenance',
    route: [],
  }
];

// Fonction pour mettre à jour la position d'un camion (simulation)
export const updateTruckLocation = (truckId: string, location: {latitude: number, longitude: number}) => {
  const truck = mockTrucks.find(t => t.id === truckId);
  if (truck) {
    truck.current_location = location;
    console.log(`Position du camion ${truck.plate_number} mise à jour:`, location);
  }
};

// Signalements avec adresses sénégalaises
export const mockReports: Report[] = [
  {
    id: '1',
    type: 'overflow',
    description: 'Conteneur débordant depuis 2 jours au marché de Yoff, odeurs nauséabondes',
    location: {
      latitude: 14.7395,
      longitude: -17.4734,
      address: 'Marché de Yoff, Avenue Léopold Sédar Senghor'
    },
    reported_by: 'Citoyen anonyme',
    reporter_contact: {
      name: 'Amadou Diallo',
      phone: '+221701234567',
      
    },
    reporter_type: 'citizen',
    status: 'pending',
    priority: 'high',
    createdAt: '2025-01-15T09:30:00Z'
  },
  {
    id: '2',
    type: 'damage',
    description: 'Poubelle cassée à Ouest Foire, couvercle arraché par le vent',
    location: {
      latitude: 14.7167,
      longitude: -17.4833,
      address: 'Route de l\'Aéroport, Ouest Foire'
    },
    reported_by: 'Mohamed Diop',
    reporter_contact: {
      name: 'Mohamed Diop',
      phone: '+221702345678',
      
    },
    reporter_type: 'collector',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2025-01-14T16:45:00Z',
    assignedTo: 'Équipe maintenance'
  },
  {
    id: '3',
    type: 'missed_collection',
    description: 'Collecte non effectuée selon le planning à Point E',
    location: {
      latitude: 14.6928,
      longitude: -17.4467,
      address: 'Avenue Cheikh Anta Diop, Point E'
    },
    reported_by: 'Agent PRN',
    reporter_contact: {
      name: 'Agent PRN Service',
      phone: '+221705678901',
      email: 'agent@dechetsko.com'
    },
    reporter_type: 'agent',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2025-01-13T11:20:00Z',
    assignedTo: 'Équipe Alpha'
  }
];

// Plannings adaptés aux quartiers de Dakar
export const mockSchedules: Schedule[] = [
  {
    id: '1',
    team_id: 'team-alpha',
    team: 'team-alpha',
    date: '2025-01-16',
    route: [mockCollectionPoints[0], mockCollectionPoints[1], mockCollectionPoints[4]],
    truck: '1',
    start_time: '08:00',
    estimated_end_time: '12:00',
    status: 'planned'
  },
  {
    id: '2',
    team_id: 'team-beta',
    team: 'team-beta',
    date: '2025-01-16',
    route: [mockCollectionPoints[5], mockCollectionPoints[6]],
    truck: '2',
    start_time: '09:00',
    estimated_end_time: '13:00',
    status: 'in_progress'
  },
  {
    id: '3',
    team_id: 'team-gamma',
    team: 'team-gamma',
    date: '2025-01-17',
    route: [mockCollectionPoints[7], mockCollectionPoints[8], mockCollectionPoints[9]],
    truck: '3',
    start_time: '14:00',
    estimated_end_time: '16:00',
    status: 'planned'
  }
];

// Incidents avec contexte dakarois
export const mockIncidents: Incident[] = [
  {
    id: '1',
    type: 'traffic',
    description: 'Embouteillage important sur la VDN suite à un accident',
    location: {
      latitude: 14.7167,
      longitude: -17.4500,
      address: 'Voie de Dégagement Nord (VDN)'
    },
    reported_by: 'Fatou Ba',
    severity: 'high',
    impact: 'Retard de 45 minutes sur la collecte à Ouest Foire',
    estimatedDelay: 45,
    status: 'active',
    createdAt: '2025-01-15T10:15:00Z'
  },
  {
    id: '2',
    type: 'breakdown',
    description: 'Panne moteur du camion DK-2024-EF à Guédiawaye',
    location: {
      latitude: 14.7667,
      longitude: -17.4167,
      address: 'Marché Central, Guédiawaye'
    },
    reported_by: 'Daniel Tchaamie',
    severity: 'high',
    impact: 'Camion immobilisé, besoin de remplacement urgent',
    estimatedDelay: 120,
    status: 'active',
    createdAt: '2025-01-15T07:30:00Z'
  }
];

// Statistiques pour Dakar
export const mockStatistics: Statistics = {
  totalCollections: 1847,
  totalWaste: 12435, // en tonnes
  recyclingRate: 45.8, // en pourcentage (plus réaliste pour Dakar)
  efficiency: 78.2, // en pourcentage
  reportsResolved: 234,
  averageResponseTime: 6.5, // en heures
  period: 'Janvier 2025'
};

// Données détaillées pour les statistiques avancées (contexte Dakar)
export const detailedStatistics = {
  monthlyData: [
    { month: 'Jan', collections: 1847, waste: 12435,  efficiency: 78.2 },
    { month: 'Fév', collections: 1756, waste: 11892,  efficiency: 81.5 },
    { month: 'Mar', collections: 1934, waste: 13123,  efficiency: 77.8 },
    { month: 'Avr', collections: 1889, waste: 12756,  efficiency: 80.1 },
    { month: 'Mai', collections: 1998, waste: 13567, efficiency: 78.9 },
    { month: 'Jun', collections: 2045, waste: 13834, efficiency: 82.3 }
  ],
  
  weeklyPerformance: [
    { week: 'S1', collections: 462, efficiency: 82.1, incidents: 3,  },
    { week: 'S2', collections: 448, efficiency: 79.7, incidents: 2,  },
    { week: 'S3', collections: 484, efficiency: 81.3, incidents: 4,  },
    { week: 'S4', collections: 453, efficiency: 77.8, incidents: 3,  }
  ],
  
  wasteTypes: [
    { type: 'Ordures ménagères', quantity: 7834, percentage: 63.0, color: '#EF4444' },
    { type: 'Déchets organiques', quantity: 3156, percentage: 25.4, color: '#84CC16' },
    { type: 'Recyclables', quantity: 1078, percentage: 8.7, color: '#10B981' },
    { type: 'Autres déchets', quantity: 367, percentage: 2.9, color: '#6B7280' }
  ],
  
  districtPerformance: [
    { district: 'Dakar Plateau', collections: 334, efficiency: 84.2, population: 25000, wastePerCapita: 1.1 },
    { district: 'Yoff', collections: 289, efficiency: 77.5, population: 22000, wastePerCapita: 1.3 },
    { district: 'Ouest Foire', collections: 398, efficiency: 81.8, population: 28500, wastePerCapita: 1.2 },
    { district: 'Pikine', collections: 456, efficiency: 75.3, population: 35800, wastePerCapita: 1.5 },
    { district: 'Guédiawaye', collections: 370, efficiency: 79.7, population: 31200, wastePerCapita: 1.4 }
  ],
  
  environmentalImpact: {
    co2Saved: 134.5, // tonnes
    recyclingRate: 45.8,
    wasteReduction: 8.3, // pourcentage vs année précédente
    energyRecovered: 856, // MWh
    composting: 156.2 // tonnes
  },
  
  citizenSatisfaction: {
    overallRating: 3.8,
    responseTime: 3.6,
    serviceQuality: 4.0,
    communication: 3.5,
    totalSurveys: 847,
    complaints: 43,
    compliments: 67
  },
  
  costAnalysis: {
    totalBudget: 45000000, // 45 millions FCFA
    totalSpent: 41100000,  // 41.1 millions FCFA
    categories: [
      {
        category: 'Carburant',
        amount: 11100000, // 11.1 millions FCFA
        budget: 12000000, // 12 millions FCFA
        percentage: 27.0
      },
      {
        category: 'Maintenance véhicules',
        amount: 7380000,  // 7.38 millions FCFA
        budget: 9000000,  // 9 millions FCFA
        percentage: 17.9
      },
      {
        category: 'Salaires équipes',
        amount: 16800000, // 16.8 millions FCFA
        budget: 15000000, // 15 millions FCFA
        percentage: 40.9
      },
      {
        category: 'Équipements',
        amount: 3120000,  // 3.12 millions FCFA
        budget: 4800000,  // 4.8 millions FCFA
        percentage: 7.6
      },
      {
        category: 'Autres frais',
        amount: 2700000,  // 2.7 millions FCFA
        budget: 4200000,  // 4.2 millions FCFA
        percentage: 6.6
      }
    ]
  }
};