'use server';

import { QRCode as DatabaseQRCode } from '@/app/types/database';
import { QRCode, QRCodeDesign } from '@/app/types/qrCode';

/**
 * Converts a database QRCode to an application QRCode
 * This helps bridge the gap between database and application types
 */
export function mapDatabaseToAppQRCode(dbQRCode: DatabaseQRCode): QRCode {
  return {
    id: dbQRCode.id.toString(),
    menuId: dbQRCode.menu_id?.toString() || '',
    restaurantId: dbQRCode.restaurant_id.toString(),
    name: dbQRCode.name,
    description: dbQRCode.description || undefined,
    url: dbQRCode.url,
    imageUrl: dbQRCode.image_url || undefined,
    design: mapQRCodeDesign(dbQRCode.custom_design),
    views: dbQRCode.total_views || 0,
    tableNumber: dbQRCode.table_number || undefined,
    isActive: dbQRCode.is_active,
    createdAt: new Date(dbQRCode.created_at),
    updatedAt: dbQRCode.updated_at ? new Date(dbQRCode.updated_at) : new Date(dbQRCode.created_at)
  };
}

/**
 * Maps QRCodeDesign from database format to application format
 */
function mapQRCodeDesign(dbDesign: any): QRCodeDesign {
  if (!dbDesign) {
    return {
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      margin: 1
    };
  }

  return {
    foregroundColor: dbDesign.foregroundColor || '#000000',
    backgroundColor: dbDesign.backgroundColor || '#FFFFFF',
    margin: typeof dbDesign.margin === 'number' ? dbDesign.margin : 1,
    logoUrl: dbDesign.logoUrl,
    cornerRadius: dbDesign.cornerRadius
  };
}

/**
 * Converts an application QRCode to database format
 */
export function mapAppToDatabaseQRCode(appQRCode: QRCode): Partial<DatabaseQRCode> {
  return {
    id: appQRCode.id as any,
    menu_id: appQRCode.menuId as any,
    restaurant_id: appQRCode.restaurantId as any,
    name: appQRCode.name,
    description: appQRCode.description || null,
    url: appQRCode.url,
    image_url: appQRCode.imageUrl || null,
    custom_design: {
      foregroundColor: appQRCode.design.foregroundColor,
      backgroundColor: appQRCode.design.backgroundColor,
      margin: appQRCode.design.margin,
      logoUrl: appQRCode.design.logoUrl,
      cornerRadius: appQRCode.design.cornerRadius
    },
    table_number: appQRCode.tableNumber || null,
    total_views: appQRCode.views,
    is_active: appQRCode.isActive !== undefined ? appQRCode.isActive : true
  };
} 