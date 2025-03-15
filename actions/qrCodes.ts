'use server';

import { createServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { QRCodeDesign } from '@/app/types/database';

/**
 * Parameters for creating a new QR code
 */
interface CreateQRCodeParams {
  /** ID of the menu this QR code links to */
  menuId: string;
  /** Descriptive name for the QR code */
  name: string;
  /** Visual design properties for the QR code */
  design: QRCodeDesign;
  /** Optional custom URL (if not provided, a default URL will be generated) */
  url?: string;
}

/**
 * Parameters for updating an existing QR code
 */
interface UpdateQRCodeParams {
  /** ID of the QR code to update */
  id: string;
  /** New name for the QR code (optional) */
  name?: string;
  /** Updated design properties (optional) */
  design?: Partial<QRCodeDesign>;
  /** New URL for the QR code (optional) */
  url?: string;
}

/**
 * Get QR codes for a specific menu
 * 
 * Retrieves all QR codes associated with a menu, ordered by creation date (newest first)
 * 
 * @param menuId - The ID of the menu to get QR codes for
 * @returns Object containing QR code data or error message
 */
export async function getMenuQRCodes(menuId: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('menu_id', menuId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching QR codes:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getMenuQRCodes:', error);
    return { data: null, error: 'Failed to load QR codes' };
  }
}

/**
 * Get a single QR code by ID
 * 
 * @param id - The ID of the QR code to retrieve
 * @returns Object containing QR code data or error message
 */
export async function getQRCode(id: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching QR code:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getQRCode:', error);
    return { data: null, error: 'Failed to fetch QR code' };
  }
}

/**
 * Create a new QR code
 * 
 * Generates a new QR code with a unique short code and URL, then saves it to the database
 * 
 * @param params - Parameters for creating the QR code (menuId, name, design, optional url)
 * @returns Object containing the created QR code data or error message
 */
export async function createQRCode(params: CreateQRCodeParams) {
  try {
    const supabase = await createServerClient();
    
    // Generate a short unique code for the QR code
    const shortCode = uuidv4().substring(0, 8);
    
    // If no URL is provided, create a default one
    const url = params.url || `${process.env.NEXT_PUBLIC_APP_URL}/menu/${shortCode}`;
    
    const qrCodeData = {
      id: uuidv4(),
      menu_id: params.menuId,
      name: params.name,
      url,
      short_code: shortCode,
      design: params.design,
      scan_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('qr_codes')
      .insert([qrCodeData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating QR code:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in createQRCode:', error);
    return { data: null, error: 'Failed to create QR code' };
  }
}

/**
 * Update an existing QR code
 * 
 * Updates properties of an existing QR code such as name, design, or URL
 * 
 * @param params - Parameters containing the QR code ID and fields to update
 * @returns Object containing the updated QR code data or error message
 */
export async function updateQRCode(params: UpdateQRCodeParams) {
  try {
    const supabase = await createServerClient();
    
    const { id, ...updates } = params;
    
    // Prepare update data
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.name) updateData.name = updates.name;
    if (updates.url) updateData.url = updates.url;
    if (updates.design) updateData.design = updates.design;
    
    const { data, error } = await supabase
      .from('qr_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating QR code:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateQRCode:', error);
    return { data: null, error: 'Failed to update QR code' };
  }
}

/**
 * Delete a QR code
 * 
 * Permanently removes a QR code from the database
 * 
 * @param id - The ID of the QR code to delete
 * @returns Object indicating success or containing an error message
 */
export async function deleteQRCode(id: string) {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting QR code:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteQRCode:', error);
    return { success: false, error: 'Failed to delete QR code' };
  }
}

/**
 * Track a QR code scan
 * 
 * Increments the scan count for a QR code and records the scan timestamp
 * 
 * @param shortCode - The short code that identifies the QR code
 * @returns Object indicating success or containing an error message
 */
export async function trackQRCodeScan(shortCode: string) {
  try {
    const supabase = await createServerClient();
    
    // First, get the QR code by short code
    const { data: qrCode, error: fetchError } = await supabase
      .from('qr_codes')
      .select('id, scan_count')
      .eq('short_code', shortCode)
      .single();
    
    if (fetchError) {
      console.error('Error fetching QR code:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    if (!qrCode) {
      return { success: false, error: 'QR code not found' };
    }
    
    // Increment the scan count
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({
        scan_count: (qrCode.scan_count || 0) + 1,
        last_scanned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', qrCode.id);
    
    if (updateError) {
      console.error('Error updating scan count:', updateError);
      return { success: false, error: updateError.message };
    }
    
    // Also log the scan in a separate table if needed
    // This could include user agent, IP, etc. for analytics
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in trackQRCodeScan:', error);
    return { success: false, error: 'Failed to track QR code scan' };
  }
} 