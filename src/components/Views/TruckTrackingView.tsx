import React, { useState } from 'react';
import { Truck, MapPin, Clock, Navigation, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockSchedules } from '../../data/mockData';
import { trucksAPI } from '../../services/api';
import { Truck as TruckType } from '../../types';

export const TruckTrackingView: React.FC = () => {
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  // Charger les plannings du jour depuis l'API
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  React.useEffect(() => {
    const fetchTodaySchedules = async () => {
      const today = new Date().toISOString().split('T')[0];

      try {
        // Utilise l'API pour récupérer tous les plannings
        const response = await import('../../services/api').then(m => m.schedulesAPI.getAll());
        if (response.success && response.data?.results) {
          // Filtrer les plannings du jour
          console.log(response.data.results)
          setTodaySchedules(response.data.results.filter((s: any) => s.date === today));
        } else {
          setTodaySchedules([]);
        }
      } catch (error) {
        setTodaySchedules([]);
      }
    };
    fetchTodaySchedules();
  }, []);

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

  const today = new Date().toISOString().split('T')[0];
  const todaySchedulesMock = mockSchedules.filter(s => s.date && s.date === today);

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
                  const today = new Date().toISOString().split('T')[0];
                  const schedule = mockSchedules.find(
                    (s) =>
                      s.truckId === truck.id ||
                      s.truckId === truck.plate_number ||
                      s.truckId === truck.id?.toString() ||
                      s.truckId === truck.plateNumber
                  );
                  // Utiliser les points du planning si dispo, sinon truck.route
                  const routePoints = schedule?.route || truck.route;

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
                          {truck.estimated_time && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Arrivée estimée: {truck.estimated_time} minutes
                            </div>
                          )}
                          {routePoints.length > 0 && (
                            <div>
                              <strong>Prochains arrêts:</strong> {routePoints.slice(0, 2).map(point => point.name).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Détails étendus */}
                    {selectedTruck === truck.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Itinéraire détaillé</h4>
                        {routePoints.length > 0 ? (
                          <div className="space-y-2">
                            {routePoints.map((point, index) => (
                              <div key={point.id} className="flex items-center p-2 bg-white border border-gray-200 rounded">
                                <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{point.name}</div>
                                  <div className="text-xs text-gray-600">{point.address}</div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {point.status === 'full' ? 'Priorité haute' : 'Normal'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Aucun itinéraire assigné</p>
                        )}
                      </div>
                    )}
                  </div>
                )})
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
                        <h4 className="font-medium text-sm text-gray-900">Équipe {schedule.teamId}</h4>
                        <p className="text-xs text-gray-600">Camion {schedule.truckId}</p>
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
                        {schedule.startTime} - {schedule.estimatedEndTime}
                      </div>
                      <div>{schedule.route.length} points de collecte</div>
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