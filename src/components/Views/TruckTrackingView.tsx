import React, { useState } from 'react';
import { Truck, MapPin, Clock, Navigation, AlertTriangle, CheckCircle } from 'lucide-react';
import { trucksAPI, schedulesAPI } from '../../services/api';
import { OSRMService } from '../../services/osrm';
import { Truck as TruckType, Schedule } from '../../types';

export const TruckTrackingView: React.FC = () => {
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [loading, setLoading] = useState(true);
  const [estimatedTimes, setEstimatedTimes] = useState<Record<string, number>>({});

  // Charger les camions depuis l'API
  React.useEffect(() => {
    const loadTrucks = async () => {
      try {
        const response = await trucksAPI.getAll();
        if (response.success) {
          setTrucks(response.data.results);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des camions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTrucks();
    
    // Refresh trucks data every 2 minutes to get backend updates
    const trucksInterval = setInterval(loadTrucks, 2 * 60 * 1000);
    
    return () => clearInterval(trucksInterval);
  }, []);

  // Charger les plannings du jour depuis l'API
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  React.useEffect(() => {
    const fetchTodaySchedules = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      try {
        // Utilise l'API pour récupérer tous les plannings
        const response = await schedulesAPI.getAll();
        if (response.success && response.data?.results) {
          // Filtrer les plannings du jour avec une comparaison de date plus robuste
          console.log('Plannings récupérés:', response.data.results);
          console.log('Date du jour:', today);
          
          const filteredSchedules = response.data.results.filter((s: Schedule) => {
            // Normaliser la date du planning pour la comparaison
            const scheduleDate = s.date ? new Date(s.date).toISOString().split('T')[0] : null;
            console.log(`Planning ${s.id}: date=${s.date}, normalized=${scheduleDate}, matches=${scheduleDate === today}`);
            return scheduleDate === today;
          });
          
          console.log('Plannings filtrés pour aujourd\'hui:', filteredSchedules);
          setTodaySchedules(filteredSchedules);
        } else {
          setTodaySchedules([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des plannings:', error);
        setTodaySchedules([]);
      }
    };
    fetchTodaySchedules();
  }, []);

  // Function to update estimated times for all trucks
  const updateEstimatedTimes = async () => {
    console.log('=== Starting updateEstimatedTimes ===');
    console.log('Active trucks:', trucks.filter(t => t.status === 'collecting').length);
    console.log('Today schedules:', todaySchedules.length);
    
    const updates: Record<string, number> = {};
    
    for (const truck of trucks.filter(t => t.status === 'collecting')) {
      console.log(`Processing truck ${truck.id} (${truck.plate_number})`);
      
      if (!truck.current_location?.latitude || !truck.current_location?.longitude) {
        console.log(`Truck ${truck.id} has no valid location:`, truck.current_location);
        continue;
      }
      
      const schedule = todaySchedules.find(s => 
        s.truck_id === truck.id || 
        s.truck === truck.id || 
        s.truck_id === truck.plate_number
      );
      
      console.log(`Schedule found for truck ${truck.id}:`, !!schedule);

      if (schedule?.route && schedule.route.length > 0) {
        console.log(`Processing route with ${schedule.route.length} points for truck ${truck.id}`);
        
        try {
          const estimatedTime = await OSRMService.updateTruckEstimatedTimes(
            truck.id,
            truck.current_location,
            schedule.route
          );
          
          console.log(`Estimated time result for truck ${truck.id}:`, estimatedTime);
          
          if (estimatedTime !== null && estimatedTime !== undefined) {
            updates[truck.id] = estimatedTime;
            console.log(`Added update for truck ${truck.id}: ${estimatedTime} minutes`);
          }
        } catch (error) {
          console.error(`Error calculating time for truck ${truck.id}:`, error);
        }
      } else {
        console.log(`No valid route for truck ${truck.id}`);
      }
    }
    
    console.log('Final updates object:', updates);
    setEstimatedTimes(prev => {
      const newState = { ...prev, ...updates };
      console.log('New estimated times state:', newState);
      return newState;
    });
  };

  // Update estimated times every 30 seconds for debugging, then back to 5 minutes
  React.useEffect(() => {
    if (trucks.length > 0 && todaySchedules.length > 0) {
      console.log('Setting up estimated times calculation...');
      updateEstimatedTimes();
      
      const interval = setInterval(() => {
        console.log('Interval triggered - updating estimated times');
        updateEstimatedTimes();
      }, 30 * 1000); // 30 seconds for debugging
      
      return () => {
        console.log('Clearing estimated times interval');
        clearInterval(interval);
      };
    } else {
      console.log('Not setting up interval - missing data:', { 
        trucksCount: trucks.length, 
        schedulesCount: todaySchedules.length 
      });
    }
  }, [trucks, todaySchedules]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collecting': return 'bg-blue-100 text-blue-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'collecting': return 'En collecte';
      case 'available': return 'Disponible';
      case 'maintenance': return 'Maintenance';
      case 'offline': return 'Hors ligne';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'collecting': return <Navigation className="w-4 h-4" />;
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      default: return <Truck className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Truck className="mr-3 h-8 w-8 text-blue-600" />
              Suivi des Camions
            </h1>
            <p className="text-gray-600 mt-1">
              Suivez en temps réel la position et l'état de tous les camions de collecte
            </p>
          </div>
          
          {/* Statistiques rapides */}
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {trucks.filter(t => t.status === 'collecting').length}
              </div>
              <div className="text-xs text-gray-600">En collecte</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {trucks.filter(t => t.status === 'available').length}
              </div>
              <div className="text-xs text-gray-600">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {trucks.filter(t => t.status === 'maintenance').length}
              </div>
              <div className="text-xs text-gray-600">Maintenance</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des camions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Camions en collecte</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="text-gray-500">Chargement des camions...</div>
                </div>
              ) : (
                trucks
                  .filter(truck => truck.status === 'collecting')
                  .map((truck) => {
                  // Trouver le planning du jour pour ce camion
                  const schedule = todaySchedules.find(
                    (s) =>
                      s.truck_id === truck.id ||
                      s.truck === truck.id ||
                      s.truck_id === truck.plate_number
                  );
                  
                  // Utiliser les points du planning si dispo
                  const routePoints = schedule?.route || [];

                  return (
                  <div
                    key={truck.id}
                    className={`p-6 cursor-pointer transition-colors ${
                      selectedTruck === truck.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTruck(selectedTruck === truck.id ? null : truck.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Truck className="w-5 h-5 text-gray-600 mr-3" />
                          <h3 className="text-lg font-medium text-gray-900">{truck.plate_number}</h3>
                          <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(truck.status)}`}>
                            {getStatusIcon(truck.status)}
                            <span className="ml-1">{getStatusText(truck.status)}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <strong>Conducteur:</strong> {truck.driver_name}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            Position: {truck.current_location?.latitude.toFixed(4)}, {truck.current_location?.longitude.toFixed(4)}
                          </div>
                          {/* Show estimated time to next collection point */}
                          {schedule && routePoints.filter(point => !point.completed).length > 0 && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-blue-600" />
                              <span className="text-blue-600 font-medium">
                                Prochain arrêt: {
                                  // Priorité au temps du backend, sinon temps calculé localement
                                  truck.estimated_time_to_next_point !== undefined
                                    ? `${truck.estimated_time_to_next_point} min`
                                    : estimatedTimes[truck.id] !== undefined
                                    ? `${estimatedTimes[truck.id]} min`
                                    : 'Calcul en cours...'
                                }
                              </span>
                              {truck.estimated_time_last_updated && (
                                <span className="ml-2 text-xs text-gray-500">
                                  (màj: {new Date(truck.estimated_time_last_updated).toLocaleTimeString()})
                                </span>
                              )}
                            </div>
                          )}
                          {truck.estimatedTime && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Arrivée estimée: {truck.estimatedTime} minutes
                            </div>
                          )}
                          {(routePoints.length > 0 || truck.route.length > 0) && (
                            <div>
                              <strong>Prochains arrêts:</strong> {
                                schedule 
                                  ? routePoints
                                      .filter(point => !point.completed)
                                      .slice(0, 2)
                                      .map(point => point.collection_point?.name || `Point ${point.id}`)
                                      .join(', ') || 'Tous les arrêts complétés'
                                  : truck.route.slice(0, 2).map(point => point.name).join(', ')
                              }
                            </div>
                          )}
                          {schedule && routePoints.length > 0 && (
                            <div className="col-span-2">
                              <strong>Progression:</strong> {routePoints.filter(r => r.completed).length}/{routePoints.length} collectes effectuées
                              {/* Priorité au temps du backend dans la progression aussi */}
                              {((truck.estimated_time_to_next_point !== undefined) || (estimatedTimes[truck.id] !== undefined)) && routePoints.filter(point => !point.completed).length > 0 && (
                                <span className="ml-2 text-blue-600 font-medium">
                                  • Prochain dans {truck.estimated_time_to_next_point || estimatedTimes[truck.id]} min
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Détails étendus */}
                    {selectedTruck === truck.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Itinéraire détaillé 
                          {schedule && (
                            <span className="text-sm font-normal text-gray-600 ml-2">
                              ({routePoints.filter(r => r.completed).length}/{routePoints.length} collectés)
                            </span>
                          )}
                        </h4>
                        {(routePoints.length > 0 || truck.route.length > 0) ? (
                          <div className="space-y-2">
                            {schedule && routePoints.length > 0 ? (
                              // Affichage avec ScheduleRoute (avec statut de collecte) - Données de planning prioritaires
                              routePoints.map((routePoint, index) => {
                                const point = routePoint.collection_point;
                                const isCompleted = routePoint.completed;
                                
                                return (
                                  <div key={routePoint.id} className={`flex items-center p-3 border rounded-lg transition-colors ${
                                    isCompleted 
                                      ? 'bg-green-50 border-green-200' 
                                      : 'bg-white border-gray-200'
                                  }`}>
                                    <span className={`w-6 h-6 text-white text-xs rounded-full flex items-center justify-center mr-3 ${
                                      isCompleted ? 'bg-green-600' : 'bg-blue-600'
                                    }`}>
                                      {routePoint.order || index + 1}
                                    </span>
                                    <div className="flex-1">
                                      <div className="font-medium text-sm flex items-center">
                                        {point?.name || `Point ${routePoint.id}`}
                                        {isCompleted && (
                                          <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-600">{point?.address || 'Adresse non disponible'}</div>
                                      {routePoint.estimated_time && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          Heure estimée: {routePoint.estimated_time}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      {isCompleted ? (
                                        <div className="text-xs text-green-600 font-medium">
                                          ✓ Collecté
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-500">
                                          {point?.status === 'full' ? 'Priorité haute' : 
                                           point?.status === 'overflow' ? 'Débordement' :
                                           point?.status === 'half' ? 'À moitié plein' : 'En attente'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : truck.route.length > 0 ? (
                              // Affichage avec CollectionPoint simple (fallback quand pas de planning détaillé)
                              truck.route.map((point, index) => (
                                <div key={point.id} className="flex items-center p-3 border border-gray-200 rounded-lg bg-white">
                                  <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{point.name}</div>
                                    <div className="text-xs text-gray-600">{point.address}</div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {point.status === 'full' ? 'Priorité haute' : 
                                     point.status === 'overflow' ? 'Débordement' :
                                     point.status === 'half' ? 'À moitié plein' : 'Normal'}
                                  </div>
                                </div>
                              ))
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Aucun itinéraire assigné</p>
                        )}
                        
                        {/* Résumé de progression */}
                        {schedule && routePoints.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-blue-900">
                                Planning: {schedule.team_name || schedule.team}
                              </span>
                              <span className="text-blue-700">
                                {schedule.start_time} - {schedule.estimated_end_time}
                              </span>
                            </div>
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-blue-800 mb-1">
                                <span>Progression de la collecte</span>
                                <span>{Math.round((routePoints.filter(r => r.completed).length / routePoints.length) * 100)}%</span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{width: `${(routePoints.filter(r => r.completed).length / routePoints.length) * 100}%`}}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Planning du jour */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Planning Aujourd'hui</h3>
            </div>
            <div className="p-4 space-y-3">
              {todaySchedules.length > 0 ? (
                todaySchedules.map((schedule) => (
                  <div key={schedule.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-sm text-gray-900">Équipe {schedule.team_name || schedule.team}</h4>
                        <p className="text-xs text-gray-600">Camion {schedule.truck_id || schedule.truck}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        schedule.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                        schedule.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.status === 'in_progress' ? 'En cours' :
                         schedule.status === 'completed' ? 'Terminé' : 'Planifié'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div className="flex items-center mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {schedule.start_time} - {schedule.estimated_end_time}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{schedule.route.length} points de collecte</span>
                        <span className="text-green-600 font-medium">
                          {schedule.route.filter(r => r.completed).length} collectés
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Aucun planning pour aujourd'hui</p>
              )}
            </div>
          </div>

          {/* Alertes et incidents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                Alertes
              </h3>
            </div>
            <div className="p-4">
              {trucks.filter(truck => truck.status === 'maintenance').length > 0 ? (
                <div className="space-y-2">
                  {trucks.filter(truck => truck.status === 'maintenance').map((truck) => (
                    <div key={truck.id} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                      <div className="font-medium text-red-800">Camion en maintenance</div>
                      <div className="text-red-600">{truck.plate_number} - {truck.driver_name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucune alerte active</p>
              )}
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Camions opérationnels</span>
                  <span>{Math.round((trucks.filter(t => t.status !== 'maintenance').length / trucks.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{width: `${(trucks.filter(t => t.status !== 'maintenance').length / trucks.length) * 100}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Efficacité collecte</span>
                  <span>89%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '89%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};