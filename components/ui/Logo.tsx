'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export type LogoVariant = 'primary' | 'white' | 'black';
export type LogoType = 'default' | 'clean' | 'submark' | 'icon';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg';

interface LogoProps {
  variant?: LogoVariant;
  type?: LogoType;
  size?: LogoSize;
  showLink?: boolean;
  className?: string;
}

// Size mapping (in pixels)
const sizeMap = {
  xs: { height: 24, width: 120 }, // small
  sm: { height: 32, width: 160 }, // medium (default)
  md: { height: 40, width: 200 }, // large
  lg: { height: 48, width: 240 }, // extra large
};

// Icon size mapping (for square logos)
const iconSizeMap = {
  xs: { height: 24, width: 24 },
  sm: { height: 32, width: 32 },
  md: { height: 40, width: 40 },
  lg: { height: 48, width: 48 },
};

export default function Logo({
  variant = 'primary',
  type = 'clean',
  size = 'sm',
  showLink = true,
  className = '',
}: LogoProps) {
  // Use state to store the logo path to handle client-side navigation properly
  const [logoSrc, setLogoSrc] = useState<string>('');
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });
  
  useEffect(() => {
    // Determine which logo to use based on variant and type
    let path: string;
    let dims;
    
    if (type === 'icon') {
      path = `/images/logos/icons/icon-square${variant === 'white' ? '-white' : variant === 'black' ? '-black' : ''}.png`;
      dims = iconSizeMap[size];
    } else if (type === 'submark') {
      path = `/images/logos/submark/submark-compact${variant === 'white' ? '-white' : variant === 'black' ? '-black' : ''}.png`;
      dims = iconSizeMap[size];
    } else {
      // Default primary logo
      const extension = type === 'clean' ? '.svg' : '.png';
      path = `/images/logos/primary/primary-logo-${type}${variant === 'white' ? '-white' : variant === 'black' ? '-black' : ''}${extension}`;
      dims = sizeMap[size];
    }

    setLogoSrc(path);
    setDimensions(dims);
  }, [variant, type, size]);

  const logo = (
    <div className={`relative ${className}`} style={{ height: dimensions.height, width: dimensions.width }}>
      {logoSrc && dimensions.height > 0 && (
        <Image
          src={logoSrc}
          alt="MenuFacil"
          fill
          sizes={`(max-width: 768px) ${dimensions.width}px, ${dimensions.width}px`}
          priority
          className="object-contain"
        />
      )}
    </div>
  );

  if (showLink) {
    return (
      <Link href="/" className="inline-flex focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
        {logo}
      </Link>
    );
  }

  return logo;
} 