import { trucksAPI } from './api';

interface OSRMResponse {
  routes: {
    duration: number; // in seconds
    distance: number; // in meters
  }[];
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export class OSRMService {
  private static readonly OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving/';

  static async calculateTravelTime(
    from: Coordinates,
    to: Coordinates
  ): Promise<{ duration: number; distance: number } | null> {
    console.log('OSRM calculateTravelTime called with:', { from, to });
    
    try {
      const fromCoord = `${from.longitude},${from.latitude}`;
      const toCoord = `${to.longitude},${to.latitude}`;
      
      const url = `${this.OSRM_BASE_URL}${fromCoord};${toCoord}?overview=false&steps=false`;
      console.log('OSRM URL:', url);
      
      const response = await fetch(url);
      console.log('OSRM Response status:', response.status);
      
      if (!response.ok) {
        console.error('OSRM API error:', response.status, response.statusText);
        throw new Error(`OSRM API error: ${response.status}`);
      }
      
      const data: OSRMResponse = await response.json();
      console.log('OSRM Response data:', data);
      
      if (data.routes && data.routes.length > 0) {
        const result = {
          duration: data.routes[0].duration, // seconds
          distance: data.routes[0].distance  // meters
        };
        console.log('OSRM calculation result:', result);
        return result;
      }
      
      console.log('No routes found in OSRM response');
      return null;
    } catch (error) {
      console.error('Erreur lors du calcul du temps de trajet OSRM:', error);
      return null;
    }
  }

  static async updateTruckEstimatedTimes(truckId: string, currentLocation: Coordinates, routePoints: any[]) {
    console.log(`=== Calculating estimated time for truck ${truckId} ===`);
    console.log('Current location:', currentLocation);
    console.log('Route points count:', routePoints.length);
    
    const uncompletedPoints = routePoints.filter(point => !point.completed);
    console.log('Uncompleted points:', uncompletedPoints.length);
    
    if (uncompletedPoints.length === 0) {
      console.log('No uncompleted points - returning null');
      return null;
    }

    const nextPoint = uncompletedPoints[0];
    console.log('Next point:', nextPoint);
    
    if (!nextPoint.collection_point?.latitude || !nextPoint.collection_point?.longitude) {
      console.log('Next point missing coordinates:', nextPoint.collection_point);
      return null;
    }

    const targetCoords = {
      latitude: nextPoint.collection_point.latitude,
      longitude: nextPoint.collection_point.longitude
    };
    console.log('Target coordinates:', targetCoords);

    try {
      const travelInfo = await this.calculateTravelTime(currentLocation, targetCoords);
      console.log('Travel info result:', travelInfo);

      if (travelInfo) {
        // Convert seconds to minutes
        const estimatedMinutes = Math.round(travelInfo.duration / 60);
        console.log(`Final estimated time: ${estimatedMinutes} minutes`);
        
        // Update the backend with the estimated time
        try {
          const response = await trucksAPI.updateEstimatedTime(truckId, {
            estimated_time_to_next_point: estimatedMinutes,
            next_collection_point_id: nextPoint.collection_point.id,
            last_updated: new Date().toISOString()
          });
          
          if (response.success) {
            console.log(`Successfully updated backend for truck ${truckId}`);
            return estimatedMinutes;
          } else {
            console.error(`Failed to update backend for truck ${truckId}:`, response);
            // Still return the calculated time even if backend update fails
            return estimatedMinutes;
          }
        } catch (backendError) {
          console.error(`Error updating backend for truck ${truckId}:`, backendError);
          // Still return the calculated time even if backend update fails
          return estimatedMinutes;
        }
      } else {
        console.log('No travel info calculated');
        return null;
      }
    } catch (error) {
      console.error(`Error in updateTruckEstimatedTimes for truck ${truckId}:`, error);
      return null;
    }
  }
}
