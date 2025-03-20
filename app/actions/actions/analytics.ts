'use server';

import { createServerClient } from '@/lib/supabase/server';
import { AnalyticsEvent } from '@/app/types/database';

interface ViewsData {
  date: string;
  count: number;
}

interface DeviceData {
  deviceType: string;
  count: number;
}

interface SourceData {
  source: string;
  count: number;
}

interface AnalyticsSummary {
  totalViews: number;
  weeklyViews: ViewsData[];
  deviceBreakdown: DeviceData[];
  sourceBreakdown: SourceData[];
}

/**
 * Get analytics summary for a restaurant
 */
export async function getRestaurantAnalytics(restaurantId: string): Promise<AnalyticsSummary> {
  try {
    const supabase = await createServerClient();
    
    // Get total views
    const { data: viewsData, error: viewsError } = await supabase
      .from('qr_codes')
      .select('views')
      .eq('restaurant_id', restaurantId);
    
    if (viewsError) {
      console.error('Error fetching total views:', viewsError);
      throw new Error(`Failed to fetch total views: ${viewsError.message}`);
    }
    
    const totalViews = viewsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
    
    // Get weekly views (last 7 days)
    const weeklyViewsData: ViewsData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // For now, we're simulating this data since we don't have daily tracking
      // In a real implementation, this would query a dedicated analytics_events table
      weeklyViewsData.push({
        date: dateString,
        count: Math.floor(Math.random() * 20) + 1 // Placeholder random data
      });
    }
    
    // Get device breakdown (placeholder data)
    const deviceBreakdown: DeviceData[] = [
      { deviceType: 'mobile', count: Math.floor(totalViews * 0.7) },
      { deviceType: 'desktop', count: Math.floor(totalViews * 0.2) },
      { deviceType: 'tablet', count: Math.floor(totalViews * 0.1) }
    ];
    
    // Get source breakdown (placeholder data)
    const sourceBreakdown: SourceData[] = [
      { source: 'scan', count: Math.floor(totalViews * 0.6) },
      { source: 'direct', count: Math.floor(totalViews * 0.3) },
      { source: 'share', count: Math.floor(totalViews * 0.1) }
    ];
    
    return {
      totalViews,
      weeklyViews: weeklyViewsData,
      deviceBreakdown,
      sourceBreakdown
    };
  } catch (error: any) {
    console.error('Error in getRestaurantAnalytics:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Get analytics summary for a menu
 */
export async function getMenuAnalytics(menuId: string): Promise<AnalyticsSummary> {
  try {
    const supabase = await createServerClient();
    
    // Get total views for menu QR codes
    const { data: viewsData, error: viewsError } = await supabase
      .from('qr_codes')
      .select('views')
      .eq('menu_id', menuId);
    
    if (viewsError) {
      console.error('Error fetching menu views:', viewsError);
      throw new Error(`Failed to fetch menu views: ${viewsError.message}`);
    }
    
    const totalViews = viewsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
    
    // Get weekly views (last 7 days)
    const weeklyViewsData: ViewsData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // For now, we're simulating this data
      weeklyViewsData.push({
        date: dateString,
        count: Math.floor(Math.random() * 15) + 1 // Placeholder data
      });
    }
    
    // Get device breakdown (placeholder data)
    const deviceBreakdown: DeviceData[] = [
      { deviceType: 'mobile', count: Math.floor(totalViews * 0.75) },
      { deviceType: 'desktop', count: Math.floor(totalViews * 0.15) },
      { deviceType: 'tablet', count: Math.floor(totalViews * 0.1) }
    ];
    
    // Get source breakdown (placeholder data)
    const sourceBreakdown: SourceData[] = [
      { source: 'scan', count: Math.floor(totalViews * 0.7) },
      { source: 'direct', count: Math.floor(totalViews * 0.2) },
      { source: 'share', count: Math.floor(totalViews * 0.1) }
    ];
    
    return {
      totalViews,
      weeklyViews: weeklyViewsData,
      deviceBreakdown,
      sourceBreakdown
    };
  } catch (error: any) {
    console.error('Error in getMenuAnalytics:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Get analytics for a specific QR code
 */
export async function getQRCodeAnalytics(qrCodeId: string) {
  try {
    const supabase = await createServerClient();
    
    // Get QR code details with views
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId)
      .single();
    
    if (qrError) {
      console.error('Error fetching QR code:', qrError);
      throw new Error(`Failed to fetch QR code: ${qrError.message}`);
    }
    
    return {
      qrCode,
      totalViews: qrCode?.views || 0,
      // Additional analytics data would be fetched here
    };
  } catch (error: any) {
    console.error('Error in getQRCodeAnalytics:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
} 