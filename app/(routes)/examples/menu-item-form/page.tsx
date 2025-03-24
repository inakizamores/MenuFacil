'use client';

import React, { useState } from 'react';
import { MenuItemForm } from '@/app/components/examples/MenuItemForm';
import type { MenuItemFormValues } from '@/lib/validation/schemas';

export default function MenuItemFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<MenuItemFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: MenuItemFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show the submitted data
      setResult(data);
      
      console.log('Form submitted:', data);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('An error occurred while submitting the form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Menu Item Form Example</h1>
        <p className="text-gray-600">
          This example demonstrates the use of complex form controls for arrays and nested objects,
          integrated with Zod validation and react-hook-form.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Form</h2>
          <MenuItemForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {result && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              Form submitted successfully!
            </div>
          )}
          
          {result ? (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Submitted Data:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px] text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-gray-500 italic">
              Submit the form to see the result here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 