import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  noPadding?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  footer,
  noPadding = false,
  onClick,
}: CardProps) {
  const cardClasses = `bg-white rounded-lg shadow-md overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`;
  const bodyClasses = noPadding ? '' : 'p-6';
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || subtitle) && (
        <div className="px-6 pt-6 pb-0">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className={bodyClasses}>{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
} 