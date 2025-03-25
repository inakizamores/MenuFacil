/**
 * Color palette constants for MenuFácil
 * 
 * This file contains the main color values used throughout the application.
 * These colors can be referenced in components and styles for consistent branding.
 */

export const COLORS = {
  /**
   * Main brand color, used for key UI elements like buttons and highlights.
   */
  PRIMARY: '#121c74',
  
  /**
   * Complementary color for accents, secondary buttons, and subtle highlights.
   */
  SECONDARY: '#d98b48',
  
  /**
   * General background color for a clean and modern look.
   */
  BACKGROUND: '#f5f5f7',
  
  /**
   * Primary text color for readability and contrast.
   */
  TEXT: '#050a30',
  
  /**
   * Used for interactive elements like links, active states, or call-to-action highlights.
   */
  ACCENT: '#3e46f3',
  
  /**
   * Used for soft backgrounds, dividers, or muted UI elements.
   */
  NEUTRAL: '#d9b392',
};

/**
 * Color palette with alpha variations
 * Useful for situations requiring transparency
 */
export const getColorWithAlpha = (color: string, alpha: number): string => {
  // Make sure alpha is between 0 and 1
  const validAlpha = Math.max(0, Math.min(1, alpha));
  
  // Extract RGB values from hex
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${validAlpha})`;
};

/**
 * Gradient generator utility
 * Creates CSS gradient strings for various gradient types
 */
export const createGradient = {
  /**
   * Creates a linear gradient with specified direction and colors
   * @param direction - Gradient direction (e.g., 'to right', '45deg')
   * @param colors - Array of colors to use in the gradient
   * @returns CSS linear-gradient string
   */
  linear: (direction: string, colors: string[]): string => {
    return `linear-gradient(${direction}, ${colors.join(', ')})`;
  },
  
  /**
   * Creates a radial gradient
   * @param shape - Gradient shape (e.g., 'circle', 'ellipse')
   * @param colors - Array of colors to use in the gradient
   * @returns CSS radial-gradient string
   */
  radial: (shape: string, colors: string[]): string => {
    return `radial-gradient(${shape}, ${colors.join(', ')})`;
  }
};

/**
 * Predefined gradient combinations using the brand colors
 */
export const GRADIENTS = {
  // Primary gradients
  PRIMARY_HORIZONTAL: createGradient.linear('to right', [COLORS.PRIMARY, '#1a2683']),
  PRIMARY_VERTICAL: createGradient.linear('to bottom', [COLORS.PRIMARY, '#1a2683']),
  PRIMARY_DIAGONAL: createGradient.linear('135deg', [COLORS.PRIMARY, '#1a2683']),
  
  // Brand gradients (primary to accent)
  BRAND_HORIZONTAL: createGradient.linear('to right', [COLORS.PRIMARY, COLORS.ACCENT]),
  BRAND_VERTICAL: createGradient.linear('to bottom', [COLORS.PRIMARY, COLORS.ACCENT]),
  BRAND_DIAGONAL: createGradient.linear('135deg', [COLORS.PRIMARY, COLORS.ACCENT]),
  
  // Secondary gradients
  SECONDARY_HORIZONTAL: createGradient.linear('to right', [COLORS.SECONDARY, '#e69c59']),
  SECONDARY_VERTICAL: createGradient.linear('to bottom', [COLORS.SECONDARY, '#e69c59']),
  SECONDARY_DIAGONAL: createGradient.linear('135deg', [COLORS.SECONDARY, '#e69c59']),
  
  // Complementary gradients (primary to secondary)
  COMPLEMENTARY_HORIZONTAL: createGradient.linear('to right', [COLORS.PRIMARY, COLORS.SECONDARY]),
  COMPLEMENTARY_VERTICAL: createGradient.linear('to bottom', [COLORS.PRIMARY, COLORS.SECONDARY]),
  COMPLEMENTARY_DIAGONAL: createGradient.linear('135deg', [COLORS.PRIMARY, COLORS.SECONDARY]),
  
  // Neutral gradients
  NEUTRAL_HORIZONTAL: createGradient.linear('to right', [COLORS.NEUTRAL, '#e1c4a7']),
  NEUTRAL_VERTICAL: createGradient.linear('to bottom', [COLORS.NEUTRAL, '#e1c4a7']),
  
  // UI-specific gradients
  BUTTON_HOVER: createGradient.linear('to bottom', [COLORS.PRIMARY, '#0e1660']),
  CARD_BACKGROUND: createGradient.linear('to bottom right', [COLORS.BACKGROUND, '#ffffff']),
  HERO_BACKGROUND: createGradient.linear('120deg', [COLORS.PRIMARY, COLORS.ACCENT, getColorWithAlpha(COLORS.SECONDARY, 0.8)]),
  CALL_TO_ACTION: createGradient.linear('to right', [COLORS.ACCENT, '#5058f5']),
  
  // Radial gradients
  RADIAL_PRIMARY: createGradient.radial('circle', [COLORS.PRIMARY, '#0e1660']),
  RADIAL_BRAND: createGradient.radial('circle', [COLORS.ACCENT, COLORS.PRIMARY]),
};

/**
 * Semantic color mapping for specific UI elements and states
 */
export const SEMANTIC_COLORS = {
  // Interactive elements
  LINK: COLORS.ACCENT,
  BUTTON: COLORS.PRIMARY,
  BUTTON_HOVER: '#1a2683', // Slightly darker primary
  
  // Status colors
  SUCCESS: '#34a853',
  ERROR: '#ea4335',
  WARNING: '#fbbc05',
  INFO: COLORS.ACCENT,
  
  // UI elements
  BORDER: '#e0e0e0',
  INPUT: '#ffffff',
  INPUT_FOCUS: getColorWithAlpha(COLORS.PRIMARY, 0.1),
  
  // Text colors
  TEXT_PRIMARY: COLORS.TEXT,
  TEXT_SECONDARY: '#4e4e4e',
  TEXT_MUTED: '#9e9e9e',
  TEXT_INVERTED: '#ffffff',
};

/**
 * Export default for easier importing
 */
export default COLORS; 