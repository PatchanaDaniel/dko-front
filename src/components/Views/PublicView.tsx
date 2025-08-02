import React, { useState } from 'react';
import { MapPin, Clock, Truck, AlertTriangle, Plus } from 'lucide-react';
import { ReportModal } from '../Common/ReportModal';
import { collectionPointsAPI, trucksAPI, reportsAPI } from '../../services/api';
import { CollectionPoint, Truck as TruckType, Report } from '../../types';

export const PublicView: React.FC = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis l'API
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [pointsResponse, trucksResponse, reportsResponse] = await Promise.all([
          collectionPointsAPI.getAll(),
          trucksAPI.getAll(),
          reportsAPI.getAll()
        ]);
        
        if (pointsResponse.success) {
          setCollectionPoints(pointsResponse.data.results);
        }
        
        if (trucksResponse.success) {
          setTrucks(trucksResponse.data.results);
        }
        
        if (reportsResponse.success) {
          setReports(reportsResponse.data.results);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filtrer les données pour l'affichage public
  const publicCollectionPoints = collectionPoints.slice(0, 4);
  const activeTrucks = trucks.filter(truck => truck.status === 'collecting');
  const recentReports = reports.filter(report => report.status === 'resolved').slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return 'text-green-600 bg-green-100';
      case 'half': return 'text-yellow-600 bg-yellow-100';
      case 'full': return 'text-orange-600 bg-orange-100';
      case 'overflow': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'empty': return 'Vide';
      case 'half': return 'À moitié';
      case 'full': return 'Plein';
      case 'overflow': return 'Débordement';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="space-y-8">
      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Chargement des données...</div>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Bienvenue sur Déchets KO
          </h1>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Votre plateforme pour une gestion intelligente et écologique des déchets. 
            Suivez les collectes, trouvez les points de dépôt et participez à un environnement plus propre.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setShowReportModal(true)}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Signaler un problème
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Points de collecte</p>
              <p className="text-2xl font-bold text-gray-900">{collectionPoints.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Camions actifs</p>
              <p className="text-2xl font-bold text-gray-900">{activeTrucks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Signalements traités</p>
              <p className="text-2xl font-bold text-gray-900">{recentReports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Temps de réponse</p>
              <p className="text-2xl font-bold text-gray-900">4.2h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Points de collecte */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MapPin className="mr-2 h-6 w-6 text-green-600" />
            Points de collecte à proximité
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicCollectionPoints.map((point) => (
              <div key={point.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{point.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(point.status)}`}>
                    {getStatusText(point.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{point.address}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Type: {point.type === 'bin' ? 'Poubelle' : point.type === 'container' ? 'Conteneur' : 'Recyclage'}</span>
                  <span>Prochaine collecte: {new Date(point.nextCollection).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suivi des camions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Truck className="mr-2 h-6 w-6 text-blue-600" />
            Camions en cours de collecte
          </h2>
        </div>
        <div className="p-6">
          {activeTrucks.length > 0 ? (
            <div className="space-y-4">
              {activeTrucks.map((truck) => (
                <div key={truck.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">Camion {truck.plate_number}</h3>
                      <p className="text-sm text-gray-600">Conducteur: {truck.driver_name}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        En collecte
                      </span>
                      {truck.estimated_time && (
                        <p className="text-sm text-gray-600 mt-1">
                          Arrivée estimée: {truck.estimated_time} min
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Prochains arrêts: {truck.route.map(point => point.name).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun camion en collecte actuellement</p>
          )}
        </div>
      </div>

      {/* Modal de signalement */}
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};