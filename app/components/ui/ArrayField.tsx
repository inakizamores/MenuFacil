'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Button from './button';
import Input from './input';
import { FormField, FormItem, FormLabel, FormMessage } from './form';

interface ArrayFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  emptyMessage?: string;
  maxItems?: number;
}

/**
 * A reusable component for managing array fields in forms
 * Works with react-hook-form and Zod validation
 */
export const ArrayField: React.FC<ArrayFieldProps> = ({
  name,
  label,
  placeholder = 'Add new item',
  description,
  emptyMessage = 'No items added yet',
  maxItems = 10,
}) => {
  const { control, getValues, setValue } = useFormContext();
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    
    const currentItems = getValues(name) || [];
    
    // Check if we've reached the maximum number of items
    if (currentItems.length >= maxItems) return;
    
    // Check for duplicates
    if (currentItems.includes(newItem.trim())) return;
    
    setValue(name, [...currentItems, newItem.trim()], { shouldValidate: true });
    setNewItem('');
  };

  const handleRemoveItem = (index: number) => {
    const currentItems = getValues(name) || [];
    setValue(
      name,
      currentItems.filter((_: string, i: number) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          
          <div className="space-y-3">
            {/* Input for adding new items */}
            <div className="flex space-x-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddItem}
                variant="outline"
                disabled={!newItem.trim() || (field.value && field.value.length >= maxItems)}
                aria-label="Add item"
                className="min-w-[80px]"
              >
                + Add
              </Button>
            </div>
            
            {/* List of current items */}
            <div className="min-h-[50px] space-y-2">
              {(!field.value || field.value.length === 0) ? (
                <p className="text-sm text-gray-500 italic">{emptyMessage}</p>
              ) : (
                <ul className="space-y-2">
                  {field.value.map((item: string, index: number) => (
                    <li key={index} className="flex items-center rounded bg-gray-50 px-3 py-2">
                      <span className="flex-1 text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        aria-label={`Remove ${item}`}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
}; 