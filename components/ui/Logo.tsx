'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type LogoVariant = 'primary' | 'secondary' | 'submark';
export type LogoStyle = 'clean' | 'tagline' | 'cta' | 'domain';
export type LogoColor = 'default' | 'white' | 'black';

interface LogoProps {
  variant?: LogoVariant;
  style?: LogoStyle;
  color?: LogoColor;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  href?: string | null | undefined;
  alt?: string;
}

const sizeMap = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

/**
 * Logo component for displaying brand logos across the application
 * Uses Next.js Image component for optimized image loading
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'primary',
  style = 'clean',
  color = 'default',
  size = 'md',
  className,
  href = '/',
  alt = 'MenuFacil',
}) => {
  // Define image properties
  const filename = `${variant}-logo-${style}${color !== 'default' ? `-${color}` : ''}`;
  const extension = 'svg';
  const src = `/images/logos/${variant}/${filename}.${extension}`;
  
  // Fallback to PNG if SVG might not be available (for certain variants)
  const fallbackSrc = `/images/logos/${variant}/${filename}.png`;
  
  // Determine dimensions based on size
  const height = sizeMap[size];
  const width = height * (variant === 'submark' ? 1 : variant === 'secondary' ? 1.5 : 2.5);
  
  const logoImage = (
    <Image
      src={src}
      alt={alt}
      height={height}
      width={width}
      className={cn('h-auto', className)}
      priority={true}
      onError={(e) => {
        // Fallback to PNG if SVG fails to load
        const img = e.currentTarget;
        img.onerror = null;
        img.src = fallbackSrc;
      }}
    />
  );

  // If href is null, undefined, or empty string, return just the image without a link
  if (!href) {
    return logoImage;
  }

  // Otherwise wrap in a Link component
  return (
    <Link href={href} aria-label={`${alt} - Homepage`}>
      {logoImage}
    </Link>
  );
};

export default Logo; 