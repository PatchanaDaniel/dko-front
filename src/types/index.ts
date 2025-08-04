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
  leader_name: string;
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
  type: 'bin' | 'container' | 'depot' | 'recycling';
  status: 'empty' | 'quarter' | 'half' | 'full' | 'overflow';
  capacity?: number;
  lastCollection?: string;
  nextCollection?: string;
  collections_this_month?: number;
}

export interface Truck {
  id: string;
  plate_number: string;
  driver?: string; // ID du conducteur
  driverId?: string; // Alias pour driver
  driver_name: string;
  status: 'collecting' | 'available' | 'maintenance' | 'offline' | 'unavailable';
  current_location?: {
    latitude: number;
    longitude: number;
  };
  route: CollectionPoint[];
  estimatedTime?: number;
  // New fields for backend estimated times
  estimated_time_to_next_point?: number;
  next_collection_point_id?: string;
  estimated_time_last_updated?: string;
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
  team_name?: string;
  truck_id?: string;
  date: string;
  route: ScheduleRoute[];
  truck: string;
  start_time: string;
  estimated_end_time: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

export interface ScheduleRoute {
  id: string;
  collection_point: CollectionPoint;
  order: number;
  completed: boolean;
  estimated_time?: string;
  estimated_arrival_time?: string;
  travel_time_minutes?: number;
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