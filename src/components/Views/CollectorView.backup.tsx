import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, AlertTriangle, CheckCircle, Clock, Truck, Plus, Navigation, Wrench, Locate, Wifi, Users } from 'lucide-react';
import { IncidentModal } from '../Common/IncidentModal';
import { useAuth } from '../../context/AuthContext';
import { trucksAPI, collectionPointsAPI, incidentsAPI, schedulesAPI, teamsAPI } from '../../services/api';
import { Incident, Schedule, Team } from '../../types';

export const CollectorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [truckStatus, setTruckStatus] = useState('collecting'); // État du camion de l'équipe
  const [completedPoints, setCompletedPoints] = useState<string[]>([]); // Points collectés
  const { user } = useAuth();
  const userTeamId = user?.teamId || 'team-alpha';
  const [watchId, setWatchId] = useState<number | null>(null);

  // State for GPS tracking
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Données filtrées pour l'équipe de collecte
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [weeklySchedules, setWeeklySchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      const response = await incidentsAPI.getAll();
      if (response.success && response.data?.results) {
        // Filtrer les incidents actifs
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
          // Trouver l'équipe de l'utilisateur
          const userTeam = response.data.results.find(team => team.id === userTeamId);
          setCurrentTeam(userTeam || null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des équipes:', error);
      }
    };
    fetchTeams();
  }, [userTeamId]);

  //dynamic loading of weekly schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const response = await schedulesAPI.getAll();
        if (response.success && response.data?.results) {
          // Filtrer les plannings pour l'équipe de l'utilisateur
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
    // Helper pour obtenir le jour de la semaine en français
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
    // Appeler l'API pour mettre à jour le statut du planning à 'in_progress'
    const startRoute = async () => {
      try {
        const response = await schedulesAPI.update(scheduleId, { status: 'in_progress' });
        if (response.success) {
          // Recharger les plannings pour refléter les changements
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
    // Appeler l'API pour mettre à jour le statut du planning à 'completed'
    const completeRoute = async () => {
      try {
        const response = await schedulesAPI.update(scheduleId, { status: 'completed' });
        if (response.success) {
          // Recharger les plannings pour refléter les changements
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

  const handleCompleteCollection = (pointId: string) => {
    // TODO: Implémenter la logique de confirmation de collecte
    alert(`Collecte confirmée pour le point ${pointId}`);
  };

  const handleReportIncident = () => {
    setShowIncidentModal(true);
  };

  const handleTruckStatusChange = async (newStatus: string) => {
    setTruckStatus(newStatus);
    
    try {
      // Appel API réel pour mettre à jour le statut du camion
      const response = await trucksAPI.updateStatus('1', newStatus as 'collecting' | 'available' | 'maintenance' | 'offline' | 'unavailable'); // ID du camion à adapter
      
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

  // Marquer un point de collecte comme collecté (et mettre à jour le backend)
  const handleConfirmCollection = async (pointId: string, pointName: string) => {
    if (!completedPoints.includes(pointId)) {
      setCompletedPoints([...completedPoints, pointId]);
      try {
        // Appel API réel pour confirmer la collecte (statut du point)
        await collectionPointsAPI.updateStatus(pointId, 'empty');

        // Mettre à jour le ScheduleRoute comme complété (nouvel appel PATCH)
        // On cherche le planning du jour et le ScheduleRoute correspondant
        const todaySchedule = weeklySchedules.find(
          (schedule) =>
            schedule.date === getTodayDate() &&
            (schedule.team_id === userTeamId || schedule.team === user?.teamId)
        );
        if (todaySchedule && todaySchedule.route) {
          // Chercher le ScheduleRoute correspondant au point
          const routePoint = todaySchedule.route.find(
            (rp: any) => rp.collection_point && rp.collection_point.id === pointId
          );
          if (routePoint && routePoint.id) {
            // PATCH /api/scheduleroutes/<id>/
            await fetch(
              `${import.meta.env.VITE_API_BASE_URL }/scheduleroutes/${routePoint.id}/`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  ...(localStorage.getItem('authToken')
                    ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
                    : {}),
                },
                body: JSON.stringify({ completed: true }),
              }
            );
          }
        }

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

  // Helper to get today's date in YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper to get truck id (database id, not plate_number) for the current team from today's schedule
  const getTodayTruckId = () => {
    const schedule = weeklySchedules.find(
      (s) =>
        s.date === getTodayDate() &&
        (s.team_id === userTeamId || s.team === user?.teamId)
    );
    // Use truck (database id), not truck_id (plate_number)
    
    return schedule?.truck || '1'; // fallback to '1' if not found
  };

  // Filter schedules for today and current user's team
  const todaySchedule = weeklySchedules.filter(
    (schedule) =>
      schedule.date === getTodayDate() &&
      (schedule.team_id === userTeamId || schedule.team === user?.teamId)
  );
  // Fonction pour démarrer le suivi GPS
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par ce navigateur');
      return;
    }

    setIsTracking(true);
    setLocationError(null);

    const truckId = getTodayTruckId();

    // Get initial position and update backend
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCurrentLocation(location);
        // Update backend with truck position
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
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    // Continuous tracking and backend update
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCurrentLocation(location);
        // Update backend with truck position
        trucksAPI.updateLocation(truckId, location);
      },
      (error) => {
        console.error('Erreur de suivi GPS:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 30000
      }
    );
    setWatchId(id);
  };

  // Stop GPS tracking
  const stopLocationTracking = () => {
    setIsTracking(false);
    setCurrentLocation(null);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    alert('Suivi GPS arrêté');
  };


 

  function getAddressFromCoordinates(latitude: number, longitude: number): React.ReactNode {
    // For demo: show coordinates as a string. In real app, use a reverse geocoding API.
    return (
      <span>
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </span>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header avec actions rapides */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Interface Équipe de Collecte</h1>
         {/* Statut GPS et localisation */}
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Locate className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">
                  Suivi GPS du camion
                  {/* Affiche l'ID du camion si disponible */}
                  {(() => {
                    const todayTruckId = getTodayTruckId();
                    return todayTruckId ? (
                      <span className="ml-2 text-xs text-green-700 font-normal">
                        (ID: {todayTruckId})
                      </span>
                    ) : null;
                  })()}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    <Wifi className="w-3 h-3 mr-1" />
                    {isTracking ? 'GPS Actif' : 'GPS Inactif'}
                  </span>
                  {!isTracking ? (
                    <button
                      className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      onClick={startLocationTracking}
                    >
                      Démarrer le suivi GPS
                    </button>
                  ) : (
                    <button
                      className="ml-2 px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                      onClick={stopLocationTracking}
                    >
                      Arrêter le suivi GPS
                    </button>
                  )}
                </div>
                {currentLocation && (
                  <div className="text-sm text-green-700 mt-1">
                    📍 {getAddressFromCoordinates(currentLocation.latitude, currentLocation.longitude)}
                  </div>
                )}
                {locationError && (
                  <div className="text-sm text-red-600 mt-1">
                    ⚠️ {locationError}
                  </div>
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
                <h3 className="font-medium text-blue-900">Camion DK-001-AB</h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTruckStatusColor(truckStatus)}`}>
                    {getTruckStatusIcon(truckStatus)}
                    <span className="ml-1">{getTruckStatusText(truckStatus)}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Boutons changement statut */}
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
          <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            <CheckCircle className="mr-2 h-5 w-5" />
            Confirmer arrivée
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'schedule', label: 'Planning de l\'Équipe', icon: Calendar },
              { id: 'team', label: 'Ma Équipe', icon: Users },
              { id: 'incidents', label: 'Incidents', icon: Truck },
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
          {activeTab === 'schedule' && (
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
                            className={`p-2 rounded text-xs ${getStatusColor(schedule.status)}`}
                          >
                            <div className="font-medium">
                              {schedule.start_time} - {schedule.estimated_end_time}
                            </div>
                            <div>{schedule.route.length} points</div>
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
                            Équipe {schedule.team_name} - Camion {schedule.truck_id}
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
                        <h4 className="font-medium text-gray-700 mb-2">Itinéraire ({schedule.route.length} points)</h4>
                        <div className="space-y-2">
                          {schedule.route.map((point, index) => (
                            <div key={point.collection_point.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              completedPoints.includes(point.collection_point.id) 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex items-center">
                                <span className={`w-6 h-6 text-white text-xs rounded-full flex items-center justify-center mr-3 ${
                                  completedPoints.includes(point.collection_point.id) ? 'bg-green-600' : 'bg-blue-600'
                                }`}>
                                  {index + 1}
                                </span>
                                <div>
                                  <div className="font-medium text-sm">{point.collection_point.name}</div>
                                  <div className="text-xs text-gray-600">{point.collection_point.address}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Type: {point.collection_point.type === 'bin' ? 'Poubelle' : 
                                           point.collection_point.type === 'container' ? 'Conteneur' : 'Recyclage'} | 
                                    Statut: {point.collection_point.status === 'full' ? 'Plein' : 
                                             point.collection_point.status === 'half' ? 'À moitié' : 
                                             point.collection_point.status === 'empty' ? 'Vide' : 'Débordement'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {completedPoints.includes(point.collection_point.id) ? (
                                  <div className="flex items-center text-green-600 text-sm font-medium">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Collecté
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleConfirmCollection(point.collection_point.id, point.collection_point.name)}
                                    className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Confirmer collecte
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progression de la tournée */}
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-blue-900">Progression de la tournée</span>
                          <span className="text-sm text-blue-700">
                            {completedPoints.length}/{schedule.route.length} points collectés
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{width: `${(completedPoints.length / schedule.route.length) * 100}%`}}
                          ></div>
                        </div>
                      </div>

                      {schedule.status === 'planned' && (
                        <button
                          onClick={() => handleStartRoute(schedule.id)}
                          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Démarrer la tournée
                        </button>
                      )}
                      
                      {schedule.status === 'in_progress' && completedPoints.length === schedule.route.length && (
                        <button
                          onClick={() => alert('Tournée terminée avec succès !')}
                          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Terminer la tournée
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Aucun planning pour votre équipe aujourd'hui</p>
                  <p className="text-sm mt-2">Équipe: {userTeamId.split('-')[1]?.charAt(0).toUpperCase() + userTeamId.split('-')[1]?.slice(1)}</p>
                </div>
              )}
            </div>
          )}

          {/* Onglet Équipe */}
          {activeTab === 'team' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mon Équipe</h2>
              {currentTeam ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-medium text-gray-900">{currentTeam.name}</h3>
                      <p className="text-sm text-gray-600">Spécialisation: {currentTeam.specialization}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      currentTeam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {currentTeam.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Chef d'équipe</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-blue-600 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">{currentTeam.leader_name}</div>
                            <div className="text-sm text-gray-600">Leader ID: {currentTeam.leaderId}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Membres de l'équipe</h4>
                      <div className="space-y-2">
                        {currentTeam.members && currentTeam.members.length > 0 ? (
                          currentTeam.members.map((member) => (
                            <div key={member.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm text-gray-900">{member.name}</div>
                                  <div className="text-xs text-gray-600">{member.role}</div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {member.phone && member.phone}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">Aucun membre supplémentaire</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{currentTeam.members?.length || 0}</div>
                        <div className="text-sm text-gray-600">Membres</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{weeklySchedules.length}</div>
                        <div className="text-sm text-gray-600">Plannings actifs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {weeklySchedules.reduce((total, schedule) => total + schedule.route.length, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Points de collecte</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Informations d'équipe non disponibles</p>
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
                      <div className="flex items-start">
                        <AlertTriangle className="h-6 w-6 text-red-600 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-red-900 mb-1">
                            {incident.type === 'traffic' ? 'Problème de circulation' :
                             incident.type === 'breakdown' ? 'Panne véhicule' : 'Autre incident'}
                          </h3>
                          <p className="text-red-800 mb-2">{incident.description}</p>
                          <div className="text-sm text-red-700 mb-2">
                            <strong>Impact:</strong> {incident.impact}
                          </div>
                          <div className="flex items-center text-sm text-red-600">
                            <MapPin className="mr-1 h-4 w-4" />
                            {incident.location.address}
                          </div>
                        </div>
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                          +{incident.estimatedDelay} min
                        </span>
                      </div>
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