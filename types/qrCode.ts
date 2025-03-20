/**
 * QR Code design options
 */
export interface QRCodeDesign {
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
  logoUrl?: string;
  cornerRadius?: number;
}

/**
 * QR Code entity
 */
export interface QRCode {
  id: string;
  menuId: string;
  name: string;
  url: string;
  design: QRCodeDesign;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  imageUrl?: string;
  tableNumber?: string;
  isActive?: boolean;
  restaurantId?: string;
} 