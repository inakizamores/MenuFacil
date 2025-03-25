import React, { createContext, useContext, useState, forwardRef } from 'react';
import cn from 'classnames';

type TabsContextValue = {
  value: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant: 'default' | 'pills' | 'underlined';
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs component');
  }
  return context;
};

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underlined';
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value: controlledValue, onValueChange, variant = 'default', children, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
    
    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
    
    const handleValueChange = (newValue: string) => {
      setUncontrolledValue(newValue);
      onValueChange?.(newValue);
    };
    
    return (
      <TabsContext.Provider value={{ value, defaultValue, onValueChange: handleValueChange, variant }}>
        <div
          className={cn('w-full', className)}
          ref={ref}
          data-state={value ? "active" : "inactive"}
          data-variant={variant}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

export type TabsListProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'pills' | 'underlined';
};

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, variant: listVariant, ...props }, ref) => {
    const { variant: contextVariant } = useTabs();
    const variant = listVariant || contextVariant;
    
    const variantClasses = {
      default: 'inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 p-1 text-brand-text',
      pills: 'inline-flex h-10 items-center justify-center gap-1 rounded-full bg-neutral-50 p-1 text-brand-text',
      underlined: 'inline-flex h-10 items-center justify-center gap-2 border-b border-neutral-200 px-0 py-1 text-brand-text',
    };

    return (
      <div
        className={cn(
          'transition-all duration-250',
          variantClasses[variant],
          className
        )}
        ref={ref}
        role="tablist"
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = 'TabsList';

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, onClick, ...props }, ref) => {
    const { value: selectedValue, onValueChange, variant } = useTabs();
    const isActive = value === selectedValue;
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onValueChange?.(value);
      onClick?.(e);
    };
    
    const variantActiveClasses = {
      default: 'bg-white text-primary shadow-sm',
      pills: 'bg-white text-primary shadow-sm',
      underlined: 'text-primary border-b-2 border-primary',
    };
    
    const variantInactiveClasses = {
      default: 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50',
      pills: 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50',
      underlined: 'text-neutral-600 hover:text-neutral-800 border-b-2 border-transparent hover:border-neutral-300',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variant === 'pills' && 'rounded-full',
          variant === 'underlined' && 'rounded-none px-2',
          isActive 
            ? variantActiveClasses[variant]
            : variantInactiveClasses[variant],
          className
        )}
        ref={ref}
        role="tab"
        data-state={isActive ? "active" : "inactive"}
        aria-selected={isActive}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue } = useTabs();
    const isActive = value === selectedValue;

    return (
      <div
        className={cn(
          'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-opacity',
          isActive ? 'block opacity-100' : 'hidden opacity-0',
          className
        )}
        ref={ref}
        role="tabpanel"
        data-state={isActive ? "active" : "inactive"}
        tabIndex={isActive ? 0 : -1}
        aria-labelledby={`tab-${value}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = 'TabsContent'; 