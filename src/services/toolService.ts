import { supabase } from '../lib/supabase';
import type { FarmingTool, ToolUsage } from '../lib/supabase';

export interface ToolWithUsage extends FarmingTool {
  usage_count?: number;
  avg_rating?: number;
}

export interface CreateToolUsageData {
  tool_id: string;
  usage_date?: string;
  notes?: string;
  effectiveness_rating?: number;
}

export class ToolService {
  static async getFarmingTools(category?: string): Promise<ToolWithUsage[]> {
    try {
      if (isSupabaseConfigured) {
        let query = supabase
          .from('farming_tools')
          .select(`
            *,
            tool_usage(effectiveness_rating)
          `)
          .order('name');

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Calculate usage statistics
        return (data || []).map(tool => {
          const usages = tool.tool_usage || [];
          const ratings = usages
            .map(u => u.effectiveness_rating)
            .filter(r => r !== null && r !== undefined);

          return {
            ...tool,
            usage_count: usages.length,
            avg_rating: ratings.length > 0 
              ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
              : 0,
          };
        });
      } else {
        // Mock farming tools with dynamic data
        const mockTools = [
          {
            id: 'tool1',
            name: 'Smart Irrigation System',
            category: 'Irrigation',
            description: 'Automated drip irrigation system with IoT sensors for optimal water management',
            benefits: ['Water conservation', 'Automated watering', 'Crop monitoring', 'Remote control'],
            suitable_crops: ['Rice', 'Cotton', 'Vegetables', 'Fruits'],
            created_at: new Date().toISOString(),
            usage_count: 45 + Math.floor(Math.random() * 20),
            avg_rating: 4.3 + Math.random() * 0.4,
            cost_estimate: 25000
          },
          {
            id: 'tool2',
            name: 'Soil pH Meter',
            category: 'Testing',
            description: 'Digital soil pH and moisture meter with instant readings',
            benefits: ['Accurate pH measurement', 'Moisture detection', 'Portable design', 'Easy to use'],
            suitable_crops: ['All crops'],
            created_at: new Date().toISOString(),
            usage_count: 128 + Math.floor(Math.random() * 30),
            avg_rating: 4.7 + Math.random() * 0.2,
            cost_estimate: 2500
          },
          {
            id: 'tool3',
            name: 'Drone Crop Sprayer',
            category: 'Spraying',
            description: 'Autonomous drone for precise pesticide and fertilizer application',
            benefits: ['Precision spraying', 'Time saving', 'Reduced chemical waste', 'GPS guided'],
            suitable_crops: ['Cotton', 'Rice', 'Sugarcane', 'Wheat'],
            created_at: new Date().toISOString(),
            usage_count: 23 + Math.floor(Math.random() * 15),
            avg_rating: 4.1 + Math.random() * 0.6,
            cost_estimate: 150000
          },
          {
            id: 'tool4',
            name: 'Weather Station',
            category: 'Monitoring',
            description: 'Comprehensive weather monitoring system with mobile alerts',
            benefits: ['Real-time weather data', 'Mobile notifications', 'Historical data', 'Forecast alerts'],
            suitable_crops: ['All crops'],
            created_at: new Date().toISOString(),
            usage_count: 67 + Math.floor(Math.random() * 25),
            avg_rating: 4.5 + Math.random() * 0.3,
            cost_estimate: 35000
          }
        ];

        // Filter by category if provided
        if (category) {
          return mockTools.filter(tool => tool.category === category);
        }
        
        return mockTools;
      }
    } catch (error) {
      console.error('Get farming tools error:', error);
      throw error;
    }
  }

  static async getToolById(toolId: string): Promise<ToolWithUsage | null> {
    try {
      const { data, error } = await supabase
        .from('farming_tools')
        .select(`
          *,
          tool_usage(effectiveness_rating)
        `)
        .eq('id', toolId)
        .single();

      if (error) throw error;

      const usages = data.tool_usage || [];
      const ratings = usages
        .map(u => u.effectiveness_rating)
        .filter(r => r !== null && r !== undefined);

      return {
        ...data,
        usage_count: usages.length,
        avg_rating: ratings.length > 0 
          ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
          : 0,
      };
    } catch (error) {
      console.error('Get tool by ID error:', error);
      return null;
    }
  }

  static async getToolCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('farming_tools')
        .select('category')
        .order('category');

      if (error) throw error;

      // Get unique categories
      const categories = [...new Set((data || []).map(item => item.category))];
      return categories;
    } catch (error) {
      console.error('Get tool categories error:', error);
      throw error;
    }
  }

  static async recordToolUsage(farmerId: string, usageData: CreateToolUsageData) {
    try {
      const { data, error } = await supabase
        .from('tool_usage')
        .insert({
          farmer_id: farmerId,
          ...usageData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Record tool usage error:', error);
      throw error;
    }
  }

  static async getMyToolUsage(farmerId: string): Promise<(ToolUsage & { tool: FarmingTool })[]> {
    try {
      const { data, error } = await supabase
        .from('tool_usage')
        .select(`
          *,
          tool:farming_tools!inner(*)
        `)
        .eq('farmer_id', farmerId)
        .order('usage_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get my tool usage error:', error);
      throw error;
    }
  }

  static async searchTools(searchTerm: string): Promise<ToolWithUsage[]> {
    try {
      const { data, error } = await supabase
        .from('farming_tools')
        .select(`
          *,
          tool_usage(effectiveness_rating)
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .order('name');

      if (error) throw error;

      return (data || []).map(tool => {
        const usages = tool.tool_usage || [];
        const ratings = usages
          .map(u => u.effectiveness_rating)
          .filter(r => r !== null && r !== undefined);

        return {
          ...tool,
          usage_count: usages.length,
          avg_rating: ratings.length > 0 
            ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
            : 0,
        };
      });
    } catch (error) {
      console.error('Search tools error:', error);
      throw error;
    }
  }

  static async getRecommendedTools(crops: string[]): Promise<ToolWithUsage[]> {
    try {
      const { data, error } = await supabase
        .from('farming_tools')
        .select(`
          *,
          tool_usage(effectiveness_rating)
        `)
        .overlaps('suitable_crops', crops)
        .order('name');

      if (error) throw error;

      return (data || []).map(tool => {
        const usages = tool.tool_usage || [];
        const ratings = usages
          .map(u => u.effectiveness_rating)
          .filter(r => r !== null && r !== undefined);

        return {
          ...tool,
          usage_count: usages.length,
          avg_rating: ratings.length > 0 
            ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
            : 0,
        };
      });
    } catch (error) {
      console.error('Get recommended tools error:', error);
      throw error;
    }
  }
}