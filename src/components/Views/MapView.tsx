import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { MapPin, Navigation, Clock, Truck, AlertTriangle, Filter, Target, Eye, Locate, Route, X, Navigation2 } from 'lucide-react';
import { collectionPointsAPI, trucksAPI } from '../../services/api';
import { CollectionPoint, Truck as TruckType } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Interface pour la position utilisateur
interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Interface pour l'itinéraire
interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  instructions: string[];
}

// Icônes personnalisées pour les points de collecte
const createCollectionPointIcon = (status: string, isSelected: boolean = false) => {
  const color = getStatusColor(status);
  const size = isSelected ? 32 : 20;
  const borderWidth = isSelected ? 4 : 3;
  const pulseAnimation = isSelected ? `
    animation: pulse 2s infinite;
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  ` : '';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <style>
        ${pulseAnimation}
      </style>
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: ${borderWidth}px solid ${isSelected ? '#FFD700' : 'white'};
        box-shadow: 0 ${isSelected ? 6 : 2}px ${isSelected ? 12 : 4}px rgba(0,0,0,${isSelected ? 0.5 : 0.3});
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        ${isSelected ? 'animation: pulse 2s infinite;' : ''}
      ">
        <div style="
          width: ${size * 0.4}px;
          height: ${size * 0.4}px;
          background-color: white;
          border-radius: 50%;
        "></div>
        ${isSelected ? `
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            width: 16px;
            height: 16px;
            background-color: #FFD700;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #333;
          ">★</div>
        ` : ''}
      </div>
    `,
    iconSize: [size + (borderWidth * 2), size + (borderWidth * 2)],
    iconAnchor: [(size + (borderWidth * 2)) / 2, (size + (borderWidth * 2)) / 2]
  });
};

// Icône personnalisée pour les camions
const createTruckIcon = (isSelected: boolean = false) => {
  const size = isSelected ? 32 : 24;
  const borderColor = isSelected ? '#FFD700' : 'white';
  const borderWidth = isSelected ? 3 : 2;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: #3B82F6;
        width: ${size}px;
        height: ${size}px;
        border-radius: 4px;
        border: ${borderWidth}px solid ${borderColor};
        box-shadow: 0 ${isSelected ? 4 : 2}px ${isSelected ? 8 : 4}px rgba(0,0,0,${isSelected ? 0.5 : 0.3});
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${isSelected ? 16 : 12}px;
        ${isSelected ? 'animation: pulse 2s infinite;' : ''}
      ">
        🚛
        ${isSelected ? `
          <div style="
            position: absolute;
            top: -6px;
            right: -6px;
            width: 12px;
            height: 12px;
            background-color: #FFD700;
            border: 1px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #333;
          ">★</div>
        ` : ''}
      </div>
    `,
    iconSize: [size + (borderWidth * 2), size + (borderWidth * 2)],
    iconAnchor: [(size + (borderWidth * 2)) / 2, (size + (borderWidth * 2)) / 2]
  });
};

// Icône pour la position de l'utilisateur
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: #3B82F6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
        position: relative;
        animation: userPulse 2s infinite;
      ">
        <style>
          @keyframes userPulse {
            0% { box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5), 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5), 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5), 0 0 0 0 rgba(59, 130, 246, 0); }
          }
        </style>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'empty': return '#10B981';
    case 'half': return '#F59E0B';
    case 'full': return '#F97316';
    case 'overflow': return '#EF4444';
    default: return '#6B7280';
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

