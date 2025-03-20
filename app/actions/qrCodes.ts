'use server';

import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  increment,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { QRCode, QRCodeDesign } from '@/types/qrCode';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

// Interface for Firebase/legacy params
interface CreateQRCodeParams {
  menuId: string;
  name: string;
  url: string;
  design?: QRCodeDesign;
  restaurantId: string;
}

// Interface for QR code data with Supabase structure
interface QRCodeData {
  id?: string;
  menu_id: string;
  restaurant_id: string;
  name: string;
  url: string;
  design: {
    foregroundColor: string;
    backgroundColor: string;
    logoUrl?: string;
    cornerRadius?: number;
    margin: number;
  };
  views?: number;
}

/**
 * Creates a new QR code in the database
 */
export async function createQRCode({ menuId, name, url, design, restaurantId }: CreateQRCodeParams) {
  try {
    const supabase = await createServerClient();
    
    const qrCode = {
      id: uuidv4(),
      menu_id: menuId,
      restaurant_id: restaurantId,
      name,
      url,
      design: design || {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        margin: 1
      },
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('qr_codes')
      .insert(qrCode)
      .select()
      .single();

    if (error) {
      console.error('Error creating QR code:', error);
      throw new Error(`Failed to create QR code: ${error.message}`);
    }

    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/qr-codes`);
    return data;
  } catch (error: any) {
    console.error('Error in createQRCode:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Retrieves a specific QR code by ID
 */
export async function getQRCode(qrCodeId: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId)
      .single();

    if (error) {
      console.error('Error getting QR code:', error);
      throw new Error(`Failed to get QR code: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error in getQRCode:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Retrieves all QR codes for a specific menu
 */
export async function getQRCodes(menuId: string) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('menu_id', menuId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting QR codes:', error);
      throw new Error(`Failed to get QR codes: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in getQRCodes:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Updates a QR code in the database
 */
export async function updateQRCode(
  qrCodeId: string, 
  updates: Partial<Omit<QRCode, 'id' | 'createdAt' | 'updatedAt'>>,
  restaurantId: string,
  menuId: string
) {
  try {
    const supabase = await createServerClient();
    
    // Convert from legacy format to Supabase format
    const updateData: Record<string, any> = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.url) updateData.url = updates.url;
    if (updates.design) updateData.design = updates.design;
    if (updates.views !== undefined) updateData.views = updates.views;
    
    updateData.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('qr_codes')
      .update(updateData)
      .eq('id', qrCodeId);

    if (error) {
      console.error('Error updating QR code:', error);
      throw new Error(`Failed to update QR code: ${error.message}`);
    }

    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/qr-codes`);
    return true;
  } catch (error: any) {
    console.error('Error in updateQRCode:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Deletes a QR code from the database
 */
export async function deleteQRCode(qrCodeId: string, restaurantId: string, menuId: string) {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', qrCodeId);

    if (error) {
      console.error('Error deleting QR code:', error);
      throw new Error(`Failed to delete QR code: ${error.message}`);
    }

    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/qr-codes`);
    return true;
  } catch (error: any) {
    console.error('Error in deleteQRCode:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Increments the view count for a QR code
 */
export async function incrementQRCodeViews(qrCodeId: string) {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase.rpc('increment_qr_code_views', {
      qr_code_id: qrCodeId
    });

    if (error) {
      console.error('Error incrementing QR code views:', error);
      throw new Error(`Failed to increment QR code views: ${error.message}`);
    }

    return true;
  } catch (error: any) {
    console.error('Error in incrementQRCodeViews:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

/**
 * Create multiple QR codes in a batch
 */
export async function createBatchQRCodes(
  restaurantId: string,
  menuId: string,
  codes: Array<{
    name: string;
    url: string;
    design: {
      foregroundColor: string;
      backgroundColor: string;
      logoUrl?: string;
      cornerRadius?: number;
      margin: number;
    };
  }>
) {
  try {
    const supabase = await createServerClient();
    
    const qrCodes = codes.map(code => ({
      id: uuidv4(),
      menu_id: menuId,
      restaurant_id: restaurantId,
      name: code.name,
      url: code.url,
      design: code.design,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('qr_codes')
      .insert(qrCodes)
      .select();

    if (error) {
      console.error('Error creating batch QR codes:', error);
      throw new Error(`Failed to create batch QR codes: ${error.message}`);
    }

    revalidatePath(`/dashboard/restaurants/${restaurantId}/menus/${menuId}/qr-codes`);
    return data;
  } catch (error: any) {
    console.error('Error in createBatchQRCodes:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }
} 