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

interface CreateQRCodeParams {
  menuId: string;
  name: string;
  url: string;
  design?: QRCodeDesign;
}

/**
 * Creates a new QR code in the database
 */
export async function createQRCode({ menuId, name, url, design }: CreateQRCodeParams) {
  try {
    const db = getFirestore();
    const qrCodesRef = collection(db, 'qrCodes');
    
    const docRef = await addDoc(qrCodesRef, {
      menuId,
      name,
      url,
      design: design || {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        margin: 1
      },
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        success: true, 
        data: {
          id: docSnap.id,
          menuId: data.menuId,
          name: data.name,
          url: data.url,
          design: data.design,
          views: data.views || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        }
      };
    }
    
    return { success: false, error: 'Failed to create QR code' };
  } catch (error) {
    console.error('Error creating QR code:', error);
    return { success: false, error: 'Failed to create QR code' };
  }
}

/**
 * Retrieves a specific QR code by ID
 */
export async function getQRCode(qrCodeId: string) {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'qrCodes', qrCodeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        success: true, 
        data: {
          id: docSnap.id,
          menuId: data.menuId,
          name: data.name,
          url: data.url,
          design: data.design,
          views: data.views || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        }
      };
    }
    
    return { success: false, error: 'QR code not found' };
  } catch (error) {
    console.error('Error getting QR code:', error);
    return { success: false, error: 'Failed to retrieve QR code' };
  }
}

/**
 * Retrieves all QR codes for a specific menu
 */
export async function getQRCodes(menuId: string) {
  try {
    const db = getFirestore();
    const qrCodesRef = collection(db, 'qrCodes');
    const q = query(qrCodesRef, where('menuId', '==', menuId));
    const querySnapshot = await getDocs(q);
    
    const qrCodes: QRCode[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      qrCodes.push({
        id: doc.id,
        menuId: data.menuId,
        name: data.name,
        url: data.url,
        design: data.design,
        views: data.views || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });
    
    return { success: true, data: qrCodes };
  } catch (error) {
    console.error('Error getting QR codes:', error);
    return { success: false, error: 'Failed to retrieve QR codes' };
  }
}

/**
 * Updates a QR code in the database
 */
export async function updateQRCode(qrCodeId: string, updates: Partial<Omit<QRCode, 'id' | 'createdAt' | 'updatedAt'>>) {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'qrCodes', qrCodeId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating QR code:', error);
    return { success: false, error: 'Failed to update QR code' };
  }
}

/**
 * Deletes a QR code from the database
 */
export async function deleteQRCode(qrCodeId: string) {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'qrCodes', qrCodeId);
    
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return { success: false, error: 'Failed to delete QR code' };
  }
}

/**
 * Increments the view count for a QR code
 * Returns true if successful, false otherwise
 */
export async function incrementQRCodeViews(qrCodeId: string): Promise<boolean> {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'qrCodes', qrCodeId);
    
    await updateDoc(docRef, {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error incrementing QR code views:', error);
    return false;
  }
} 