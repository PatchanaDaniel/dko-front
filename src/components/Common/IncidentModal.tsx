import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, Clock, Truck } from 'lucide-react';
import { incidentsAPI } from '../../services/api';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({ isOpen, onClose }) => {
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [estimatedDelay, setEstimatedDelay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incidentTypes = [
    { value: 'traffic', label: 'Embouteillage / Circulation', icon: '🚦' },
    { value: 'breakdown', label: 'Panne véhicule', icon: '🔧' },
    { value: 'accident', label: 'Accident', icon: '⚠️' },
    { value: 'weather', label: 'Conditions météo', icon: '🌧️' },
    { value: 'other', label: 'Autre incident', icon: '❓' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Appel API réel avec Django backend
      const newIncident = {
        type: incidentType as any,
        description,
        location: {
          latitude: 48.8566, // À remplacer par la géolocalisation réelle
          longitude: 2.3522,
          address: location
        },
        reported_by: 'Équipe de collecte',
        severity: severity as any,
        impact: description,
        estimatedDelay: parseInt(estimatedDelay) || 0
      };
      
      const response = await incidentsAPI.create(newIncident);
      
      if (response.success) {
      
      // Reset form
      setIncidentType('');
      setDescription('');
      setLocation('');
      setSeverity('medium');
      setEstimatedDelay('');
      
        alert('Incident signalé avec succès !');
        onClose();
      } else {
        alert('Erreur lors du signalement de l\'incident');
      }
    } catch (error) {
      console.error('Erreur lors du signalement de l\'incident:', error);
      alert('Erreur lors du signalement. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6 text-red-600" />
              Signaler un incident
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
            {/* Type d'incident */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type d'incident *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incidentTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setIncidentType(type.value)}
                    className={`
                      flex items-center p-3 border rounded-lg text-left transition-colors
                      ${incidentType === type.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    <span className="text-lg mr-3">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description de l'incident *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Décrivez l'incident et son impact sur la collecte..."
                required
              />
            </div>

            {/* Localisation */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Localisation *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Adresse ou point de repère"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gravité */}
              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                  Gravité
                </label>
                <select
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                </select>
              </div>

              {/* Retard estimé */}
              <div>
                <label htmlFor="estimatedDelay" className="block text-sm font-medium text-gray-700 mb-1">
                  Retard estimé (minutes)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="estimatedDelay"
                    value={estimatedDelay}
                    onChange={(e) => setEstimatedDelay(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

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
                disabled={!incidentType || !description || !location || isSubmitting}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Signalement...' : 'Signaler l\'incident'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};