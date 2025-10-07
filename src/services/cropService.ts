import { supabase } from '../lib/supabase';
import type { Crop, PricePrediction } from '../lib/supabase';

export interface PricePredictionWithCrop extends PricePrediction {
  crop: Crop;
}

export class CropService {
  static async getCrops(): Promise<Crop[]> {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('crops')
          .select('*')
          .order('name');

        if (error) throw error;
        return data || [];
      } else {
        // Mock crops data
        return [
          { id: '1', name: 'Rice', category: 'cereals', created_at: new Date().toISOString() },
          { id: '2', name: 'Cotton', category: 'cash_crops', created_at: new Date().toISOString() },
          { id: '3', name: 'Tomato', category: 'vegetables', created_at: new Date().toISOString() },
        ];
      }
    } catch (error) {
      console.error('Get crops error:', error);
      throw error;
    }
  }

  static async getCropById(cropId: string): Promise<Crop | null> {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('id', cropId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get crop by ID error:', error);
      return null;
    }
  }

  static async getPricePredictions(filters?: {
    cropId?: string;
    location?: string;
  }): Promise<PricePredictionWithCrop[]> {
    try {
      if (isSupabaseConfigured) {
        let query = supabase
          .from('price_predictions')
          .select(`
            *,
            crop:crops!inner(*)
          `)
          .order('prediction_date', { ascending: false });

        if (filters?.cropId) {
          query = query.eq('crop_id', filters.cropId);
        }

        if (filters?.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
      } else {
        // Mock price predictions with dynamic dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return [
          {
            id: 'pred1',
            crop_id: '1',
            location: 'Andhra Pradesh',
            predicted_price: 2650 + Math.floor(Math.random() * 200),
            prediction_date: tomorrow.toISOString().split('T')[0],
            confidence_score: 0.85 + Math.random() * 0.1,
            created_at: new Date().toISOString(),
            crop: { id: '1', name: 'Rice', category: 'cereals', created_at: new Date().toISOString() }
          },
          {
            id: 'pred2',
            crop_id: '2',
            location: 'Telangana',
            predicted_price: 5800 + Math.floor(Math.random() * 400),
            prediction_date: tomorrow.toISOString().split('T')[0],
            confidence_score: 0.78 + Math.random() * 0.15,
            created_at: new Date().toISOString(),
            crop: { id: '2', name: 'Cotton', category: 'cash_crops', created_at: new Date().toISOString() }
          }
        ];
      }
    } catch (error) {
      console.error('Get price predictions error:', error);
      throw error;
    }
  }

  static async getLatestPrices(cropId?: string): Promise<PricePredictionWithCrop[]> {
    try {
      let query = supabase
        .from('price_predictions')
        .select(`
          *,
          crop:crops!inner(*)
        `)
        .gte('prediction_date', new Date().toISOString().split('T')[0])
        .order('confidence_score', { ascending: false });

      if (cropId) {
        query = query.eq('crop_id', cropId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get latest prices error:', error);
      throw error;
    }
  }

  static async searchCrops(searchTerm: string): Promise<Crop[]> {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Search crops error:', error);
      throw error;
    }
  }

  static calculatePriceChange(current: number, predicted: number): {
    change: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  } {
    const change = predicted - current;
    const percentage = (change / current) * 100;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentage) > 2) {
      trend = percentage > 0 ? 'up' : 'down';
    }

    return {
      change: Math.round(change * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      trend,
    };
  }
}