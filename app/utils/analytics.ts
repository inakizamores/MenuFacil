import { incrementQRCodeViews } from '@/app/actions/qrCodes';

interface TrackQRViewParams {
  qrId: string;
  source?: 'scan' | 'direct' | 'share';
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'other';
  location?: string;
}

/**
 * Tracks when a QR code is viewed or scanned
 * 
 * @param params Object containing tracking information
 * @returns Promise<boolean> indicating if tracking was successful
 */
export const trackQRCodeView = async (params: TrackQRViewParams): Promise<boolean> => {
  const { qrId, source = 'direct', deviceType = 'other', location } = params;
  
  try {
    // Detect device type if not provided
    const detectedDeviceType = deviceType || detectDeviceType();
    
    // Store analytics metadata in localStorage for reference
    if (typeof window !== 'undefined') {
      try {
        const analyticsData = {
          source,
          deviceType: detectedDeviceType,
          location,
          timestamp: new Date().toISOString(),
        };
        
        // Store analytics data in localStorage
        localStorage.setItem(`qr_view_${qrId}`, JSON.stringify(analyticsData));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    // Track the view in the database by incrementing the counter
    return await incrementQRCodeViews(qrId);
  } catch (error) {
    console.error('Failed to track QR code view:', error);
    return false;
  }
};

/**
 * Detects the user's device type based on window size and user agent
 * 
 * @returns 'mobile' | 'tablet' | 'desktop' | 'other'
 */
const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' | 'other' => {
  if (typeof window === 'undefined') return 'other';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for mobile devices
  if (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  ) {
    // Distinguish between tablets and phones
    const isTablet = /ipad|tablet/i.test(userAgent) || 
      (window.innerWidth >= 768 && window.innerWidth <= 1024);
    
    return isTablet ? 'tablet' : 'mobile';
  }
  
  // Check for desktop
  if (window.innerWidth > 1024) {
    return 'desktop';
  }
  
  return 'other';
};

/**
 * Tracks analytics event when user exports a QR code
 * 
 * @param format The format of the export (png, svg, pdf)
 * @param qrId The ID of the QR code being exported
 */
export const trackQRCodeExport = async (
  format: 'png' | 'svg' | 'pdf', 
  qrId?: string
): Promise<void> => {
  try {
    // Here you could connect to a more sophisticated analytics system
    // For now, we just log the event
    console.log(`QR code export: ${format}${qrId ? `, ID: ${qrId}` : ', batch export'}`);
    
    // Store export event in localStorage for reference
    if (typeof window !== 'undefined' && qrId) {
      try {
        const timestamp = new Date().toISOString();
        const key = `qr_export_${qrId}_${timestamp}`;
        localStorage.setItem(key, format);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  } catch (error) {
    console.error('Failed to track QR code export:', error);
  }
}; 