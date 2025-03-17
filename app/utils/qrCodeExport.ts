'use client';

import { QRCodeDesign } from '@/types/qrCode';
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import * as React from 'react';
import ReactDOM from 'react-dom';

/**
 * Export QR code as PNG image
 * 
 * @param url The URL to encode in the QR code
 * @param name The QR code name (used for filename)
 * @param design Optional design parameters
 */
export const exportQRAsPNG = async (
  url: string, 
  name: string, 
  design?: QRCodeDesign
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    try {
      // Create canvas element
      const canvas = document.createElement('canvas');
      const size = 1024; // High resolution
      canvas.width = size;
      canvas.height = size;
      
      // Get drawing context
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Create temporary div to render SVG
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      
      // Render QR code as SVG
      const qrCodeElement = React.createElement(QRCodeSVG, {
        value: url,
        size: size,
        bgColor: design?.backgroundColor || '#FFFFFF',
        fgColor: design?.foregroundColor || '#000000',
        level: "H",
        includeMargin: design?.margin !== undefined,
        style: { margin: design?.margin || 0 }
      });
      
      // Use ReactDOM to render the QR code to the temporary div
      ReactDOM.render(qrCodeElement, tempDiv);
      
      // Get the SVG element
      const svgElement = tempDiv.querySelector('svg');
      if (!svgElement) {
        document.body.removeChild(tempDiv);
        reject(new Error('Failed to generate SVG'));
        return;
      }
      
      // Convert SVG to string
      const svgString = new XMLSerializer().serializeToString(svgElement);
      
      // Create image from SVG
      const img = new Image();
      img.onload = () => {
        // Draw background
        ctx.fillStyle = design?.backgroundColor || '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        
        // Draw QR code
        ctx.drawImage(img, 0, 0, size, size);
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `${name.replace(/\s+/g, '-').toLowerCase()}.png`);
          }
          
          // Clean up
          document.body.removeChild(tempDiv);
          resolve();
        }, 'image/png');
      };
      
      img.onerror = (err) => {
        document.body.removeChild(tempDiv);
        reject(err);
      };
      
      // Load SVG as data URL
      img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
    } catch (error) {
      console.error('Error exporting QR code as PNG:', error);
      reject(error);
    }
  });
};

/**
 * Export QR code as SVG image
 * 
 * @param url The URL to encode in the QR code
 * @param name The QR code name (used for filename)
 * @param design Optional design parameters
 */
export const exportQRAsSVG = async (
  url: string, 
  name: string, 
  design?: QRCodeDesign
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    try {
      // Create temporary div to render SVG
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      
      // Render QR code as SVG
      const qrCodeElement = React.createElement(QRCodeSVG, {
        value: url,
        size: 1024,
        bgColor: design?.backgroundColor || '#FFFFFF',
        fgColor: design?.foregroundColor || '#000000',
        level: "H",
        includeMargin: design?.margin !== undefined,
        style: { margin: design?.margin || 0 }
      });
      
      // Use ReactDOM to render the QR code to the temporary div
      ReactDOM.render(qrCodeElement, tempDiv);
      
      // Get the SVG element
      const svgElement = tempDiv.querySelector('svg');
      if (!svgElement) {
        document.body.removeChild(tempDiv);
        reject(new Error('Failed to generate SVG'));
        return;
      }
      
      // Add style attribute for background (if not already present)
      if (design?.backgroundColor) {
        svgElement.setAttribute('style', `background-color: ${design.backgroundColor}`);
      }
      
      // Convert SVG to string
      const svgString = new XMLSerializer().serializeToString(svgElement);
      
      // Create blob from SVG string
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      
      // Save file
      saveAs(blob, `${name.replace(/\s+/g, '-').toLowerCase()}.svg`);
      
      // Clean up
      document.body.removeChild(tempDiv);
      resolve();
    } catch (error) {
      console.error('Error exporting QR code as SVG:', error);
      reject(error);
    }
  });
};

/**
 * Export QR code as PDF document
 * 
 * @param url The URL to encode in the QR code
 * @param name The QR code name (used for filename)
 * @param design Optional design parameters
 */
export const exportQRAsPDF = async (
  url: string, 
  name: string, 
  design?: QRCodeDesign
): Promise<void> => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      const size = 1024;
      canvas.width = size;
      canvas.height = size;
      
      // Get drawing context
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Create temporary div to render SVG
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      
      // Render QR code as SVG
      const qrCodeElement = React.createElement(QRCodeSVG, {
        value: url,
        size: size,
        bgColor: design?.backgroundColor || '#FFFFFF',
        fgColor: design?.foregroundColor || '#000000',
        level: "H",
        includeMargin: design?.margin !== undefined,
        style: { margin: design?.margin || 0 }
      });
      
      // Use ReactDOM to render the QR code to the temporary div
      ReactDOM.render(qrCodeElement, tempDiv);
      
      // Get the SVG element
      const svgElement = tempDiv.querySelector('svg');
      if (!svgElement) {
        document.body.removeChild(tempDiv);
        reject(new Error('Failed to generate SVG'));
        return;
      }
      
      // Convert SVG to string
      const svgString = new XMLSerializer().serializeToString(svgElement);
      
      // Create image from SVG
      const img = new Image();
      
      // Create promise to wait for image loading
      await new Promise<void>((resolveImg, rejectImg) => {
        img.onload = () => {
          // Draw background
          ctx.fillStyle = design?.backgroundColor || '#FFFFFF';
          ctx.fillRect(0, 0, size, size);
          
          // Draw QR code
          ctx.drawImage(img, 0, 0, size, size);
          resolveImg();
        };
        
        img.onerror = (err) => {
          rejectImg(err);
        };
        
        // Load SVG as data URL
        img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
      });
      
      // Get image data for PDF
      const imageData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // PDF dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(`QR Code: ${name}`, 15, 20);
      
      // Add URL
      pdf.setFontSize(10);
      pdf.text(`URL: ${url}`, 15, 30);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 35);
      
      // Calculate QR code size (50% of page width, centered)
      const qrWidth = pageWidth * 0.5;
      const qrX = (pageWidth - qrWidth) / 2;
      const qrY = 45;
      
      // Add QR code to PDF
      pdf.addImage(imageData, 'PNG', qrX, qrY, qrWidth, qrWidth);
      
      // Add usage instructions
      pdf.setFontSize(12);
      pdf.text('Instructions:', 15, qrY + qrWidth + 15);
      
      pdf.setFontSize(10);
      const instructions = [
        '1. Print this QR code at high quality',
        '2. Place it in a visible location',
        '3. Customers can scan with their smartphones',
        '4. The QR code will take them directly to your digital menu'
      ];
      
      instructions.forEach((instruction, index) => {
        pdf.text(instruction, 15, qrY + qrWidth + 25 + (index * 7));
      });
      
      // Save the PDF
      pdf.save(`${name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      // Clean up
      document.body.removeChild(tempDiv);
      resolve();
    } catch (error) {
      console.error('Error exporting QR code as PDF:', error);
      reject(error);
    }
  });
}; 