const getTruckStatusColor = (status: string) => {
  switch (status) {
    case 'collecting': return 'bg-blue-500';
    case 'available': return 'bg-green-500';
    case 'maintenance': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

// Fonction pour calculer un itinéraire simple (simulation)
const calculateRoute = async (start: UserLocation, end: CollectionPoint): Promise<RouteData> => {
  // Simulation d'un appel API de routage
  // En production, vous utiliseriez une vraie API comme OpenRouteService, Mapbox, ou Google Directions
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Calcul simple de distance à vol d'oiseau
      const distance = Math.sqrt(
        Math.pow(end.latitude - start.latitude, 2) + 
        Math.pow(end.longitude - start.longitude, 2)
      ) * 111000; // Approximation en mètres
      
      // Simulation d'un itinéraire avec quelques points intermédiaires
      const latDiff = end.latitude - start.latitude;
      const lonDiff = end.longitude - start.longitude;
      
      const coordinates: [number, number][] = [
        [start.latitude, start.longitude],
        [start.latitude + latDiff * 0.3, start.longitude + lonDiff * 0.3],
        [start.latitude + latDiff * 0.7, start.longitude + lonDiff * 0.7],
        [end.latitude, end.longitude]
      ];
      
      const duration = Math.round(distance / 50); // Estimation: 50 m/min à pied
      
      const instructions = [
        "Dirigez-vous vers le nord",
        "Continuez tout droit",
        "Tournez à droite",
        "Vous êtes arrivé à destination"
      ];
      
      resolve({
        coordinates,
        distance: Math.round(distance),
        duration,
        instructions
      });
    }, 1000);
  });
};

// Composant pour centrer la carte sur un point spécifique
const MapController: React.FC<{ 
  selectedPoint: CollectionPoint | null;
  selectedTruck: TruckType | null;
  userLocation: UserLocation | null;
  centerOnUser: boolean;
  onCenterOnUserComplete: () => void;
}> = ({ selectedPoint, selectedTruck, userLocation, centerOnUser, onCenterOnUserComplete }) => {
  const map = useMap();
  
  useEffect(() => {
    if (centerOnUser && userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 16, {
        animate: true,
        duration: 1
      });
      onCenterOnUserComplete();
    } else if (selectedTruck) {
      // Centrer et zoomer sur le camion sélectionné
      map.setView([selectedTruck.current_location.latitude, selectedTruck.current_location.longitude], 16, {
        animate: true,
        duration: 1
      });
    } else if (selectedPoint) {
      // Centrer et zoomer sur le point sélectionné
      map.setView([selectedPoint.latitude, selectedPoint.longitude], 16, {
        animate: true,
        duration: 1
      });
    } else {
      // Vue par défaut sur Dakar
      map.setView([14.7167,-17.5000], 13);
    }
  }, [map, selectedPoint, selectedTruck, userLocation, centerOnUser, onCenterOnUserComplete]);
  
  return null;
};

