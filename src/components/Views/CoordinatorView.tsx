import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Users, 
  Truck, 
  ClipboardList, 
  BarChart3, 
  Plus, 
  Edit,
  UserPlus,
  MapPin,
  Clock,
  TrendingUp,
  Target,
  AlertTriangle,
  Home,
  DollarSign,
  Activity,
  Crown,
  Trash2
} from 'lucide-react';
import { mockReports, mockTrucks, mockStatistics, mockCollectionPoints, detailedStatistics } from '../../data/mockData';
import { PlanningModal } from '../Common/PlanningModal';
import { TeamModal } from '../Common/TeamModal';
import ReportsView from './ReportsView';
import { Team, User, Schedule, Truck as TruckType } from '../../types';
import { trucksAPI, usersAPI, teamsAPI, schedulesAPI } from '../../services/api';

export const CoordinatorView: React.FC <{ initialTab?: string }> = ({ initialTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamModalMode, setTeamModalMode] = useState<'create' | 'edit'>('create');

  // State for trucks CRUD
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [loadingTrucks, setLoadingTrucks] = useState(true);
  const [truckForm, setTruckForm] = useState<Partial<TruckType> | null>(null);
  const [truckModalMode, setTruckModalMode] = useState<'create' | 'edit'>('create');
  const [showTruckModal, setShowTruckModal] = useState(false);

  // State for users (conducteurs)
  const [collectors, setCollectors] = useState<User[]>([]);

  // State for teams CRUD
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // State for schedules CRUD
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [scheduleModalMode, setScheduleModalMode] = useState<'create' | 'edit'>('create');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Données pour le coordinateur
  const pendingReports = mockReports.filter(r => r.status === 'pending');
  const inProgressReports = mockReports.filter(r => r.status === 'in_progress');
  // Calculs basés sur les vraies données
  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules.filter(s => s.date === today);
  const activeTrucks = mockTrucks.filter(t => t.status !== 'maintenance');
  const overflowPoints = mockCollectionPoints.filter(p => p.status === 'overflow');
  const fullPoints = mockCollectionPoints.filter(p => p.status === 'full');

  const quickStats = [
    { label: 'Signalements en attente', value: pendingReports.length, color: 'red', icon: AlertTriangle },
    { label: 'Collectes du jour', value: todaySchedules.length, color: 'blue', icon: Calendar },
    { label: 'Camions disponibles', value: activeTrucks.length, color: 'green', icon: Truck },
    { label: 'Efficacité moyenne', value: `${mockStatistics.efficiency}%`, color: 'purple', icon: TrendingUp },
  ];

  const getStatColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-100 text-red-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const weeklyStats = [
    { day: 'Lun', collections: 45, efficiency: 92 },
    { day: 'Mar', collections: 52, efficiency: 88 },
    { day: 'Mer', collections: 48, efficiency: 95 },
    { day: 'Jeu', collections: 51, efficiency: 89 },
    { day: 'Ven', collections: 47, efficiency: 93 },
    { day: 'Sam', collections: 38, efficiency: 87 },
    { day: 'Dim', collections: 25, efficiency: 91 },
  ];

  const teamPerformance = [
    { team: 'Équipe Alpha', collections: 156, efficiency: 94, incidents: 2 },
    { team: 'Équipe Beta', collections: 142, efficiency: 89, incidents: 1 },
    { team: 'Équipe Gamma', collections: 138, efficiency: 91, incidents: 3 },
    { team: 'Équipe Delta', collections: 149, efficiency: 87, incidents: 0 },
  ];

  // Load trucks from API
  useEffect(() => {
    if (activeTab === 'trucks') {
      setLoadingTrucks(true);
      trucksAPI.getAll().then(res => {
        if (res.success && res.data?.results) setTrucks(res.data.results);
        setLoadingTrucks(false);
      });
    }
  }, [activeTab]);

  // Load collectors for the conducteur select
  useEffect(() => {
    if (showTruckModal) {
      usersAPI.getAll().then(res => {
        if (res.success && res.data?.results) {
          setCollectors(res.data.results.filter((u: User) => u.role === 'collector'));
        }
      });
    }
  }, [showTruckModal]);

  // Load teams from API
  useEffect(() => {
    if (activeTab === 'teams') {
      setLoadingTeams(true);
      teamsAPI.getAll().then(res => {
        if (res.success && res.data?.results) {
          setTeams(res.data.results);
        }
        setLoadingTeams(false);
      });
    }
  }, [activeTab]);

  // CRUD handlers
  const handleCreateTruck = async (truck: Partial<TruckType>) => {
    const res = await trucksAPI.create(truck as any);
    if (res.success && res.data) {
      setTrucks(prev => [...prev, res.data]);
      setShowTruckModal(false);
    }
  };

  const handleUpdateTruck = async (id: string, updates: Partial<TruckType>) => {
    const res = await trucksAPI.update(id, updates);
    if (res.success && res.data) {
      setTrucks(prev => prev.map(t => t.id === id ? res.data : t));
      setShowTruckModal(false);
    }
  };

  const handleDeleteTruck = async (id: string) => {
    if (!window.confirm('Supprimer ce camion ?')) return;
    const res = await trucksAPI.delete(id);
    if (res.success) {
      setTrucks(prev => prev.filter(t => t.id !== id));
    }
  };

  // Team CRUD handlers
  const handleCreateTeam = async (team: Partial<Team>) => {
    const res = await teamsAPI.create(team);
    if (res.success && res.data) {
      setTeams(prev => [...prev, res.data]);
      setShowTeamModal(false);
    }
  };

  const handleUpdateTeam = async (id: string, updates: Partial<Team>) => {
    const res = await teamsAPI.update(id, updates);
    if (res.success && res.data) {
      setTeams(prev => prev.map(t => t.id === id ? res.data : t));
      setShowTeamModal(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!window.confirm('Supprimer cette équipe ?')) return;
    const res = await teamsAPI.delete(id);
    if (res.success) {
      setTeams(prev => prev.filter(t => t.id !== id));
    }
  };

  // Schedule CRUD handlers
  const handleCreateSchedule = async (schedule: Partial<Schedule>) => {
    // Nous devons nous assurer que tous les champs requis sont présents
    const completeSchedule = {
      team_id: schedule.team_id || '',
      team: schedule.team || '',
      date: schedule.date || '',
      route: schedule.route || [],
      truck: schedule.truck || '',
      start_time: schedule.start_time || '',
      estimated_end_time: schedule.estimated_end_time || '',
      status: schedule.status || 'planned' as const
    };

    const res = await schedulesAPI.create(completeSchedule);
    if (res.success && res.data) {
      setSchedules(prev => [...prev, res.data]);
      setShowScheduleModal(false);
    }
  };

  const handleUpdateSchedule = async (id: string, updates: Partial<Schedule>) => {
    const res = await schedulesAPI.update(id, updates);
    if (res.success && res.data) {
      setSchedules(prev => prev.map(s => s.id === id ? res.data : s));
      setShowScheduleModal(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Supprimer cette planification ?')) return;
    const res = await schedulesAPI.delete(id);
    if (res.success) {
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  const loadSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const res = await schedulesAPI.getAll();
      if (res.success && res.data && res.data.results) {
        setSchedules(res.data.results);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des planifications:', error);
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Load schedules on component mount
  useEffect(() => {
    loadSchedules();
  }, []);

  // Fonction pour organiser les schedules par jour de la semaine
  const getWeeklySchedules = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Lundi
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const daySchedules = schedules.filter(schedule => schedule.date === dateString);
      
      weekDays.push({
        dayName: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i],
        date: dateString,
        schedules: daySchedules
      });
    }
    
    return weekDays;
  };

  const weeklySchedules = getWeeklySchedules();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interface Coordinateur</h1>
            <p className="text-gray-600 mt-1">
              Gérez les équipes, planifiez les collectes et optimisez les opérations
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPlanningModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nouveau planning
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: Home },
              { id: 'planning', label: 'Planning', icon: Calendar },
              { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
              { id: 'teams', label: 'Équipes', icon: Users },
              { id: 'trucks', label: 'Camions', icon: Truck },
              { id: 'reports', label: 'Signalements', icon: ClipboardList },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Tableau de bord */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPIs rapides */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${getStatColor(stat.color)}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alertes prioritaires */}
              {(overflowPoints.length > 0 || fullPoints.length > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                    <AlertTriangle className="mr-2 h-6 w-6" />
                    Alertes prioritaires
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overflowPoints.map((point) => (
                      <div key={point.id} className="bg-white border border-red-300 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-red-900">{point.name}</h4>
                            <p className="text-sm text-red-700">Débordement détecté</p>
                          </div>
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            URGENT
                          </span>
                        </div>
                      </div>
                    ))}
                    {fullPoints.map((point) => (
                      <div key={point.id} className="bg-white border border-orange-300 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-orange-900">{point.name}</h4>
                            <p className="text-sm text-orange-700">Conteneur plein</p>
                          </div>
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            PRIORITÉ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Planning du jour */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Planning du jour</h3>
                  <div className="space-y-3">
                    {todaySchedules.map((schedule) => (
                      <div key={schedule.id} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Équipe {schedule.team_id} </h4>
                            <p className="text-sm text-gray-600">
                              {schedule.start_time} - {schedule.estimated_end_time} | {schedule.route.length} points
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            schedule.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {schedule.status === 'in_progress' ? 'En cours' : 'Planifié'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signalements récents */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Signalements récents</h3>
                  <div className="space-y-3">
                    {pendingReports.slice(0, 3).map((report) => (
                      <div key={report.id} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm">
                              {report.type === 'overflow' ? 'Débordement' : 'Autre'}
                            </h4>
                            <p className="text-xs text-gray-600">{report.location.address}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            report.priority === 'high' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.priority === 'high' ? 'Haute' : 'Moyenne'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Planning */}
          {activeTab === 'planning' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Gestion des plannings</h2>
                <button
                  onClick={() => {
                    setSelectedSchedule(null);
                    setScheduleModalMode('create');
                    setShowScheduleModal(true);
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nouveau planning
                </button>
              </div>

              {/* Planning hebdomadaire */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Planning de la semaine</h3>
                  {!loadingSchedules && (
                    <div className="flex space-x-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {weeklySchedules.reduce((total, day) => total + day.schedules.length, 0)}
                        </div>
                        <div className="text-xs text-gray-500">Total planifications</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {weeklySchedules.reduce((total, day) => 
                            total + day.schedules.filter(s => s.status === 'completed').length, 0
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Terminées</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {weeklySchedules.reduce((total, day) => 
                            total + day.schedules.filter(s => s.status === 'in_progress').length, 0
                          )}
                        </div>
                        <div className="text-xs text-gray-500">En cours</div>
                      </div>
                    </div>
                  )}
                </div>
                {loadingSchedules ? (
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                      <div key={day} className="text-center">
                        <div className="font-medium text-gray-700 mb-2">{day}</div>
                        <div className="space-y-1">
                          <div className="bg-gray-200 animate-pulse text-xs p-2 rounded h-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {weeklySchedules.map((day) => (
                      <div key={day.dayName} className="text-center">
                        <div className="font-medium text-gray-700 mb-2">
                          {day.dayName}
                          <div className="text-xs text-gray-500">
                            {new Date(day.date).getDate()}/
                            {new Date(day.date).getMonth() + 1}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {day.schedules.length > 0 ? (
                            day.schedules.slice(0, 3).map((schedule, index) => (
                              <div 
                                key={schedule.id} 
                                className={`text-xs p-2 rounded cursor-pointer transition-colors relative ${
                                  schedule.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                  schedule.status === 'in_progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                  schedule.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                  'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                                onClick={() => {
                                  setSelectedSchedule(schedule);
                                  setScheduleModalMode('edit');
                                  setShowScheduleModal(true);
                                }}
                                title={`Équipe ${schedule.team_id} - ${schedule.start_time} à ${schedule.estimated_end_time} (${
                                  schedule.status === 'completed' ? 'Terminé' :
                                  schedule.status === 'in_progress' ? 'En cours' :
                                  schedule.status === 'cancelled' ? 'Annulé' : 'Planifié'
                                })`}
                              >
                                {/* Indicateur de statut */}
                                <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                                  schedule.status === 'completed' ? 'bg-green-500' :
                                  schedule.status === 'in_progress' ? 'bg-blue-500' :
                                  schedule.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'
                                }`}></div>
                                
                                Équipe {schedule.team_id}<br/>
                                {schedule.start_time.substring(0, 5)}-{schedule.estimated_end_time.substring(0, 5)}
                                {schedule.route && schedule.route.length > 0 && (
                                  <div className="text-xs opacity-75 mt-1">
                                    {schedule.route.length} pts
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div 
                              className="text-xs text-gray-400 p-2 border-2 border-dashed border-gray-200 rounded cursor-pointer hover:border-blue-300 hover:text-blue-500 transition-colors"
                              onClick={() => {
                                // Pré-remplir la date du jour sélectionné
                                setSelectedSchedule(null);
                                setScheduleModalMode('create');
                                setShowScheduleModal(true);
                                // Note: On pourrait passer la date via un état si besoin
                              }}
                              title="Cliquez pour créer une planification pour ce jour"
                            >
                              Aucune<br/>planification<br/>
                              <span className="text-xs opacity-60">+ Ajouter</span>
                            </div>
                          )}
                          {day.schedules.length > 3 && (
                            <div className="text-xs text-gray-500 p-1">
                              +{day.schedules.length - 3} autres
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Légende */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-100 rounded mr-2 relative">
                        <div className="absolute top-0 right-0 w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                      <span className="text-gray-600">Planifié</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-100 rounded mr-2 relative">
                        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-600">En cours</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-100 rounded mr-2 relative">
                        <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-600">Terminé</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-100 rounded mr-2 relative">
                        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-600">Annulé</span>
                    </div>
                    <div className="flex items-center ml-auto">
                      <span className="text-gray-500">Cliquez sur une planification pour modifier</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plannings détaillés */}
              <div className="space-y-4">
                {loadingSchedules ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ) : schedules.length > 0 ? (
                  schedules.map((schedule) => (
                    <div key={schedule.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Équipe {schedule.team_id} - {new Date(schedule.date).toLocaleDateString()}
                          </h3>
                          <p className="text-gray-600">
                            {schedule.start_time} - {schedule.estimated_end_time} | Camion {schedule.truck}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                            schedule.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {schedule.status === 'completed' ? 'Terminé' :
                             schedule.status === 'in_progress' ? 'En cours' : 'Planifié'}
                          </span>
                          <button 
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setScheduleModalMode('edit');
                              setShowScheduleModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Points de collecte:</span> {schedule.route?.length || 0}
                        </div>
                        <div>
                          <span className="font-medium">Distance estimée:</span> {(schedule.route?.length || 0) * 2.5} km
                        </div>
                        <div>
                          <span className="font-medium">Coût estimé:</span> {((schedule.route?.length || 0) * 15 * 655.957).toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun planning</h3>
                    <p className="text-gray-600 mb-4">Commencez par créer votre premier planning.</p>
                    <button
                      onClick={() => {
                        setSelectedSchedule(null);
                        setScheduleModalMode('create');
                        setShowScheduleModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un planning
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet Statistiques */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Statistiques et Analytics</h2>
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="quarter">Ce trimestre</option>
                </select>
              </div>
              
              {/* KPIs détaillés */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600">Collectes totales</h3>
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{mockStatistics.totalCollections}</div>
                  <div className="text-sm text-green-600">+12% vs mois dernier</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600">Efficacité</h3>
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{mockStatistics.efficiency}%</div>
                  <div className="text-sm text-green-600">+3% vs mois dernier</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600">Coûts</h3>
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">41,1M FCFA</div>
                  <div className="text-sm text-red-600">+5% vs budget</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600">Temps de réponse</h3>
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{mockStatistics.averageResponseTime}h</div>
                  <div className="text-sm text-green-600">-15% vs mois dernier</div>
                </div>
              </div>

              {/* Performance hebdomadaire */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance hebdomadaire</h3>
                <div className="space-y-4">
                  {weeklyStats.map((day) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="w-12 text-sm font-medium">{day.day}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Collectes: {day.collections}</span>
                            <span>Efficacité: {day.efficiency}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${day.efficiency}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphiques de performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Évolution des collectes */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des collectes</h3>
                  <div className="space-y-3">
                    {detailedStatistics.monthlyData.slice(-4).map((month) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 text-sm font-medium">{month.month}</span>
                          <div className="flex-1">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{width: `${(month.collections / 1500) * 100}%`}}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{month.collections}</div>
                          <div className="text-xs text-gray-600">{month.efficiency}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analyse des coûts */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse des coûts</h3>
                  
                  {/* Résumé budgétaire */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Budget total</span>
                      <span className="text-lg font-bold text-gray-900">
                        {(detailedStatistics.costAnalysis.totalBudget / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Dépensé</span>
                      <span className="text-lg font-bold text-blue-900">
                        {(detailedStatistics.costAnalysis.totalSpent / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${(detailedStatistics.costAnalysis.totalSpent / detailedStatistics.costAnalysis.totalBudget) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {((detailedStatistics.costAnalysis.totalSpent / detailedStatistics.costAnalysis.totalBudget) * 100).toFixed(1)}% utilisé
                    </div>
                  </div>

                  {/* Détail par catégorie */}
                  <div className="space-y-4">
                    {detailedStatistics.costAnalysis.categories.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{category.category}</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">
                              {(category.amount / 1000000).toFixed(1)}M FCFA
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              / {(category.budget / 1000000).toFixed(1)}M FCFA
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              category.amount > category.budget 
                                ? 'bg-red-500' 
                                : category.amount > category.budget * 0.8 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                            }`}
                            style={{width: `${Math.min((category.amount / category.budget) * 100, 100)}%`}}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">{category.percentage}% du total</span>
                          <span className={`font-medium ${
                            category.amount > category.budget 
                              ? 'text-red-600' 
                              : category.amount > category.budget * 0.8 
                                ? 'text-yellow-600' 
                                : 'text-green-600'
                          }`}>
                            {category.amount > category.budget 
                              ? `+${((category.amount / category.budget - 1) * 100).toFixed(1)}% dépassement`
                              : `${((1 - category.amount / category.budget) * 100).toFixed(1)}% restant`
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alertes et optimisations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alertes opérationnelles */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Alertes Opérationnelles
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white border border-red-300 rounded p-3">
                      <div className="font-medium text-red-800">Dépassement budget carburant</div>
                      <div className="text-sm text-red-600">+12% par rapport au budget prévu</div>
                    </div>
                    <div className="bg-white border border-orange-300 rounded p-3">
                      <div className="font-medium text-orange-800">Efficacité équipe Beta en baisse</div>
                      <div className="text-sm text-orange-600">-5% cette semaine</div>
                    </div>
                    <div className="bg-white border border-yellow-300 rounded p-3">
                      <div className="font-medium text-yellow-800">Maintenance camion DK-003-EF</div>
                      <div className="text-sm text-yellow-600">Programmée dans 3 jours</div>
                    </div>
                  </div>
                </div>

                {/* Recommandations d'optimisation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Recommandations
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white border border-green-300 rounded p-3">
                      <div className="font-medium text-green-800">Optimiser route équipe Alpha</div>
                      <div className="text-sm text-green-600">Économie potentielle: 8% carburant</div>
                    </div>
                    <div className="bg-white border border-blue-300 rounded p-3">
                      <div className="font-medium text-blue-800">Regrouper collectes quartier Nord</div>
                      <div className="text-sm text-blue-600">Réduction temps: 15 minutes/jour</div>
                    </div>
                    <div className="bg-white border border-purple-300 rounded p-3">
                      <div className="font-medium text-purple-800">Formation équipe sur nouvelles routes</div>
                      <div className="text-sm text-purple-600">Amélioration efficacité: +10%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance des équipes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance des équipes</h3>
                <div className="space-y-4">
                  {teamPerformance.map((team) => (
                    <div key={team.team} className="border border-gray-200 rounded p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{team.team}</h4>
                        <span className="text-sm text-gray-600">{team.efficiency}% efficacité</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Collectes:</span>
                          <span className="ml-2 font-medium">{team.collections}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Incidents:</span>
                          <span className="ml-2 font-medium">{team.incidents}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{width: `${team.efficiency}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Autres onglets existants... */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Gestion des équipes</h2>
                <button
                  onClick={() => {
                    setSelectedTeam(null);
                    setTeamModalMode('create');
                    setShowTeamModal(true);
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Créer une équipe
                </button>
              </div>

              {loadingTeams ? (
                <div className="text-center text-gray-500 py-8">Chargement des équipes...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {teams.map((team) => (
                    <div key={team.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center">
                            <Users className="mr-2 h-5 w-5 text-blue-600" />
                            {team.name}
                          </h3>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              team.specialization === 'general' ? 'bg-blue-100 text-blue-800' :
                              team.specialization === 'recycling' ? 'bg-green-100 text-green-800' :
                              team.specialization === 'organic' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {team.specialization === 'general' ? 'Collecte générale' :
                               team.specialization === 'recycling' ? 'Recyclage' :
                               team.specialization === 'organic' ? 'Déchets organiques' :
                               'Déchets dangereux'}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              team.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {team.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              // Pass a shallow copy to avoid direct mutation
                              setSelectedTeam({ ...team });
                              setTeamModalMode('edit');
                              setShowTeamModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Chef d'équipe */}
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <Crown className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm font-medium text-yellow-800">Chef d'équipe</span>
                        </div>
                        <div className="mt-1 text-sm text-yellow-700">{team.leader_name}</div>
                      </div>

                      {/* Membres */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Membres ({team.members.length})
                        </h4>
                        <div className="space-y-2">
                          {team.members.slice(0, 3).map((member) => (
                            <div key={member.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  member.role === 'leader' ? 'bg-yellow-500' :
                                  member.role === 'driver' ? 'bg-blue-500' : 'bg-green-500'
                                }`}></div>
                                <span>{member.name}</span>
                              </div>
                              <span className="text-gray-500 capitalize">{
                                member.role === 'leader' ? 'Chef' :
                                member.role === 'driver' ? 'Conducteur' : 'Collecteur'
                              }</span>
                            </div>
                          ))}
                          {team.members.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{team.members.length - 3} autres membres
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Statistiques */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Créée le:</span>
                          <span className="font-medium">{new Date(team.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Membres:</span>
                          <span className="font-medium">{team.members.length}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                        <button
                          className="text-sm text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            setActiveTab('planning');
                            // Optionally, you can set a filter or scroll to the team's planning if needed
                          }}
                        >
                          Voir planning
                        </button>
                        <div className="flex justify-between">
                          <button className="text-sm text-green-600 hover:text-green-700 mr-3">
                            Assigner mission
                          </button>
                          <button className="text-sm text-gray-600 hover:text-gray-700">
                            Statistiques
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Statistiques des équipes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance des équipes</h3>
                <div className="space-y-4">
                  {teamPerformance.map((team) => (
                    <div key={team.team} className="border border-gray-200 rounded p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{team.team}</h4>
                        <span className="text-sm text-gray-600">{team.efficiency}% efficacité</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Collectes:</span>
                          <span className="ml-2 font-medium">{team.collections}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Incidents:</span>
                          <span className="ml-2 font-medium">{team.incidents}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{width: `${team.efficiency}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trucks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Gestion de la flotte</h2>
                <button
                  onClick={() => {
                    setTruckForm({});
                    setTruckModalMode('create');
                    setShowTruckModal(true);
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Ajouter un camion
                </button>
              </div>
              <div className="space-y-4">
                {loadingTrucks ? (
                  <div className="text-center text-gray-500 py-8">Chargement des camions...</div>
                ) : (
                  trucks.map((truck) => (
                    <div key={truck.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{truck.plate_number || truck.plate_number}</h3>
                          <p className="text-gray-600">Conducteur: {truck.driverName || truck.driver_name}</p>
                          <div className="mt-2 text-sm text-gray-600">
                            Points assignés: {truck.route?.length ?? 0}
                            {truck.estimatedTime && (
                              <span className="ml-4">Temps estimé: {truck.estimatedTime} min</span>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          truck.status === 'collecting' ? 'bg-blue-100 text-blue-800' :
                          truck.status === 'available' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {truck.status === 'collecting' ? 'En collecte' :
                           truck.status === 'available' ? 'Disponible' : 'Maintenance'}
                        </span>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button
                          className="text-blue-600 hover:text-blue-700 text-sm"
                          onClick={() => {
                            setTruckForm(truck);
                            setTruckModalMode('edit');
                            setShowTruckModal(true);
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          className="text-red-600 hover:text-red-700 text-sm"
                          onClick={() => handleDeleteTruck(truck.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Modal for create/edit truck */}
              {showTruckModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">
                      {truckModalMode === 'create' ? 'Ajouter un camion' : 'Modifier le camion'}
                    </h3>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (truckModalMode === 'create') {
                          handleCreateTruck(truckForm!);
                        } else if (truckForm && truckForm.id) {
                          handleUpdateTruck(truckForm.id, truckForm);
                        }
                      }}
                      className="space-y-4"
                    >
                      {/* Sélection du conducteur */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Conducteur</label>
                        <select
                          className="w-full border rounded px-3 py-2"
                          value={truckForm?.driverId || truckForm?.driver || ''}
                          onChange={e => setTruckForm(f => ({ ...f, driverId: e.target.value }))}
                          required
                        >
                          <option value="">Sélectionner un conducteur</option>
                          {collectors.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Affiche le nom du conducteur si disponible (pour édition) */}
                      {truckForm?.driverName || truckForm?.driver_name ? (
                        <div>
                          <label className="block text-sm font-medium mb-1">Nom conducteur</label>
                          <div className="px-3 py-2 border rounded bg-gray-50 text-gray-700">
                            {truckForm.driverName || truckForm.driver_name}
                          </div>
                        </div>
                      ) : null}
                      <div>
                        <label className="block text-sm font-medium mb-1">Immatriculation</label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2"
                          value={truckForm?.plate_number || truckForm?.plate_number || ''}
                          onChange={e => setTruckForm(f => ({ ...f, plate_number: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Latitude actuelle</label>
                        <input
                          type="number"
                          step="any"
                          className="w-full border rounded px-3 py-2"
                          value={truckForm?.current_location?.latitude ?? truckForm?.current_latitude ?? ''}
                          onChange={e => setTruckForm(f => ({
                            ...f,
                            current_location: {
                              ...(f?.current_location || {}),
                              latitude: parseFloat(e.target.value)
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Longitude actuelle</label>
                        <input
                          type="number"
                          step="any"
                          className="w-full border rounded px-3 py-2"
                          value={truckForm?.current_location?.longitude ?? truckForm?.current_longitude ?? ''}
                          onChange={e => setTruckForm(f => ({
                            ...f,
                            current_location: {
                              ...(f?.current_location || {}),
                              longitude: parseFloat(e.target.value)
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Statut</label>
                        <select
                          className="w-full border rounded px-3 py-2"
                          value={truckForm?.status || ''}
                          onChange={e => setTruckForm(f => ({ ...f, status: e.target.value as any }))}
                          required
                        >
                          <option value="">Sélectionner</option>
                          <option value="available">Disponible</option>
                          <option value="collecting">En collecte</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="offline">Hors ligne</option>
                          <option value="unavailable">Indisponible</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Temps estimé (minutes)</label>
                        <input
                          type="number"
                          className="w-full border rounded px-3 py-2"
                          value={truckForm?.estimatedTime ?? truckForm?.estimated_time ?? ''}
                          onChange={e => setTruckForm(f => ({ ...f, estimatedTime: parseInt(e.target.value, 10) }))}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-200 rounded"
                          onClick={() => setShowTruckModal(false)}
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                          {truckModalMode === 'create' ? 'Créer' : 'Enregistrer'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}
        </div>
      </div>

      {/* Modal de création de planning */}
      <PlanningModal 
        isOpen={showPlanningModal}
        onClose={() => setShowPlanningModal(false)}
      />

      {/* Modal de gestion avancée des schedules */}
      {showScheduleModal && (
        <PlanningModal 
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedSchedule(null);
            setScheduleModalMode('create');
          }}
          schedule={selectedSchedule}
          mode={scheduleModalMode}
          onSubmit={scheduleModalMode === 'create' 
            ? handleCreateSchedule 
            : (data) => handleUpdateSchedule(selectedSchedule!.id, data)
          }
        />
      )}

      {/* Modal de gestion des équipes */}
      <TeamModal 
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        team={selectedTeam}
        mode={teamModalMode}
        onSubmit={teamModalMode === 'create' 
          ? handleCreateTeam 
          : (data) => handleUpdateTeam(selectedTeam!.id, data)
        }
      />
    </div>
  );
};