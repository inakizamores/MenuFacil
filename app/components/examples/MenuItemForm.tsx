'use client';

import React from 'react';
import { Form } from '../ui/form';
import { useZodForm } from '@/app/hooks/useZodForm';
import { menuItemSchema, type MenuItemFormValues } from '@/lib/validation/schemas';
import { ArrayField } from '../ui/ArrayField';
import { ObjectField } from '../ui/ObjectField';
import Button from '../ui/button';
import { FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import Input from '../ui/input';
import { Textarea } from '../ui/textarea';

interface MenuItemFormProps {
  initialData?: Partial<MenuItemFormValues>;
  onSubmit: (data: MenuItemFormValues) => void;
  isSubmitting?: boolean;
}

/**
 * Example form component that demonstrates using complex form controls
 * with ArrayField for tags and ingredients, and ObjectField for nutritional info
 */
export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
}) => {
  const form = useZodForm({
    schema: menuItemSchema,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      isAvailable: true,
      isPopular: false,
      preparationTime: undefined,
      ingredients: [],
      allergens: [],
      dietaryOptions: [],
      nutritionalInfo: {
        calories: undefined,
        protein: undefined,
        carbs: undefined,
        fat: undefined,
        sugar: undefined,
        fiber: undefined,
        sodium: undefined,
      },
      ...initialData
    },
  });

  const { handleSubmit, register, formState: { errors, touchedFields }, watch } = form;
  
  const formValues = watch();
  
  return (
    <Form form={form} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Basic Information</h2>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name <span className="text-red-500">*</span></FormLabel>
                  <Input {...field} placeholder="e.g., Margherita Pizza" />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <Textarea {...field} placeholder="Describe the menu item..." rows={3} />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price <span className="text-red-500">*</span></FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <Input 
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-8"
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="preparationTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preparation Time</FormLabel>
                  <div className="relative">
                    <Input 
                      {...field}
                      type="number"
                      min="0"
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        field.onChange(value);
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">minutes</span>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="isAvailable">Item is available for ordering</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPopular"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="isPopular">Mark as popular item</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          {/* Arrays and Nested Objects */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Additional Information</h2>
            
            {/* Example of using the ArrayField component */}
            <ArrayField
              name="ingredients"
              label="Ingredients"
              placeholder="Add an ingredient (e.g., Tomato)"
              description="List all ingredients used in this dish"
              emptyMessage="No ingredients added yet"
            />
            
            <ArrayField
              name="allergens"
              label="Allergens"
              placeholder="Add an allergen (e.g., Nuts, Dairy)"
              description="List all potential allergens"
              emptyMessage="No allergens added yet"
            />
            
            <ArrayField
              name="dietaryOptions"
              label="Dietary Options"
              placeholder="Add dietary option (e.g., Vegetarian)"
              description="List applicable dietary categories"
              emptyMessage="No dietary options added yet"
            />
            
            {/* Example of using the ObjectField component */}
            <ObjectField
              name="nutritionalInfo"
              label="Nutrition Information"
              description="Provide nutritional details per serving"
              fields={[
                { key: 'calories', label: 'Calories', type: 'number', suffix: 'kcal' },
                { key: 'protein', label: 'Protein', type: 'number', suffix: 'g' },
                { key: 'carbs', label: 'Carbs', type: 'number', suffix: 'g' },
                { key: 'fat', label: 'Fat', type: 'number', suffix: 'g' },
                { key: 'sugar', label: 'Sugar', type: 'number', suffix: 'g' },
                { key: 'fiber', label: 'Fiber', type: 'number', suffix: 'g' },
                { key: 'sodium', label: 'Sodium', type: 'number', suffix: 'mg' },
              ]}
              columns={2}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Item'}
        </Button>
      </div>
    </Form>
  );
}; 