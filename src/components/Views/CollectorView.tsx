import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, AlertTriangle, CheckCircle, Clock, Truck, Plus, Navigation, Wrench, Locate, Wifi, Users, Eye, ArrowLeft } from 'lucide-react';
import { IncidentModal } from '../Common/IncidentModal';
import { useAuth } from '../../context/AuthContext';
import { trucksAPI, collectionPointsAPI, incidentsAPI, schedulesAPI, teamsAPI } from '../../services/api';
import { Incident, Schedule, Team, ScheduleRoute } from '../../types';

export const CollectorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('planning');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [truckStatus, setTruckStatus] = useState('collecting');
  const [completedPoints, setCompletedPoints] = useState<string[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [showScheduleDetails, setShowScheduleDetails] = useState(false);
  const { user } = useAuth();
  const userTeamId = user?.teamId || 'team-alpha';
  const [watchId, setWatchId] = useState<number | null>(null);

  // State for GPS tracking
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Données
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [weeklySchedules, setWeeklySchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      const response = await incidentsAPI.getAll();
      if (response.success && response.data?.results) {
        setActiveIncidents(response.data.results.filter(incident => incident.status === 'active'));
      } else {
        setActiveIncidents([]);
      }
    };
    fetchIncidents();
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await teamsAPI.getAll();
        if (response.success && response.data?.results) {
          setTeams(response.data.results);
          const userTeam = response.data.results.find(team => team.id === userTeamId);
          setCurrentTeam(userTeam || null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des équipes:', error);
      }
    };
    fetchTeams();
  }, [userTeamId]);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const response = await schedulesAPI.getAll();
        if (response.success && response.data?.results) {
          const teamSchedules = response.data.results.filter(schedule => 
            schedule.team_id === userTeamId || schedule.team === userTeamId
          );
          setWeeklySchedules(teamSchedules);
          console.log('Plannings de l\'équipe chargés:', teamSchedules);
        } else {
          setWeeklySchedules([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des plannings:', error);
        setWeeklySchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    }
    fetchSchedules();
  }, [userTeamId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Planifié';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getDayLabel = (dateStr: string) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const schedulesByDay: { [key: string]: Schedule[] } = {};
  daysOfWeek.forEach(day => schedulesByDay[day] = []);
  weeklySchedules.forEach(schedule => {
    const dayLabel = getDayLabel(schedule.date);
    if (schedulesByDay[dayLabel]) {
      schedulesByDay[dayLabel].push(schedule);
    }
  });

  const handleStartRoute = (scheduleId: string) => {
    const startRoute = async () => {
      try {
        const response = await schedulesAPI.update(scheduleId, { status: 'in_progress' });
        if (response.success) {
          const scheduleResponse = await schedulesAPI.getAll();
          if (scheduleResponse.success && scheduleResponse.data?.results) {
            const teamSchedules = scheduleResponse.data.results.filter(schedule => 
              schedule.team_id === userTeamId || schedule.team === userTeamId
            );
            setWeeklySchedules(teamSchedules);
          }
          alert(`Route ${scheduleId} démarrée avec succès`);
        } else {
          alert('Erreur lors du démarrage de la route');
        }
      } catch (error) {
        console.error('Erreur lors du démarrage de la route:', error);
        alert('Erreur lors du démarrage de la route');
      }
    };
    startRoute();
  };

  const handleCompleteRoute = (scheduleId: string) => {
    const completeRoute = async () => {
      try {
        const response = await schedulesAPI.update(scheduleId, { status: 'completed' });
        if (response.success) {
          const scheduleResponse = await schedulesAPI.getAll();
          if (scheduleResponse.success && scheduleResponse.data?.results) {
            const teamSchedules = scheduleResponse.data.results.filter(schedule => 
              schedule.team_id === userTeamId || schedule.team === userTeamId
            );
            setWeeklySchedules(teamSchedules);
          }
          alert(`Route ${scheduleId} terminée avec succès`);
        } else {
          alert('Erreur lors de la finalisation de la route');
        }
      } catch (error) {
        console.error('Erreur lors de la finalisation de la route:', error);
        alert('Erreur lors de la finalisation de la route');
      }
    };
    completeRoute();
  };

  const handleCompleteCollection = () => {
    // Cette fonction sera implémentée plus tard si nécessaire
  };

  const handleViewScheduleDetails = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    setShowScheduleDetails(true);
  };

  const handleCloseScheduleDetails = () => {
    setSelectedScheduleId(null);
    setShowScheduleDetails(false);
  };

  const getSelectedSchedule = () => {
    return weeklySchedules.find(s => s.id === selectedScheduleId);
  };

  const handleReportIncident = () => {
    setShowIncidentModal(true);
  };

  const handleTruckStatusChange = async (newStatus: string) => {
    setTruckStatus(newStatus);
    
    try {
      const response = await trucksAPI.updateStatus('1', newStatus as 'collecting' | 'available' | 'maintenance' | 'offline' | 'unavailable');
      
      if (response.success) {
        alert(`Statut du camion mis à jour: ${newStatus === 'collecting' ? 'En collecte' : 
               newStatus === 'available' ? 'Disponible' : 
               newStatus === 'maintenance' ? 'En maintenance' : 'Hors ligne'}`);
      } else {
        alert('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleConfirmCollection = async (pointId: string, pointName: string) => {
    if (!completedPoints.includes(pointId)) {
      setCompletedPoints([...completedPoints, pointId]);
      try {
        await collectionPointsAPI.updateStatus(pointId, 'empty');
        alert(`Collecte confirmée pour: ${pointName}`);
      } catch (error) {
        console.error('Erreur lors de la confirmation de collecte:', error);
      }
    }
  };

  const getTruckStatusColor = (status: string) => {
    switch (status) {
      case 'collecting': return 'bg-blue-100 text-blue-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      case 'unavailable': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTruckStatusText = (status: string) => {
    switch (status) {
      case 'collecting': return 'En collecte';
      case 'available': return 'Disponible';
      case 'maintenance': return 'En maintenance';
      case 'offline': return 'Hors ligne';
      case 'unavailable': return 'Indisponible';
      default: return 'Inconnu';
    }
  };

  const getTruckStatusIcon = (status: string) => {
    switch (status) {
      case 'collecting': return <Navigation className="w-4 h-4" />;
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'offline': return <Clock className="w-4 h-4" />;
      case 'unavailable': return <AlertTriangle className="w-4 h-4" />;
      default: return <Truck className="w-4 h-4" />;
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTodayTruckId = () => {
    const schedule = weeklySchedules.find(
      (s) => s.date === getTodayDate() && (s.team_id === userTeamId || s.team === userTeamId)
    );
    return schedule?.truck || '1';
  };

  const todaySchedule = weeklySchedules.filter(
    (schedule) => schedule.date === getTodayDate() && (schedule.team_id === userTeamId || schedule.team === userTeamId)
  );

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par ce navigateur');
      return;
    }

    setIsTracking(true);
    setLocationError(null);
    const truckId = getTodayTruckId();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCurrentLocation(location);
        trucksAPI.updateLocation(truckId, location);
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position non disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai de géolocalisation dépassé';
            break;
        }
        setLocationError(errorMessage);
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCurrentLocation(location);
        trucksAPI.updateLocation(truckId, location);
      },
      (error) => {
        console.error('Erreur de suivi GPS:', error);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 30000 }
    );
    setWatchId(id);
  };

  const stopLocationTracking = () => {
    setIsTracking(false);
    setCurrentLocation(null);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    alert('Suivi GPS arrêté');
  };

  return (
    <div className="space-y-6">
      {/* Header avec actions rapides */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Interface Chef d'Équipe de Collecte</h1>
        
        {/* Statut GPS et localisation */}
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Locate className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">
                  Suivi GPS du camion {isTracking ? 'activé' : 'désactivé'}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    <Wifi className="w-3 h-3 mr-1" />
                    {isTracking ? 'Connecté' : 'Déconnecté'}
                  </span>
                  {!isTracking ? (
                    <button
                      onClick={startLocationTracking}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                    >
                      Activer GPS
                    </button>
                  ) : (
                    <button
                      onClick={stopLocationTracking}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                    >
                      Arrêter GPS
                    </button>
                  )}
                </div>
                {currentLocation && (
                  <div className="text-xs text-green-700 mt-2">
                    Position: {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
                  </div>
                )}
                {locationError && (
                  <div className="text-xs text-red-600 mt-2">{locationError}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statut du camion */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Truck className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Camion de l'équipe</h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTruckStatusColor(truckStatus)}`}>
                    {getTruckStatusIcon(truckStatus)}
                    <span className="ml-1">{getTruckStatusText(truckStatus)}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleTruckStatusChange('collecting')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  truckStatus === 'collecting' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                <Navigation className="w-3 h-3 mr-1 inline" />
                En collecte
              </button>
              <button
                onClick={() => handleTruckStatusChange('available')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  truckStatus === 'available' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                <CheckCircle className="w-3 h-3 mr-1 inline" />
                Disponible
              </button>
              <button
                onClick={() => handleTruckStatusChange('maintenance')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  truckStatus === 'maintenance' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                <Wrench className="w-3 h-3 mr-1 inline" />
                Maintenance
              </button>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleReportIncident}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Plus className="mr-2 h-5 w-5" />
            Signaler un incident
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'planning', label: 'Planning', icon: Calendar },
              { id: 'team', label: 'Équipe', icon: Users },
              { id: 'tracking', label: 'Suivi', icon: MapPin },
              { id: 'reports', label: 'Signalements', icon: AlertTriangle },
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
          {/* Onglet Planning */}
          {activeTab === 'planning' && !showScheduleDetails && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Planning de l'Équipe {currentTeam?.name || userTeamId}
                </h2>
                <div className="flex items-center space-x-4">
                  {loadingSchedules && (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                      Chargement...
                    </div>
                  )}
                  <span className="text-sm text-gray-500">
                    {weeklySchedules.length} planning(s) actif(s)
                  </span>
                </div>
              </div>

              {/* Vue hebdomadaire */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 mb-4">Vue de la semaine</h3>
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="border border-gray-200 rounded-lg p-3">
                      <div className="text-center font-medium text-gray-700 mb-2">{day}</div>
                      <div className="space-y-1">
                        {schedulesByDay[day].map((schedule) => (
                          <div
                            key={schedule.id}
                            className={`p-2 rounded text-xs border ${getStatusColor(schedule.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                            onClick={() => handleViewScheduleDetails(schedule.id)}
                          >
                            <div className="font-medium">
                              {schedule.start_time} - {schedule.estimated_end_time}
                            </div>
                            <div>{schedule.route.length} points</div>
                            <div className="flex items-center mt-1">
                              <Eye className="w-3 h-3 mr-1" />
                              <span>Voir détails</span>
                            </div>
                          </div>
                        ))}
                        {schedulesByDay[day].length === 0 && (
                          <div className="text-xs text-gray-400 text-center py-2">
                            Pas de planning
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planning détaillé du jour */}
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-4">Planning du jour</h3>
                {todaySchedule.length > 0 ? (
                  <div className="space-y-4">
                    {todaySchedule.map((schedule) => (
                      <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Équipe {schedule.team_name || schedule.team} - Camion {schedule.truck_id || schedule.truck}
                            </h3>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <Clock className="mr-1 h-4 w-4" />
                              {schedule.start_time} - {schedule.estimated_end_time}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                            {getStatusText(schedule.status)}
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">
                            Itinéraire ({schedule.route.length} points) - 
                            <span className="text-sm text-green-600 ml-1">
                              {completedPoints.filter(id => schedule.route.some(r => r.collection_point?.id === id || r.id === id)).length} collectés
                            </span>
                          </h4>
                          <div className="space-y-2">
                            {schedule.route.map((routePoint, index) => (
                              <div key={routePoint.collection_point?.id || routePoint.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                completedPoints.includes(routePoint.collection_point?.id || routePoint.id) 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-center">
                                  <span className={`w-6 h-6 text-white text-xs rounded-full flex items-center justify-center mr-3 ${
                                    completedPoints.includes(routePoint.collection_point?.id || routePoint.id) ? 'bg-green-600' : 'bg-blue-600'
                                  }`}>
                                    {routePoint.order || index + 1}
                                  </span>
                                  <div>
                                    <div className="font-medium text-sm">
                                      {routePoint.collection_point?.name || `Point ${index + 1}`}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {routePoint.collection_point?.address || 'Adresse non disponible'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Type: {routePoint.collection_point?.type === 'bin' ? 'Poubelle' : 
                                             routePoint.collection_point?.type === 'container' ? 'Conteneur' : 'Recyclage'} | 
                                      Statut: {routePoint.collection_point?.status === 'full' ? 'Plein' : 
                                               routePoint.collection_point?.status === 'half' ? 'À moitié' : 
                                               routePoint.collection_point?.status === 'empty' ? 'Vide' : 'Débordement'}
                                    </div>
                                  </div>
                                </div>
                                {!completedPoints.includes(routePoint.collection_point?.id || routePoint.id) && (
                                  <button
                                    onClick={() => handleConfirmCollection(
                                      routePoint.collection_point?.id || routePoint.id, 
                                      routePoint.collection_point?.name || `Point ${index + 1}`
                                    )}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    Confirmer collecte
                                  </button>
                                )}
                                {completedPoints.includes(routePoint.collection_point?.id || routePoint.id) && (
                                  <div className="flex items-center text-green-600 text-xs">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Collecté
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {schedule.status === 'planned' && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleStartRoute(schedule.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              Commencer la route
                            </button>
                          </div>
                        )}
                        
                        {schedule.status === 'in_progress' && completedPoints.filter(id => schedule.route.some(r => r.collection_point?.id === id || r.id === id)).length === schedule.route.length && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleCompleteRoute(schedule.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Terminer la route
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>Aucun planning pour votre équipe aujourd'hui</p>
                    <p className="text-sm mt-2">Équipe: {currentTeam?.name || userTeamId}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vue détaillée d'un planning */}
          {activeTab === 'planning' && showScheduleDetails && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <button
                    onClick={handleCloseScheduleDetails}
                    className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Détails du Planning
                  </h2>
                </div>
              </div>

              {getSelectedSchedule() && (
                <div className="space-y-6">
                  {/* Informations générales */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Équipe</label>
                        <p className="mt-1 text-sm text-gray-900">{getSelectedSchedule()!.team_name || getSelectedSchedule()!.team}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Camion</label>
                        <p className="mt-1 text-sm text-gray-900">{getSelectedSchedule()!.truck_id || getSelectedSchedule()!.truck}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <p className="mt-1 text-sm text-gray-900">{new Date(getSelectedSchedule()!.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Horaires</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {getSelectedSchedule()!.start_time} - {getSelectedSchedule()!.estimated_end_time}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Statut</label>
                        <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(getSelectedSchedule()!.status)}`}>
                          {getStatusText(getSelectedSchedule()!.status)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Progression</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {completedPoints.filter(id => getSelectedSchedule()!.route.some(r => r.collection_point?.id === id || r.id === id)).length} / {getSelectedSchedule()!.route.length} points collectés
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Itinéraire détaillé avec ScheduleRoute */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Itinéraire détaillé ({getSelectedSchedule()!.route.length} points)
                    </h3>
                    <div className="space-y-4">
                      {getSelectedSchedule()!.route.map((routePoint, index) => {
                        const isCompleted = completedPoints.includes(routePoint.collection_point?.id || routePoint.id);
                        return (
                          <div
                            key={routePoint.collection_point?.id || routePoint.id}
                            className={`border rounded-lg p-4 transition-all ${
                              isCompleted
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start">
                                <span className={`w-8 h-8 text-white text-sm rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
                                  isCompleted ? 'bg-green-600' : 'bg-blue-600'
                                }`}>
                                  {routePoint.order || index + 1}
                                </span>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {routePoint.collection_point?.name || `Point ${index + 1}`}
                                  </h4>
                                  <div className="flex items-center mt-1 text-sm text-gray-600">
                                    <MapPin className="mr-1 h-4 w-4" />
                                    {routePoint.collection_point?.address || 'Adresse non disponible'}
                                  </div>
                                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Type:</span>
                                      <span className="ml-1 text-gray-600">
                                        {routePoint.collection_point?.type === 'bin' ? 'Poubelle' :
                                         routePoint.collection_point?.type === 'container' ? 'Conteneur' : 'Recyclage'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Statut:</span>
                                      <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                                        routePoint.collection_point?.status === 'full' ? 'bg-red-100 text-red-800' :
                                        routePoint.collection_point?.status === 'half' ? 'bg-yellow-100 text-yellow-800' :
                                        routePoint.collection_point?.status === 'overflow' ? 'bg-red-200 text-red-900' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                        {routePoint.collection_point?.status === 'full' ? 'Plein' :
                                         routePoint.collection_point?.status === 'half' ? 'À moitié' :
                                         routePoint.collection_point?.status === 'empty' ? 'Vide' : 'Débordement'}
                                      </span>
                                    </div>
                                    {routePoint.collection_point?.latitude && routePoint.collection_point?.longitude && (
                                      <div className="col-span-2">
                                        <span className="font-medium">Coordonnées:</span>
                                        <span className="ml-1 text-gray-600">
                                          {routePoint.collection_point.latitude.toFixed(5)}, {routePoint.collection_point.longitude.toFixed(5)}
                                        </span>
                                      </div>
                                    )}
                                    {routePoint.estimated_time && (
                                      <div>
                                        <span className="font-medium">Heure estimée:</span>
                                        <span className="ml-1 text-gray-600">{routePoint.estimated_time}</span>
                                      </div>
                                    )}
                                    {routePoint.collection_point?.lastCollection && (
                                      <div>
                                        <span className="font-medium">Dernière collecte:</span>
                                        <span className="ml-1 text-gray-600">
                                          {new Date(routePoint.collection_point.lastCollection).toLocaleDateString('fr-FR')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                {isCompleted ? (
                                  <div className="flex items-center text-green-600 text-sm">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Collecté
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleConfirmCollection(
                                      routePoint.collection_point?.id || routePoint.id,
                                      routePoint.collection_point?.name || `Point ${index + 1}`
                                    )}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    Confirmer collecte
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions globales du planning */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Actions du Planning</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Gérez le statut global de ce planning d'équipe
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        {getSelectedSchedule()!.status === 'planned' && (
                          <button
                            onClick={() => {
                              handleStartRoute(getSelectedSchedule()!.id);
                              handleCloseScheduleDetails();
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Commencer la route
                          </button>
                        )}
                        {getSelectedSchedule()!.status === 'in_progress' && 
                         completedPoints.filter(id => getSelectedSchedule()!.route.some(r => r.collection_point?.id === id || r.id === id)).length === getSelectedSchedule()!.route.length && (
                          <button
                            onClick={() => {
                              handleCompleteRoute(getSelectedSchedule()!.id);
                              handleCloseScheduleDetails();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Terminer la route
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onglet Tracking */}
          {activeTab === 'tracking' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Suivi GPS et Camion</h2>
              
              {/* Informations GPS */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Localisation GPS</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium">
                      {isTracking ? 'GPS Actif' : 'GPS Inactif'}
                    </span>
                    {currentLocation && (
                      <span className="text-xs text-gray-600">
                        {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
                      </span>
                    )}
                  </div>
                  {!isTracking ? (
                    <button
                      onClick={startLocationTracking}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Locate className="w-4 h-4 mr-2 inline" />
                      Activer GPS
                    </button>
                  ) : (
                    <button
                      onClick={stopLocationTracking}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Arrêter GPS
                    </button>
                  )}
                </div>
                {locationError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{locationError}</p>
                  </div>
                )}
              </div>

              {/* Statut du camion */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Statut du Camion</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getTruckStatusIcon(truckStatus)}
                    <div>
                      <div className="font-medium text-gray-900">Camion {getTodayTruckId()}</div>
                      <div className={`text-sm px-2 py-1 rounded-full ${getTruckStatusColor(truckStatus)}`}>
                        {getTruckStatusText(truckStatus)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { status: 'collecting', label: 'En collecte', icon: Navigation },
                    { status: 'available', label: 'Disponible', icon: CheckCircle },
                    { status: 'maintenance', label: 'Maintenance', icon: Wrench },
                    { status: 'offline', label: 'Hors ligne', icon: Clock },
                    { status: 'unavailable', label: 'Indisponible', icon: AlertTriangle },
                  ].map(({ status, label, icon: Icon }) => (
                    <button
                      key={status}
                      onClick={() => handleTruckStatusChange(status)}
                      className={`flex items-center justify-center px-3 py-2 text-xs rounded-md transition-colors ${
                        truckStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suivi des points de collecte confirmés */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Points de Collecte - Mise à jour des États</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Mettez à jour l'état des points de collecte après confirmation de la collecte
                </p>
                
                {todaySchedule.length > 0 ? (
                  <div className="space-y-4">
                    {todaySchedule.map((schedule) => (
                      <div key={schedule.id}>
                        <h4 className="font-medium text-gray-800 mb-3">
                          Planning {schedule.team_name || schedule.team} - {schedule.route.length} points
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {schedule.route.map((routePoint, index) => {
                            const isCompleted = completedPoints.includes(routePoint.collection_point?.id || routePoint.id);
                            const currentStatus = routePoint.collection_point?.status || 'empty';
                            
                            return (
                              <div
                                key={routePoint.collection_point?.id || routePoint.id}
                                className={`border rounded-lg p-4 transition-all ${
                                  isCompleted
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-start">
                                    <span className={`w-6 h-6 text-white text-xs rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                                      isCompleted ? 'bg-green-600' : 'bg-gray-400'
                                    }`}>
                                      {routePoint.order || index + 1}
                                    </span>
                                    <div>
                                      <h5 className="font-medium text-gray-900 text-sm">
                                        {routePoint.collection_point?.name || `Point ${index + 1}`}
                                      </h5>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {routePoint.collection_point?.address}
                                      </p>
                                    </div>
                                  </div>
                                  {isCompleted && (
                                    <div className="flex items-center text-green-600 text-xs">
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Collecté
                                    </div>
                                  )}
                                </div>

                                <div className="mb-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">État actuel:</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      currentStatus === 'full' ? 'bg-red-100 text-red-800' :
                                      currentStatus === 'half' ? 'bg-yellow-100 text-yellow-800' :
                                      currentStatus === 'overflow' ? 'bg-red-200 text-red-900' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {currentStatus === 'full' ? 'Plein' :
                                       currentStatus === 'half' ? 'À moitié' :
                                       currentStatus === 'empty' ? 'Vide' : 'Débordement'}
                                    </span>
                                  </div>
                                </div>

                                {/* Boutons de mise à jour de l'état - seulement si collecté */}
                                {isCompleted && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-2">Mettre à jour l'état après collecte:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { status: 'empty', label: 'Vide', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
                                        { status: 'half', label: 'À moitié', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
                                        { status: 'full', label: 'Plein', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
                                        { status: 'overflow', label: 'Débordement', color: 'bg-red-200 text-red-900 hover:bg-red-300' },
                                      ].map(({ status, label, color }) => (
                                        <button
                                          key={status}
                                          onClick={async () => {
                                            try {
                                              const pointId = routePoint.collection_point?.id || routePoint.id;
                                              await collectionPointsAPI.updateStatus(pointId, status as any);
                                              alert(`État du point "${routePoint.collection_point?.name || `Point ${index + 1}`}" mis à jour: ${label}`);
                                              
                                              // Recharger les données des schedules pour refléter les changements
                                              const response = await schedulesAPI.getAll();
                                              if (response.success && response.data?.results) {
                                                const teamSchedules = response.data.results.filter(schedule => 
                                                  schedule.team_id === userTeamId || schedule.team === userTeamId
                                                );
                                                setWeeklySchedules(teamSchedules);
                                              }
                                            } catch (error) {
                                              console.error('Erreur lors de la mise à jour de l\'état:', error);
                                              alert('Erreur lors de la mise à jour de l\'état du point');
                                            }
                                          }}
                                          className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                            currentStatus === status
                                              ? 'bg-blue-600 text-white'
                                              : color
                                          }`}
                                          disabled={currentStatus === status}
                                        >
                                          {label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Message si pas encore collecté */}
                                {!isCompleted && (
                                  <div className="text-center py-2">
                                    <p className="text-xs text-gray-500">
                                      Confirmez d'abord la collecte dans l'onglet Planning
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>Aucun point de collecte pour aujourd'hui</p>
                    <p className="text-sm mt-1">Les points de collecte apparaîtront une fois le planning activé</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet Signalements (Reports) */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Signalements d'Incidents</h2>
              {activeIncidents.length > 0 ? (
                <div className="space-y-4">
                  {activeIncidents.map((incident) => (
                    <div key={incident.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-red-900">
                            {incident.type === 'traffic' ? 'Problème de circulation' :
                             incident.type === 'breakdown' ? 'Panne' :
                             incident.type === 'accident' ? 'Accident' :
                             incident.type === 'weather' ? 'Météo' : 'Autre'}
                          </h3>
                          <p className="text-sm text-red-800">{incident.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          incident.severity === 'high' ? 'bg-red-200 text-red-900' :
                          incident.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                          'bg-blue-200 text-blue-900'
                        }`}>
                          {incident.severity === 'high' ? 'Élevée' :
                           incident.severity === 'medium' ? 'Moyenne' : 'Faible'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-red-700 mb-2">
                        <MapPin className="mr-1 h-4 w-4" />
                        {incident.location.address}
                      </div>
                      {incident.estimatedDelay > 0 && (
                        <div className="text-sm text-red-800">
                          Retard estimé: {incident.estimatedDelay} minutes
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-300 mb-4" />
                  <p>Aucun incident en cours</p>
                </div>
              )}
            </div>
          )}

          {/* Onglet Équipe */}
          {activeTab === 'team' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Mon Équipe</h2>
              {currentTeam ? (
                <div className="space-y-6">
                  {/* Informations générales de l'équipe */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{currentTeam.name}</h3>
                        <p className="text-lg text-gray-600 mt-1">
                          Spécialisation: <span className="font-medium">
                            {currentTeam.specialization === 'general' ? 'Collecte générale' :
                             currentTeam.specialization === 'recycling' ? 'Recyclage' :
                             currentTeam.specialization === 'organic' ? 'Déchets organiques' :
                             currentTeam.specialization === 'hazardous' ? 'Déchets dangereux' : currentTeam.specialization}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Créée le: {new Date(currentTeam.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                          currentTeam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {currentTeam.status === 'active' ? 'Équipe Active' : 'Équipe Inactive'}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">ID: {currentTeam.id}</p>
                      </div>
                    </div>
                    
                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{(currentTeam.members?.length || 0) + 1}</div>
                        <div className="text-sm text-blue-800">Total membres</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{weeklySchedules.length}</div>
                        <div className="text-sm text-green-800">Plannings actifs</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {weeklySchedules.reduce((total, schedule) => total + schedule.route.length, 0)}
                        </div>
                        <div className="text-sm text-orange-800">Points de collecte</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {completedPoints.length}
                        </div>
                        <div className="text-sm text-purple-800">Collections terminées</div>
                      </div>
                    </div>
                  </div>

                  {/* Chef d'équipe */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                      Chef d'équipe
                    </h4>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-gray-900">{currentTeam.leader_name}</div>
                          <div className="text-sm text-gray-600 mt-1">Leader ID: {currentTeam.leaderId}</div>
                          <div className="flex items-center mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Chef d'équipe
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {currentTeam.leader_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Membres de l'équipe */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                      <span className="flex items-center">
                        <Users className="w-5 h-5 text-gray-600 mr-2" />
                        Membres de l'équipe ({currentTeam.members?.length || 0})
                      </span>
                    </h4>
                    {currentTeam.members && currentTeam.members.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentTeam.members.map((member) => (
                          <div key={member.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                                  {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{member.name}</div>
                                  <div className="text-sm text-gray-600">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      member.role === 'leader' ? 'bg-blue-100 text-blue-800' :
                                      member.role === 'collector' ? 'bg-green-100 text-green-800' :
                                      member.role === 'driver' ? 'bg-orange-100 text-orange-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {member.role === 'leader' ? 'Leader' :
                                       member.role === 'collector' ? 'Collecteur' :
                                       member.role === 'driver' ? 'Conducteur' : member.role}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Rejoint le: {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                {member.phone && (
                                  <div className="text-gray-600 mb-1">{member.phone}</div>
                                )}
                                {member.email && (
                                  <div className="text-gray-500 text-xs">{member.email}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500">Aucun membre supplémentaire dans l'équipe</p>
                        <p className="text-sm text-gray-400 mt-1">L'équipe ne contient que le chef d'équipe</p>
                      </div>
                    )}
                  </div>

                  {/* Planning actuel de l'équipe */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 text-green-600 mr-2" />
                      Planning actuel de l'équipe
                    </h4>
                    {weeklySchedules.length > 0 ? (
                      <div className="space-y-3">
                        {weeklySchedules.slice(0, 3).map((schedule) => (
                          <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">
                                {new Date(schedule.date).toLocaleDateString('fr-FR')} - {schedule.route.length} points
                              </div>
                              <div className="text-sm text-gray-600">
                                {schedule.start_time} - {schedule.estimated_end_time} | Camion {schedule.truck_id || schedule.truck}
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                              {getStatusText(schedule.status)}
                            </span>
                          </div>
                        ))}
                        {weeklySchedules.length > 3 && (
                          <div className="text-center py-2">
                            <button
                              onClick={() => setActiveTab('planning')}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Voir tous les plannings ({weeklySchedules.length})
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>Aucun planning actif pour l'équipe</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Informations d'équipe non disponibles</h3>
                  <p className="text-gray-600">
                    Impossible de charger les informations de votre équipe.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Équipe assignée: {userTeamId}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Onglet Incidents */}
          {activeTab === 'incidents' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Incidents actifs</h2>
              {activeIncidents.length > 0 ? (
                <div className="space-y-4">
                  {activeIncidents.map((incident) => (
                    <div key={incident.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-red-900">
                            {incident.type === 'traffic' ? 'Problème de circulation' :
                             incident.type === 'breakdown' ? 'Panne' :
                             incident.type === 'accident' ? 'Accident' :
                             incident.type === 'weather' ? 'Météo' : 'Autre'}
                          </h3>
                          <p className="text-sm text-red-800">{incident.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          incident.severity === 'high' ? 'bg-red-200 text-red-900' :
                          incident.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                          'bg-blue-200 text-blue-900'
                        }`}>
                          {incident.severity === 'high' ? 'Élevée' :
                           incident.severity === 'medium' ? 'Moyenne' : 'Faible'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-red-700 mb-2">
                        <MapPin className="mr-1 h-4 w-4" />
                        {incident.location.address}
                      </div>
                      {incident.estimatedDelay > 0 && (
                        <div className="text-sm text-red-800">
                          Retard estimé: {incident.estimatedDelay} minutes
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-300 mb-4" />
                  <p>Aucun incident en cours</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de signalement d'incident */}
      <IncidentModal 
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
      />
    </div>
  );
};
