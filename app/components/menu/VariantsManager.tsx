'use client';

import React, { useState, useEffect } from 'react';
import { MenuItemVariant } from '@/app/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface VariantsManagerProps {
  itemId: string;
  initialVariants?: MenuItemVariant[];
  onSave: (variants: Omit<MenuItemVariant, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  disabled?: boolean;
}

interface VariantItemProps {
  variant: Omit<MenuItemVariant, 'id' | 'created_at' | 'updated_at'> & { tempId?: string; id?: string };
  index: number;
  onChange: (index: number, variant: Omit<MenuItemVariant, 'id' | 'created_at' | 'updated_at'> & { tempId?: string; id?: string }) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
}

const VariantItem = ({ 
  variant, 
  index, 
  onChange, 
  onRemove, 
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  disabled 
}: VariantItemProps) => {
  return (
    <div className="mb-3 rounded-lg border bg-white p-4 shadow-sm transition">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Variant Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={variant.name}
            onChange={(e) => onChange(index, { ...variant, name: e.target.value })}
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Price Adjustment <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="mr-2">$</span>
            <Input
              type="number"
              step="0.01"
              value={variant.price_adjustment.toString()}
              onChange={(e) => onChange(index, { ...variant, price_adjustment: parseFloat(e.target.value) || 0 })}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`default-${index}`}
            checked={variant.is_default}
            onChange={(e) => onChange(index, { ...variant, is_default: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={disabled}
          />
          <label htmlFor={`default-${index}`} className="ml-2 text-sm text-gray-700">
            Default option
          </label>
        </div>
        
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            id={`active-${index}`}
            checked={variant.is_active}
            onChange={(e) => onChange(index, { ...variant, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={disabled}
          />
          <label htmlFor={`active-${index}`} className="mr-4 text-sm text-gray-700">
            Active
          </label>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMoveUp(index)}
            disabled={disabled || isFirst}
            className="px-2"
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMoveDown(index)}
            disabled={disabled || isLast}
            className="px-2"
          >
            ↓
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove(index)}
            disabled={disabled}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

const VariantsManager = ({ 
  itemId, 
  initialVariants = [], 
  onSave,
  disabled = false 
}: VariantsManagerProps) => {
  const [variants, setVariants] = useState<(Omit<MenuItemVariant, 'id' | 'created_at' | 'updated_at'> & { tempId?: string; id?: string })[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (initialVariants.length > 0) {
      setVariants(initialVariants.map(v => ({
        item_id: v.item_id,
        name: v.name,
        price_adjustment: v.price_adjustment,
        is_default: v.is_default,
        sort_order: v.sort_order,
        is_active: v.is_active,
        id: v.id as string
      })));
    }
  }, [initialVariants]);
  
  const handleAddVariant = () => {
    const newVariant = {
      item_id: itemId as `${string}-${string}-${string}-${string}-${string}`,
      name: '',
      price_adjustment: 0,
      is_default: variants.length === 0, // First variant is default
      sort_order: variants.length,
      is_active: true,
      tempId: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    setVariants([...variants, newVariant]);
  };
  
  const handleChangeVariant = (index: number, updatedVariant: Omit<MenuItemVariant, 'id' | 'created_at' | 'updated_at'> & { tempId?: string; id?: string }) => {
    const newVariants = [...variants];
    
    // If this variant is set as default, unset all others
    if (updatedVariant.is_default && !newVariants[index].is_default) {
      newVariants.forEach((v, i) => {
        if (i !== index) {
          newVariants[i] = { ...v, is_default: false };
        }
      });
    }
    
    // If this was the only default and it's being unchecked, select the first active one
    if (newVariants[index].is_default && !updatedVariant.is_default) {
      const activeVariants = newVariants.filter((v, i) => i !== index && v.is_active);
      if (activeVariants.length > 0) {
        const firstActiveIndex = newVariants.findIndex((v, i) => i !== index && v.is_active);
        if (firstActiveIndex >= 0) {
          newVariants[firstActiveIndex] = { ...newVariants[firstActiveIndex], is_default: true };
        }
      } else {
        // If no other actives, force this to stay default
        updatedVariant.is_default = true;
      }
    }
    
    newVariants[index] = updatedVariant;
    setVariants(newVariants);
  };
  
  const handleRemoveVariant = (index: number) => {
    const newVariants = [...variants];
    const removedVariant = newVariants[index];
    newVariants.splice(index, 1);
    
    // Update sort orders
    newVariants.forEach((v, i) => {
      newVariants[i] = { ...v, sort_order: i };
    });
    
    // If the removed variant was default, select a new default
    if (removedVariant.is_default && newVariants.length > 0) {
      const firstActiveIndex = newVariants.findIndex(v => v.is_active);
      if (firstActiveIndex >= 0) {
        newVariants[firstActiveIndex] = { ...newVariants[firstActiveIndex], is_default: true };
      } else {
        newVariants[0] = { ...newVariants[0], is_default: true };
      }
    }
    
    setVariants(newVariants);
  };
  
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newVariants = [...variants];
    const temp = newVariants[index];
    newVariants[index] = newVariants[index - 1];
    newVariants[index - 1] = temp;
    
    // Update sort_order values
    newVariants.forEach((variant, i) => {
      newVariants[i] = { ...variant, sort_order: i };
    });
    
    setVariants(newVariants);
  };
  
  const handleMoveDown = (index: number) => {
    if (index === variants.length - 1) return;
    
    const newVariants = [...variants];
    const temp = newVariants[index];
    newVariants[index] = newVariants[index + 1];
    newVariants[index + 1] = temp;
    
    // Update sort_order values
    newVariants.forEach((variant, i) => {
      newVariants[i] = { ...variant, sort_order: i };
    });
    
    setVariants(newVariants);
  };
  
  const handleSave = async () => {
    // Validate
    for (const variant of variants) {
      if (!variant.name.trim()) {
        setError('All variants must have a name');
        return;
      }
    }
    
    // Ensure we have a default if there are variants
    if (variants.length > 0 && !variants.some(v => v.is_default && v.is_active)) {
      setError('You must have at least one active variant selected as default');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Clean up the data for saving
      const variantsToSave = variants.map(({ tempId, id, ...rest }) => rest);
      await onSave(variantsToSave);
    } catch (err: any) {
      setError(err.message || 'Failed to save variants');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-medium text-gray-900">Variants</h3>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <div className="variants-container">
        {variants.length === 0 ? (
          <div className="mb-4 rounded-md bg-gray-100 p-6 text-center">
            <p className="text-gray-600">No variants added yet.</p>
          </div>
        ) : (
          variants.map((variant, index) => (
            <VariantItem
              key={variant.tempId || variant.id}
              variant={variant}
              index={index}
              onChange={handleChangeVariant}
              onRemove={handleRemoveVariant}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isFirst={index === 0}
              isLast={index === variants.length - 1}
              disabled={disabled}
            />
          ))
        )}
      </div>
      
      <div className="mt-4 flex justify-between">
        <Button
          variant="outline"
          onClick={handleAddVariant}
          disabled={disabled}
        >
          Add Variant
        </Button>
        
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={disabled || isSaving || variants.length === 0}
        >
          Save Variants
        </Button>
      </div>
    </div>
  );
};

export default VariantsManager; 