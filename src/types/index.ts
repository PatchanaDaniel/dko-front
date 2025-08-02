export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'collector' | 'coordinator' | 'municipality' | 'admin' | 'prn_agent';
  phone?: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  members: TeamMember[];
  status: 'active' | 'inactive';
  specialization: 'general' | 'recycling' | 'organic' | 'hazardous';
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'leader' | 'collector' | 'driver';
  phone?: string;
  email?: string;
  joinedAt: string;
}

export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'bin' | 'container' | 'recycling';
  status: 'empty' | 'half' | 'full' | 'overflow';
  lastCollection: string;
  nextCollection: string;
}

export interface Truck {
  id: string;
  plateNumber: string;
  driverId: string;
  driverName: string;
  current_location: {
    latitude: number;
    longitude: number;
  };
 
  status: 'available' | 'collecting' | 'maintenance' | 'offline' | 'unavailable';
  route: CollectionPoint[];
  estimatedTime?: number;
}

export interface Report {
  id: string;
  type: 'overflow' | 'damage' | 'illegal_dump' | 'missed_collection' | 'other';
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  reported_by: string;
  reporter_contact?: {
    name: string;
    phone?: string;
    email?: string;
  };
  reporter_type: 'citizen' | 'collector' | 'agent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  assignedTo?: string;
  images?: string[];
}

export interface Schedule {
  team_id: string;
  id: string;
  team: string;
  date: string;
  route: CollectionPoint[];
  truck: string;
  start_time: string;
  estimated_end_time: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Incident {
  id: string;
  type: 'traffic' | 'breakdown' | 'accident' | 'weather' | 'other';
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  reported_by: string;
  severity: 'low' | 'medium' | 'high';
  impact: string;
  estimatedDelay: number;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface Statistics {
  totalCollections: number;
  totalWaste: number;
  recyclingRate: number;
  efficiency: number;
  reportsResolved: number;
  averageResponseTime: number;
  period: string;
}

// API Interfaces for Django backend integration
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}