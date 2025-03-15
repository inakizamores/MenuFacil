'use client';

import { useState } from 'react';
import VariantsManager from './VariantsManager';
import { MenuItemVariant } from '@/app/types/database';
import { UUID } from 'crypto';

export default function VariantsManagerTest() {
  const [variants, setVariants] = useState<Partial<MenuItemVariant>[]>([
    {
      id: 'test-id-1' as `${string}-${string}-${string}-${string}-${string}`,
      item_id: 'test-item-id' as `${string}-${string}-${string}-${string}-${string}`,
      name: 'Regular',
      price_adjustment: 0,
      is_default: true,
      sort_order: 0,
      is_active: true
    },
    {
      id: 'test-id-2' as `${string}-${string}-${string}-${string}-${string}`,
      item_id: 'test-item-id' as `${string}-${string}-${string}-${string}-${string}`,
      name: 'Large',
      price_adjustment: 2.5,
      is_default: false,
      sort_order: 1,
      is_active: true
    }
  ]);

  const handleSaveVariants = async (updatedVariants: Omit<MenuItemVariant, 'id' | 'created_at' | 'updated_at'>[]) => {
    console.log('Saving variants:', updatedVariants);
    // In a real app, you would save these to the database
    // For this test, we'll just update the local state
    setVariants(updatedVariants);
    return Promise.resolve();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Variants Manager Test</h1>
      
      <VariantsManager
        itemId="test-item-id"
        initialVariants={variants as MenuItemVariant[]}
        onSave={handleSaveVariants}
      />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Current Variants Data:</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {JSON.stringify(variants, null, 2)}
        </pre>
      </div>
    </div>
  );
} 