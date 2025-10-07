import { supabase } from '../lib/supabase';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export class LocationService {
  // Get user's current location
  static async getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser.');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get address
            const address = await this.reverseGeocode(latitude, longitude);
            resolve({
              latitude,
              longitude,
              ...address
            });
          } catch (error) {
            console.error('Error getting address:', error);
            resolve({
              latitude,
              longitude,
              address: 'Unknown',
              city: 'Unknown',
              state: 'Unknown',
              pincode: 'Unknown'
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Reverse geocoding to get address from coordinates
  static async reverseGeocode(lat: number, lng: number): Promise<{
    address: string;
    city: string;
    state: string;
    pincode: string;
  }> {
    try {
      // Using a free geocoding service - replace with your preferred service
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_OPENCAGE_API_KEY`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;
        
        return {
          address: result.formatted,
          city: components.city || components.town || components.village || 'Unknown',
          state: components.state || 'Unknown',
          pincode: components.postcode || 'Unknown'
        };
      }
      
      throw new Error('No results found');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to mock data for demonstration
      return {
        address: 'Agricultural Area, Rural Location',
        city: 'Vijayawada',
        state: 'Andhra Pradesh',
        pincode: '520001'
      };
    }
  }

  // Calculate distance between two points
  static calculateDistance(
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Find nearby jobs based on location
  static async findNearbyJobs(
    userLat: number, 
    userLng: number, 
    radiusKm: number = 50
  ): Promise<any[]> {
    try {
      const { data: jobs, error } = await supabase
        .from('job_postings')
        .select(`
          *,
          farmer:farmers!inner(
            *,
            profile:profiles!inner(*)
          )
        `)
        .eq('status', 'open');

      if (error) throw error;

      // Filter jobs by distance
      const nearbyJobs = jobs.filter(job => {
        // For demo, we'll use mock coordinates
        // In real implementation, you'd store coordinates in the database
        const jobLat = userLat + (Math.random() - 0.5) * 0.5; // Mock nearby location
        const jobLng = userLng + (Math.random() - 0.5) * 0.5;
        
        const distance = this.calculateDistance(userLat, userLng, jobLat, jobLng);
        return distance <= radiusKm;
      });

      // Add distance information to jobs
      return nearbyJobs.map(job => ({
        ...job,
        distance: this.calculateDistance(
          userLat, 
          userLng, 
          userLat + (Math.random() - 0.5) * 0.5, 
          userLng + (Math.random() - 0.5) * 0.5
        )
      })).sort((a, b) => a.distance - b.distance);

    } catch (error) {
      console.error('Error finding nearby jobs:', error);
      throw error;
    }
  }

  // Update user location in profile
  static async updateUserLocation(userId: string, locationData: LocationData): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          location: `${locationData.city}, ${locationData.state}`,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user location:', error);
      throw error;
    }
  }
}