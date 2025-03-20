import React, { createContext, useContext, useState, forwardRef } from 'react';
import cn from 'classnames';

type TabsContextValue = {
  value: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
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
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value: controlledValue, onValueChange, children, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '');
    
    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
    
    const handleValueChange = (newValue: string) => {
      setUncontrolledValue(newValue);
      onValueChange?.(newValue);
    };
    
    return (
      <TabsContext.Provider value={{ value, defaultValue, onValueChange: handleValueChange }}>
        <div
          className={cn('w-full', className)}
          ref={ref}
          data-state={value ? "active" : "inactive"}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600',
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

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, onClick, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabs();
    const isActive = value === selectedValue;
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onValueChange?.(value);
      onClick?.(e);
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isActive 
            ? 'bg-white text-primary-700 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800',
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
          'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          isActive ? 'block' : 'hidden',
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