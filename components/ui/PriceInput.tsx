import { FC, useState, useEffect, ChangeEvent } from 'react';
import { Input } from './Input';

interface PriceInputProps {
  id: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  currency?: string;
  currencyPosition?: 'prefix' | 'suffix';
  min?: number;
  max?: number;
  step?: number;
}

export const PriceInput: FC<PriceInputProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder = 'Enter price',
  error,
  disabled = false,
  currency = '$',
  currencyPosition = 'prefix',
  min = 0,
  max,
  step = 0.01
}) => {
  // Internal state to hold the formatted display value
  const [displayValue, setDisplayValue] = useState<string>('');
  
  // Update the display value whenever the value prop changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      // Format the value without currency symbol for the input
      setDisplayValue(value.toString());
    } else {
      setDisplayValue('');
    }
  }, [value]);
  
  // Handle changes to the input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input, positive numbers, and decimals
    if (inputValue === '' || /^(\d*\.?\d*)$/.test(inputValue)) {
      setDisplayValue(inputValue);
      
      // Convert to number for the actual value
      const numericValue = inputValue === '' ? 0 : parseFloat(inputValue);
      
      // Check if the value is within the min/max range
      if ((min === undefined || numericValue >= min) && 
          (max === undefined || numericValue <= max)) {
        onChange(numericValue);
      }
    }
  };
  
  // Handle blur event to format the value
  const handleInputBlur = () => {
    // If there's a value, format it to 2 decimal places when blurring
    if (displayValue) {
      const numValue = parseFloat(displayValue);
      if (!isNaN(numValue)) {
        setDisplayValue(numValue.toFixed(2));
      }
    }
    
    if (onBlur) {
      onBlur();
    }
  };
  
  // Get the currency symbol based on position
  const getCurrencyElement = () => (
    <div className="absolute top-0 bottom-0 flex items-center justify-center text-gray-500 text-sm font-medium">
      {currency}
    </div>
  );
  
  return (
    <div className="relative">
      {currencyPosition === 'prefix' && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
          <span className="text-gray-500">{currency}</span>
        </div>
      )}
      
      <Input
        id={id}
        name={name}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        className={`${currencyPosition === 'prefix' ? 'pl-8' : 'pr-8'}`}
        inputMode="decimal"
      />
      
      {currencyPosition === 'suffix' && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-500">{currency}</span>
        </div>
      )}
    </div>
  );
}; 