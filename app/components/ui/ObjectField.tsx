'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from './form';
import Input from './input';

interface FieldConfig {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  suffix?: string;
  description?: string;
}

interface ObjectFieldProps {
  name: string;
  label: string;
  description?: string;
  fields: FieldConfig[];
  columns?: 1 | 2 | 3 | 4;
}

/**
 * A reusable component for managing nested object fields in forms
 * Works with react-hook-form and Zod validation
 */
export const ObjectField: React.FC<ObjectFieldProps> = ({
  name,
  label,
  description,
  fields,
  columns = 2,
}) => {
  const { control } = useFormContext();

  // Generate column CSS class based on the columns prop
  const columnClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-md font-medium">{label}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      
      <div className={`grid ${columnClass} gap-4`}>
        {fields.map((field) => {
          const fieldName = `${name}.${field.key}`;
          
          return (
            <FormField
              key={field.key}
              control={control}
              name={fieldName}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel htmlFor={field.key}>{field.label}</FormLabel>
                  <div className="relative mt-1">
                    <Input
                      id={field.key}
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      {...formField}
                      // For number inputs, handle the value conversion
                      value={formField.value ?? ''}
                      onChange={(e) => {
                        if (field.type === 'number') {
                          const value = e.target.value === '' ? undefined : Number(e.target.value);
                          formField.onChange(value);
                        } else {
                          formField.onChange(e.target.value);
                        }
                      }}
                    />
                    {field.suffix && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500 text-sm">{field.suffix}</span>
                      </div>
                    )}
                  </div>
                  {field.description && (
                    <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}; 