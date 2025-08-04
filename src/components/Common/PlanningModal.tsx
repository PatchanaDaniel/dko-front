import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Plus, ArrowUp, ArrowDown, Trash2, MapPin } from 'lucide-react';
import { schedulesAPI, teamsAPI, trucksAPI, collectionPointsAPI } from '../../services/api';
import { Team, Truck as TruckType, CollectionPoint, Schedule } from '../../types';

interface PlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: Schedule | null;
  mode?: 'create' | 'edit';
  onSubmit?: (data: any) => Promise<void>;
}

export const PlanningModal: React.FC<PlanningModalProps> = ({ 
  isOpen, 
  onClose, 
  schedule = null, 
  mode = 'create',
  onSubmit 
}) => {
  const [teamId, setTeamId] = useState('');
  const [date, setDate] = useState('');
  const [truckId, setTruckId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [status, setStatus] = useState<'planned' | 'in_progress' | 'completed' | 'cancelled'>('planned');
  const [orderedPoints, setOrderedPoints] = useState<CollectionPoint[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour les données de l'API
  const [teams, setTeams] = useState<Team[]>([]);
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les données depuis l'API
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Initialiser les champs en mode édition
  useEffect(() => {
    if (isOpen && schedule && mode === 'edit') {
      setTeamId(schedule.team_id || '');
      setDate(schedule.date || '');
      setTruckId(schedule.truck || '');
      setStartTime(schedule.start_time || '');
      setStatus(schedule.status || 'planned');
      setOrderedPoints(schedule.route ? schedule.route.map(r => r.collection_point) : []);
    } else if (isOpen && mode === 'create') {
      // Réinitialiser les champs en mode création
      setTeamId('');
      setDate('');
      setTruckId('');
      setStartTime('');
      setStatus('planned');
      setOrderedPoints([]);
    }
  }, [isOpen, schedule, mode]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les équipes
      const teamsResponse = await teamsAPI.getAll();
      if (teamsResponse.success && teamsResponse.data?.results) {
        setTeams(teamsResponse.data.results);
      }

      // Charger les camions
      const trucksResponse = await trucksAPI.getAll();
      if (trucksResponse.success && trucksResponse.data?.results) {
        setTrucks(trucksResponse.data.results);
      }

      // Charger les points de collecte
      const pointsResponse = await collectionPointsAPI.getAll();
      if (pointsResponse.success && pointsResponse.data?.results) {
        setCollectionPoints(pointsResponse.data.results);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      alert('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour gérer l'ordre des points de collecte
  const addPoint = (point: CollectionPoint) => {
    if (!orderedPoints.some(p => p.id === point.id)) {
      setOrderedPoints(prev => [...prev, point]);
    }
  };

  const removePoint = (pointId: string) => {
    setOrderedPoints(prev => prev.filter(p => p.id !== pointId));
  };

  const movePointUp = (index: number) => {
    if (index > 0) {
      setOrderedPoints(prev => {
        const newOrder = [...prev];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        return newOrder;
      });
    }
  };

  const movePointDown = (index: number) => {
    if (index < orderedPoints.length - 1) {
      setOrderedPoints(prev => {
        const newOrder = [...prev];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        return newOrder;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scheduleData = {
        team_id: teamId,
        team: teamId,
        truck: truckId,
        date,
        start_time: startTime,
        estimated_end_time: calculateEndTime(startTime, orderedPoints.length),
        route: orderedPoints.map(point => point.id), // Envoi seulement les IDs
        status: status
      };

      // Si une fonction onSubmit est fournie, l'utiliser (pour les CRUD du CoordinatorView)
      if (onSubmit) {
        await onSubmit(scheduleData);
      } else {
        // Sinon utiliser l'appel API direct (comportement par défaut)
        const response = await schedulesAPI.create(scheduleData);
        
        if (response.success) {
          alert('Planning créé avec succès !');
          onClose();
        } else {
          alert('Erreur lors de la création du planning');
        }
      }

      // Reset form
      setTeamId('');
      setDate('');
      setTruckId('');
      setStartTime('');
      setStatus('planned');
      setOrderedPoints([]);
      
    } catch (error) {
      console.error('Erreur lors de la soumission du planning:', error);
      alert('Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEndTime = (start: string, pointsCount: number) => {
    if (!start) return '';
    const [hours, minutes] = start.split(':').map(Number);
    const estimatedDuration = pointsCount * 30; // 30 min par point
    const endTime = new Date();
    endTime.setHours(hours, minutes + estimatedDuration);
    return endTime.toTimeString().slice(0, 5);
  };

  // Helper function pour afficher le statut du camion
  const getTruckStatusLabel = (status: string) => {
    switch (status) {
      case 'collecting': return 'En collecte';
      case 'available': return 'Disponible';
      case 'maintenance': return 'En maintenance';
      case 'offline': return 'Hors ligne';
      case 'unavailable': return 'Indisponible';
      default: return 'Statut inconnu';
    }
  };

  // Helper function pour vérifier si un camion peut être utilisé pour un planning
  const canUseTruckForScheduling = (truck: TruckType) => {
    // Pour la création : seuls les camions disponibles
    // Pour l'édition : permettre plus de flexibilité
    if (mode === 'edit') {
      return truck.status !== 'maintenance'; // En édition, on peut utiliser des camions sauf ceux en maintenance
    }
    return truck.status === 'available';
  };

  // Helper function pour obtenir un camion sélectionné
  const getSelectedTruck = () => {
    return trucks.find(t => t.id === truckId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="mr-2 h-6 w-6 text-blue-600" />
              {mode === 'edit' ? 'Modifier le planning' : 'Créer un nouveau planning'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenu */}
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-gray-100">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm8 8a8 8 0 01-8-8H0c0 6.627 5.373 12 12 12v-4z"></path>
                </svg>
                Chargement des données...
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Équipe */}
              <div>
                <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-1">
                  Équipe *
                </label>
                <select
                  id="teamId"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une équipe</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Camion */}
              <div>
                <label htmlFor="truckId" className="block text-sm font-medium text-gray-700 mb-1">
                  Camion * 
                  <span className="text-xs text-gray-500 ml-2">
                    ({trucks.filter(t => t.status === 'available').length}/{trucks.length} disponibles)
                  </span>
                </label>
                <select
                  id="truckId"
                  value={truckId}
                  onChange={(e) => setTruckId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un camion</option>
                  {trucks.map((truck) => (
                    <option key={truck.id} value={truck.id}>
                      {truck.plate_number} - {truck.driver_name} 
                      {truck.status !== 'available' && (
                        ` (${getTruckStatusLabel(truck.status)})`
                      )}
                    </option>
                  ))}
                </select>
                {!!truckId && (() => {
                  const selectedTruck = getSelectedTruck();
                  return selectedTruck && !canUseTruckForScheduling(selectedTruck) && (
                    <div className="mt-1">
                      <p className="text-sm text-red-600 font-medium">
                        ⚠️ Ce camion n'est pas disponible actuellement. 
                        {mode === 'create' ? ' Impossible de créer un planning.' : ' Modification avec précaution.'}
                      </p>
                      <p className="text-xs text-gray-600">
                        Statut actuel : <span className="font-medium">{getTruckStatusLabel(selectedTruck.status)}</span>
                      </p>
                      {selectedTruck.status === 'unavailable' && (
                        <div className="mt-2">
                          <p className="text-xs text-blue-600 mb-2">
                            💡 Conseil : Changez le statut du camion pour pouvoir créer des plannings.
                          </p>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const response = await trucksAPI.update(selectedTruck.id, { status: 'available' });
                                if (response.success) {
                                  // Mettre à jour la liste des camions locale
                                  setTrucks(prev => prev.map(t => 
                                    t.id === selectedTruck.id 
                                      ? { ...t, status: 'available' as const }
                                      : t
                                  ));
                                  alert('Statut du camion mis à jour vers "Disponible"');
                                } else {
                                  alert('Erreur lors de la mise à jour du statut');
                                }
                              } catch (error) {
                                console.error('Erreur:', error);
                                alert('Erreur lors de la mise à jour du statut');
                              }
                            }}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Rendre disponible
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Heure de début */}
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de début *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Statut - seulement en mode édition */}
            {mode === 'edit' && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Statut du planning
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'planned' | 'in_progress' | 'completed' | 'cancelled')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="planned">Planifié</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Modifiez le statut pour refléter l'état actuel de cette planification
                </p>
              </div>
            )}

            {/* Points de collecte ordonnés */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Points disponibles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Points de collecte disponibles
                </label>
                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md">
                  {collectionPoints
                    .filter(point => !orderedPoints.some(p => p.id === point.id))
                    .map((point) => (
                    <div
                      key={point.id}
                      className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addPoint(point)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Plus className="mr-3 h-4 w-4 text-green-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">{point.name}</h4>
                            <p className="text-sm text-gray-600">{point.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            point.status === 'full' ? 'bg-red-100 text-red-800' :
                            point.status === 'half' ? 'bg-yellow-100 text-yellow-800' :
                            point.status === 'overflow' ? 'bg-red-100 text-red-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {point.status === 'full' ? 'Plein' :
                             point.status === 'half' ? 'À moitié' :
                             point.status === 'overflow' ? 'Débordement' : 'Vide'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {point.type === 'bin' ? 'Poubelle' : 
                             point.type === 'container' ? 'Conteneur' : 'Recyclage'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {collectionPoints.filter(point => !orderedPoints.some(p => p.id === point.id)).length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Tous les points ont été ajoutés à la route
                    </div>
                  )}
                </div>
              </div>

              {/* Route ordonnée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Route planifiée ({orderedPoints.length} points)
                </label>
                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md bg-blue-50">
                  {orderedPoints.length > 0 ? (
                    orderedPoints.map((point, index) => (
                      <div
                        key={point.id}
                        className="p-3 border-b border-blue-200 last:border-b-0 bg-white mx-1 my-1 rounded transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex flex-col space-y-1 mr-3">
                              <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                                {point.name}
                              </h4>
                              <p className="text-sm text-gray-600">{point.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => movePointUp(index)}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-blue-600 hover:bg-blue-100'
                              }`}
                              title="Monter"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => movePointDown(index)}
                              disabled={index === orderedPoints.length - 1}
                              className={`p-1 rounded ${
                                index === orderedPoints.length - 1 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-blue-600 hover:bg-blue-100'
                              }`}
                              title="Descendre"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removePoint(point.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Retirer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      Aucun point ajouté à la route<br />
                      <span className="text-xs">Cliquez sur un point à gauche pour l'ajouter</span>
                    </div>
                  )}
                </div>
                {orderedPoints.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    💡 Utilisez les flèches ↑↓ pour réorganiser l'ordre de collecte
                  </div>
                )}
              </div>
            </div>

            {/* Résumé */}
            {orderedPoints.length > 0 && startTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Résumé du planning</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Points de collecte:</span>
                    <span className="ml-2 font-medium">{orderedPoints.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Durée estimée:</span>
                    <span className="ml-2 font-medium">{orderedPoints.length * 30} minutes</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Fin estimée:</span>
                    <span className="ml-2 font-medium">{calculateEndTime(startTime, orderedPoints.length)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Statut:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      status === 'completed' ? 'bg-green-100 text-green-800' :
                      status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {status === 'completed' ? 'Terminé' :
                       status === 'in_progress' ? 'En cours' :
                       status === 'cancelled' ? 'Annulé' : 'Planifié'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={
                  !teamId || 
                  !date || 
                  !truckId || 
                  !startTime || 
                  orderedPoints.length === 0 || 
                  isSubmitting || 
                  (() => {
                    const selectedTruck = getSelectedTruck();
                    return selectedTruck && !canUseTruckForScheduling(selectedTruck);
                  })()
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting 
                  ? (mode === 'edit' ? 'Modification...' : 'Création...') 
                  : (mode === 'edit' ? 'Modifier le planning' : 'Créer le planning')
                }
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};