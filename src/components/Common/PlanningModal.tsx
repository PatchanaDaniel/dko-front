import React, { useState } from 'react';
import { X, Calendar, Truck, MapPin, Clock, Plus, Trash2 } from 'lucide-react';
import { mockCollectionPoints, mockTrucks } from '../../data/mockData';
import { schedulesAPI } from '../../services/api';

interface PlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanningModal: React.FC<PlanningModalProps> = ({ isOpen, onClose }) => {
  const [teamId, setTeamId] = useState('');
  const [date, setDate] = useState('');
  const [truckId, setTruckId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTrucks = mockTrucks.filter(truck => truck.status === 'available');
  const teams = ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'];

  const handlePointToggle = (pointId: string) => {
    setSelectedPoints(prev => 
      prev.includes(pointId) 
        ? prev.filter(id => id !== pointId)
        : [...prev, pointId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Appel API réel avec Django backend
      const newSchedule = {
        team: 1,
        truck: truckId,
        date,
        start_time: startTime,
        estimated_end_time: calculateEndTime(startTime, selectedPoints.length),
        route: selectedPoints
      };
      
      const response = await schedulesAPI.create(newSchedule);
      
      if (response.success) {
      
      // Reset form
      setTeamId('');
      setDate('');
      setTruckId('');
      setStartTime('');
      setSelectedPoints([]);
      
        alert('Planning créé avec succès !');
        onClose();
      } else {
        alert('Erreur lors de la création du planning');
      }
    } catch (error) {
      console.error('Erreur lors de la création du planning:', error);
      alert('Erreur lors de la création. Veuillez réessayer.');
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
              Créer un nouveau planning
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenu */}
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
                    <option key={team} value={team}>
                      Équipe {team.split('-')[1].charAt(0).toUpperCase() + team.split('-')[1].slice(1)}
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
                </label>
                <select
                  id="truckId"
                  value={truckId}
                  onChange={(e) => setTruckId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un camion</option>
                  {availableTrucks.map((truck) => (
                    <option key={truck.id} value={truck.id}>
                      {truck.plateNumber} - {truck.driverName}
                    </option>
                  ))}
                </select>
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

            {/* Points de collecte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Points de collecte à inclure * ({selectedPoints.length} sélectionnés)
              </label>
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md">
                {mockCollectionPoints.map((point) => (
                  <div
                    key={point.id}
                    className={`p-3 border-b border-gray-200 last:border-b-0 cursor-pointer transition-colors ${
                      selectedPoints.includes(point.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handlePointToggle(point.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedPoints.includes(point.id)}
                          onChange={() => handlePointToggle(point.id)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{point.name}</h4>
                          <p className="text-sm text-gray-600">{point.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          point.status === 'full' ? 'bg-red-100 text-red-800' :
                          point.status === 'half' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {point.status === 'full' ? 'Plein' :
                           point.status === 'half' ? 'À moitié' : 'Vide'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {point.type === 'bin' ? 'Poubelle' : 
                           point.type === 'container' ? 'Conteneur' : 'Recyclage'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Résumé */}
            {selectedPoints.length > 0 && startTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Résumé du planning</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Points de collecte:</span>
                    <span className="ml-2 font-medium">{selectedPoints.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Durée estimée:</span>
                    <span className="ml-2 font-medium">{selectedPoints.length * 30} minutes</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Fin estimée:</span>
                    <span className="ml-2 font-medium">{calculateEndTime(startTime, selectedPoints.length)}</span>
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
                disabled={!teamId || !date || !truckId || !startTime || selectedPoints.length === 0 || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Création...' : 'Créer le planning'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};