export const MapView: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<TruckType | null>(null);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [centerOnUser, setCenterOnUser] = useState(false);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Charger les données depuis l'API au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pointsResponse, trucksResponse] = await Promise.all([
          collectionPointsAPI.getAll(),
          trucksAPI.getAll()
        ]);
        
        if (pointsResponse.success) {
          setCollectionPoints(pointsResponse.data.results);
        }
        
        if (trucksResponse.success) {
          setTrucks(trucksResponse.data.results);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredPoints = collectionPoints.filter(point => {
    if (selectedFilter === 'all') return true;
    return point.status === selectedFilter;
  });

  const handlePointSelect = (point: CollectionPoint) => {
    if (selectedPoint?.id === point.id) {
      setSelectedPoint(null); // Désélectionner si déjà sélectionné
      setRoute(null); // Effacer l'itinéraire
    } else {
      setSelectedPoint(point); // Sélectionner le nouveau point
      setRoute(null); // Effacer l'ancien itinéraire
      setSelectedTruck(null); // Désélectionner le camion
    }
  };

  const handleTruckSelect = (truck: TruckType) => {
    if (selectedTruck?.id === truck.id) {
      setSelectedTruck(null); // Désélectionner si déjà sélectionné
    } else {
      setSelectedTruck(truck); // Sélectionner le nouveau camion
      setSelectedPoint(null); // Désélectionner le point
      setRoute(null); // Effacer l'itinéraire
    }
  };

  const handleLocatePoint = (point: CollectionPoint) => {
    setSelectedPoint(point);
    setSelectedTruck(null);
    setRoute(null);
    // Scroll vers la carte si nécessaire
    const mapElement = document.querySelector('.leaflet-container');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleLocateTruck = (truck: TruckType) => {
    setSelectedTruck(truck);
    setSelectedPoint(null);
    setRoute(null);
    // Scroll vers la carte si nécessaire
    const mapElement = document.querySelector('.leaflet-container');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  // Fonction pour obtenir la géolocalisation
  const getUserLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par ce navigateur');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setCenterOnUser(true);
        setIsLocating(false);
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
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Fonction pour calculer l'itinéraire
  const calculateRouteToPoint = async () => {
    if (!userLocation || !selectedPoint) return;

    setIsCalculatingRoute(true);
    try {
      const routeData = await calculateRoute(userLocation, selectedPoint);
      setRoute(routeData);
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Fonction pour effacer l'itinéraire
  const clearRoute = () => {
    setRoute(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="text-gray-500">Chargement de la carte...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPin className="mr-3 h-8 w-8 text-green-600" />
              Carte Interactive
            </h1>
            <p className="text-gray-600 mt-1">
              Visualisez les points de collecte, suivez les camions et tracez votre itinéraire
            </p>
            
            {/* Indicateurs d'état */}
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedPoint && (
                <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  <Target className="w-4 h-4 mr-1" />
                  Point sélectionné: {selectedPoint.name}
                  <button 
                    onClick={() => {
                      setSelectedPoint(null);
                      setRoute(null);
                    }}
                    className="ml-2 text-blue-800 hover:text-blue-900"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {selectedTruck && (
                <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  <Truck className="w-4 h-4 mr-1" />
                  Camion sélectionné: {selectedTruck.plate_number}
                  <button 
                    onClick={() => setSelectedTruck(null)}
                    className="ml-2 text-blue-800 hover:text-blue-900"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {userLocation && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <Locate className="w-4 h-4 mr-1" />
                  Position détectée
                </div>
              )}
              
              {route && (
                <div className="flex items-center text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  <Route className="w-4 h-4 mr-1" />
                  Itinéraire: {route.distance}m ({route.duration} min)
                  <button 
                    onClick={clearRoute}
                    className="ml-2 text-purple-800 hover:text-purple-900"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Contrôles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Boutons de géolocalisation et navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={getUserLocation}
                disabled={isLocating}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isLocating 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Locate className="w-4 h-4 mr-1" />
                {isLocating ? 'Localisation...' : 'Me localiser'}
              </button>
              
              {userLocation && selectedPoint && (
                <button
                  onClick={calculateRouteToPoint}
                  disabled={isCalculatingRoute}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isCalculatingRoute 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <Navigation2 className="w-4 h-4 mr-1" />
                  {isCalculatingRoute ? 'Calcul...' : 'Itinéraire'}
                </button>
              )}
            </div>
            
            {/* Filtre */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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

        {/* Erreur de géolocalisation */}
        {locationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm text-red-700">{locationError}</span>
            </div>
          </div>
        )}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {collectionPoints.filter(p => p.status === 'empty').length}
            </div>
            <div className="text-sm text-green-700">Vides</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {collectionPoints.filter(p => p.status === 'half').length}
            </div>
            <div className="text-sm text-yellow-700">À moitié</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {collectionPoints.filter(p => p.status === 'full').length}
            </div>
            <div className="text-sm text-orange-700">Pleins</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {collectionPoints.filter(p => p.status === 'overflow').length}
            </div>
            <div className="text-sm text-red-700">Débordements</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte OpenStreetMap */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-96 relative">
              <MapContainer
                center={[14.7167,-17.5000]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController 
                  selectedPoint={selectedPoint} 
                  selectedTruck={selectedTruck}
                  userLocation={userLocation}
                  centerOnUser={centerOnUser}
                  onCenterOnUserComplete={() => setCenterOnUser(false)}
                />
                
                {/* Marqueur pour la position de l'utilisateur */}
                {userLocation && (
                  <Marker
                    position={[userLocation.latitude, userLocation.longitude]}
                    icon={createUserLocationIcon()}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-medium text-blue-900 mb-1">📍 Votre position</h3>
                        <div className="text-xs text-gray-600">
                          <div>Latitude: {userLocation.latitude.toFixed(6)}</div>
                          <div>Longitude: {userLocation.longitude.toFixed(6)}</div>
                          {userLocation.accuracy && (
                            <div>Précision: ±{Math.round(userLocation.accuracy)}m</div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}
                
                {/* Tracé de l'itinéraire */}
                {route && (
                  <Polyline
                    positions={route.coordinates}
                    color="#8B5CF6"
                    weight={4}
                    opacity={0.8}
                    dashArray="10, 10"
                  />
                )}
                
                {/* Marqueurs pour les points de collecte */}
                {filteredPoints.map((point) => (
                  <Marker
                    key={point.id}
                    position={[point.latitude, point.longitude]}
                    icon={createCollectionPointIcon(point.status, selectedPoint?.id === point.id)}
                    eventHandlers={{
                      click: () => handlePointSelect(point)
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-medium text-gray-900 mb-1">{point.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{point.address}</p>
                        <div className="flex items-center mb-2">
                          <span 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{backgroundColor: getStatusColor(point.status)}}
                          ></span>
                          <span className="text-xs font-medium">{getStatusText(point.status)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <div>Type: {point.type === 'bin' ? 'Poubelle' : point.type === 'container' ? 'Conteneur' : 'Recyclage'}</div>
                          <div>Dernière collecte: {new Date(point.lastCollection).toLocaleDateString()}</div>
                          <div>Prochaine collecte: {new Date(point.nextCollection).toLocaleDateString()}</div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <button
                            onClick={() => handlePointSelect(point)}
                            className="w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            {selectedPoint?.id === point.id ? 'Désélectionner' : 'Sélectionner'}
                          </button>
                          {userLocation && selectedPoint?.id === point.id && (
                            <button
                              onClick={calculateRouteToPoint}
                              disabled={isCalculatingRoute}
                              className="w-full px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                              {isCalculatingRoute ? 'Calcul...' : 'Tracer itinéraire'}
                            </button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Marqueurs pour les camions */}
                {trucks.filter(truck => truck.status === 'collecting').map((truck) => (
                  <Marker
                    key={truck.id}
                    position={[truck.current_location.latitude, truck.current_location.longitude]}
                    icon={createTruckIcon(selectedTruck?.id === truck.id)}
                    eventHandlers={{
                      click: () => handleTruckSelect(truck)
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-medium text-gray-900 mb-1">Camion {truck.plate_number}</h3>
                        <p className="text-xs text-gray-600 mb-2">Conducteur: {truck.driverName}</p>
                        <div className="text-xs">
                          <div className="mb-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              En collecte
                            </span>
                          </div>
                          {truck.estimatedTime && (
                            <div className="text-gray-600">
                              Arrivée estimée: {truck.estimatedTime} min
                            </div>
                          )}
                          <div className="text-gray-600 mt-1">
                            Prochains arrêts: {truck.route.slice(0, 2).map(point => point.name).join(', ')}
                          </div>
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => handleTruckSelect(truck)}
                            className="w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            {selectedTruck?.id === truck.id ? 'Désélectionner' : 'Sélectionner'}
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Légende améliorée */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Vide</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span>À moitié</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span>Plein</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>Débordement</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2 flex items-center justify-center text-white text-xs">🚛</div>
                  <span>Camion en collecte</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 border-2 border-white"></div>
                  <span>Votre position</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2 flex items-center justify-center text-xs">★</div>
                  <span>Point sélectionné</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-1 bg-purple-500 mr-2" style={{borderStyle: 'dashed'}}></div>
                  <span>Itinéraire</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Informations d'itinéraire */}
          {route && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Route className="w-5 h-5 text-purple-600 mr-2" />
                  Itinéraire
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{route.distance}m</div>
                    <div className="text-xs text-purple-700">Distance</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{route.duration} min</div>
                    <div className="text-xs text-purple-700">Durée estimée</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-900">Instructions:</h4>
                  {route.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start text-xs text-gray-600">
                      <span className="w-4 h-4 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={clearRoute}
                  className="w-full mt-4 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  Effacer l'itinéraire
                </button>
              </div>
            </div>
          )}
          
          {/* Points de collecte */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Points de Collecte</h3>
              <p className="text-sm text-gray-600 mt-1">Cliquez sur un point pour le localiser sur la carte</p>
            </div>
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {filteredPoints.map((point) => (
                <div
                  key={point.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPoint?.id === point.id 
                      ? 'border-yellow-400 bg-yellow-50 shadow-md transform scale-105' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => handlePointSelect(point)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <h4 className="font-medium text-sm text-gray-900">{point.name}</h4>
                      {selectedPoint?.id === point.id && (
                        <span className="ml-2 text-yellow-500">★</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{backgroundColor: getStatusColor(point.status)}}
                      ></span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLocatePoint(point);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Localiser sur la carte"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {userLocation && selectedPoint?.id === point.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            calculateRouteToPoint();
                          }}
                          disabled={isCalculatingRoute}
                          className="text-purple-600 hover:text-purple-800 transition-colors disabled:opacity-50"
                          title="Tracer un itinéraire"
                        >
                          <Navigation2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{point.address}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className={`font-medium ${
                      selectedPoint?.id === point.id ? 'text-yellow-700' : ''
                    }`}>
                      {getStatusText(point.status)}
                    </span>
                    <span>{point.type === 'bin' ? 'Poubelle' : point.type === 'container' ? 'Conteneur' : 'Recyclage'}</span>
                  </div>
                  {selectedPoint?.id === point.id && (
                    <div className="mt-2 pt-2 border-t border-yellow-200">
                      <div className="text-xs text-yellow-700">
                        <div>Dernière collecte: {new Date(point.lastCollection).toLocaleDateString()}</div>
                        <div>Prochaine collecte: {new Date(point.nextCollection).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Camions actifs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Camions Actifs</h3>
            </div>
            <div className="p-4 space-y-3">
              {trucks.filter(truck => truck.status === 'collecting').map((truck) => (
                <div 
                  key={truck.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedTruck?.id === truck.id 
                      ? 'border-yellow-400 bg-yellow-50 shadow-md transform scale-105' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => handleTruckSelect(truck)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-sm text-gray-900">{truck.plate_number}</h4>
                        {selectedTruck?.id === truck.id && (
                          <span className="ml-2 text-yellow-500">★</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{truck.driverName}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        En collecte
                      </span>
                      {truck.estimatedTime && (
                        <div className="text-xs text-gray-600 mt-1 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {truck.estimatedTime} min
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLocateTruck(truck);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors mt-1"
                        title="Localiser sur la carte"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    Prochains: {truck.route.slice(0, 2).map(point => point.name).join(', ')}
                  </div>
                  {selectedTruck?.id === truck.id && (
                    <div className="mt-2 pt-2 border-t border-yellow-200">
                      <div className="text-xs text-yellow-700">
                        <div>Position: {truck.current_location.latitude.toFixed(4)}, {truck.current_location.longitude.toFixed(4)}</div>
                        <div>Prochains arrêts: {truck.route.length} points</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Alertes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                Alertes
              </h3>
            </div>
            <div className="p-4">
              {collectionPoints.filter(p => p.status === 'overflow' || p.status === 'full').length > 0 ? (
                <div className="space-y-2">
                  {collectionPoints.filter(p => p.status === 'overflow' || p.status === 'full').map((point) => (
                    <div 
                      key={point.id} 
                      className="p-2 bg-red-50 border border-red-200 rounded text-sm cursor-pointer hover:bg-red-100 transition-colors"
                      onClick={() => handleLocatePoint(point)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-red-800">
                            {point.status === 'overflow' ? 'Débordement détecté' : 'Conteneur plein'}
                          </div>
                          <div className="text-red-600">{point.name}</div>
                        </div>
                        <Eye className="w-4 h-4 text-red-600" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucune alerte active</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};