import React, { useState } from 'react';
import { MapPin, AlertTriangle, CheckCircle, Clock, Camera, Plus, Filter } from 'lucide-react';
import { mockCollectionPoints } from '../../data/mockData';
import { collectionPointsAPI, reportsAPI } from '../../services/api';

export const PRNAgentView: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'bg-green-100 text-green-800';
      case 'half': return 'bg-yellow-100 text-yellow-800';
      case 'full': return 'bg-orange-100 text-orange-800';
      case 'overflow': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'empty': return 'Vide';
      case 'half': return 'À moitié plein';
      case 'full': return 'Plein';
      case 'overflow': return 'Débordement';
      default: return 'Inconnu';
    }
  };

  const updatePointStatus = async (pointId: string, newStatus: string) => {
    try {
      const response = await collectionPointsAPI.updateStatus(pointId, newStatus as any);
      if (response.success) {
        alert(`Statut du point ${pointId} mis à jour: ${newStatus}`);
      } else {
        alert('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const reportIssue = async (pointId: string) => {
    // Cette fonction pourrait ouvrir un modal de signalement
    // ou créer directement un signalement basique
    alert(`Signalement créé pour le point ${pointId}`);
  };

  const filteredPoints = mockCollectionPoints.filter(point => {
    if (selectedFilter === 'all') return true;
    return point.status === selectedFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPin className="mr-3 h-8 w-8 text-purple-600" />
              Interface Agent PRN
            </h1>
            <p className="text-gray-600 mt-1">
              Surveillez et mettez à jour l'état des points de collecte
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tous les points</option>
                <option value="empty">Vides</option>
                <option value="half">À moitié pleins</option>
                <option value="full">Pleins</option>
                <option value="overflow">Débordements</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {mockCollectionPoints.filter(p => p.status === 'empty').length}
            </div>
            <div className="text-sm text-green-700">Vides</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {mockCollectionPoints.filter(p => p.status === 'half').length}
            </div>
            <div className="text-sm text-yellow-700">À moitié</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {mockCollectionPoints.filter(p => p.status === 'full').length}
            </div>
            <div className="text-sm text-orange-700">Pleins</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {mockCollectionPoints.filter(p => p.status === 'overflow').length}
            </div>
            <div className="text-sm text-red-700">Débordements</div>
          </div>
        </div>
      </div>

      {/* Liste des points de collecte */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Points de collecte ({filteredPoints.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredPoints.map((point) => (
            <div
              key={point.id}
              className={`p-6 transition-colors ${
                selectedPoint === point.id ? 'bg-purple-50 border-l-4 border-purple-500' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-5 h-5 text-gray-600 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">{point.name}</h3>
                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(point.status)}`}>
                      {getStatusText(point.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{point.address}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Dernière collecte: {new Date(point.lastCollection).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Prochaine collecte: {new Date(point.nextCollection).toLocaleDateString()}
                    </div>
                    <div>
                      Type: {point.type === 'bin' ? 'Poubelle' : 
                             point.type === 'container' ? 'Conteneur' : 'Recyclage'}
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updatePointStatus(point.id, 'empty')}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                    >
                      Marquer vide
                    </button>
                    <button
                      onClick={() => updatePointStatus(point.id, 'half')}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
                    >
                      À moitié plein
                    </button>
                    <button
                      onClick={() => updatePointStatus(point.id, 'full')}
                      className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 transition-colors"
                    >
                      Plein
                    </button>
                    <button
                      onClick={() => updatePointStatus(point.id, 'overflow')}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Débordement
                    </button>
                    <button
                      onClick={() => reportIssue(point.id)}
                      className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors flex items-center"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Signaler problème
                    </button>
                  </div>
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  <button
                    onClick={() => setSelectedPoint(selectedPoint === point.id ? null : point.id)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    {selectedPoint === point.id ? 'Masquer' : 'Détails'}
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 text-sm">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Détails étendus */}
              {selectedPoint === point.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Historique */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Historique récent</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Dernière mise à jour:</span>
                          <span className="font-medium">Aujourd'hui 14:30</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Statut précédent:</span>
                          <span className="font-medium">À moitié plein</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Collectes ce mois:</span>
                          <span className="font-medium">8</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions avancées */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                      <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">
                          Programmer collecte urgente
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                          Voir sur la carte
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                          Historique complet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Points nécessitant une attention */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            Points nécessitant une attention
          </h2>
        </div>
        
        <div className="p-6">
          {mockCollectionPoints.filter(p => p.status === 'overflow' || p.status === 'full').length > 0 ? (
            <div className="space-y-3">
              {mockCollectionPoints
                .filter(p => p.status === 'overflow' || p.status === 'full')
                .map((point) => (
                  <div key={point.id} className={`p-4 rounded-lg border ${
                    point.status === 'overflow' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className={`font-medium ${
                          point.status === 'overflow' ? 'text-red-900' : 'text-orange-900'
                        }`}>
                          {point.name}
                        </h4>
                        <p className={`text-sm ${
                          point.status === 'overflow' ? 'text-red-700' : 'text-orange-700'
                        }`}>
                          {point.status === 'overflow' ? 'Débordement détecté' : 'Conteneur plein'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className={`px-3 py-1 text-sm rounded ${
                          point.status === 'overflow' 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        } transition-colors`}>
                          Action immédiate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="mx-auto h-12 w-12 text-green-300 mb-4" />
              <p>Tous les points de collecte sont en bon état</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};