'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  image_url?: string;
  price: number;
}

interface ItemCategorizerProps {
  categories: Category[];
  items: MenuItem[];
  onSave: (itemChanges: { itemId: string; categoryId: string }[]) => Promise<void>;
}

interface SortableItemProps {
  item: MenuItem;
  categories: Category[];
  onCategoryChange: (itemId: string, categoryId: string) => void;
}

// Sortable menu item component
const SortableItem = ({ item, categories, onCategoryChange }: SortableItemProps) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging
  } = useSortable({ 
    id: item.id,
    data: {
      type: 'item',
      item
    }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="p-4 mb-2 bg-white rounded-md shadow-sm border border-gray-200 cursor-move"
      {...attributes} 
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-md" />
            ) : (
              <span className="text-gray-500">${item.price.toFixed(2)}</span>
            )}
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
        
        <select
          value={item.categoryId}
          onChange={(e) => onCategoryChange(item.id, e.target.value)}
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking select
          className="text-sm border border-gray-300 rounded-md p-1"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Item preview during drag
const DragOverlayItem = ({ item }: { item: MenuItem }) => {
  return (
    <div className="p-4 mb-2 bg-white rounded-md shadow-md border-2 border-blue-500 cursor-move">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-md" />
          ) : (
            <span className="text-gray-500">${item.price.toFixed(2)}</span>
          )}
        </div>
        <span className="font-medium">{item.name}</span>
      </div>
    </div>
  );
};

const ItemCategorizer = ({ categories, items, onSave }: ItemCategorizerProps) => {
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, MenuItem[]>>({});
  const [changes, setChanges] = useState<{ itemId: string; categoryId: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Initialize items by category
  useEffect(() => {
    const groupedItems: Record<string, MenuItem[]> = {};
    
    // Initialize empty arrays for each category
    categories.forEach((category) => {
      groupedItems[category.id] = [];
    });
    
    // Group items by category
    items.forEach((item) => {
      if (groupedItems[item.categoryId]) {
        groupedItems[item.categoryId].push(item);
      }
    });
    
    setItemsByCategory(groupedItems);
  }, [categories, items]);
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    
    // Find the active item
    let draggedItem: MenuItem | null = null;
    
    Object.values(itemsByCategory).forEach((categoryItems) => {
      const item = categoryItems.find((item) => item.id === active.id);
      if (item) {
        draggedItem = item;
      }
    });
    
    if (draggedItem) {
      setActiveItem(draggedItem);
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveItem(null);
    
    if (!over) return;
    
    // Extract the categoryId from the over.id (format: "category-{categoryId}")
    const overId = String(over.id);
    
    if (overId.startsWith('category-')) {
      const targetCategoryId = overId.replace('category-', '');
      const sourceItem = active.data.current?.item as MenuItem;
      
      if (sourceItem && sourceItem.categoryId !== targetCategoryId) {
        handleCategoryChange(String(active.id), targetCategoryId);
      }
    }
  };
  
  const handleCategoryChange = (itemId: string, newCategoryId: string) => {
    // Find which category the item is currently in
    let sourceCategory = '';
    let foundItem: MenuItem | undefined;
    
    Object.entries(itemsByCategory).forEach(([categoryId, categoryItems]) => {
      const item = categoryItems.find((item) => item.id === itemId);
      if (item) {
        sourceCategory = categoryId;
        foundItem = item;
      }
    });
    
    if (foundItem && sourceCategory !== newCategoryId) {
      // Create a new items by category object
      const newItemsByCategory = { ...itemsByCategory };
      
      // Remove the item from its current category
      newItemsByCategory[sourceCategory] = newItemsByCategory[sourceCategory].filter(
        (item) => item.id !== itemId
      );
      
      // Add the item to the new category
      newItemsByCategory[newCategoryId] = [
        ...newItemsByCategory[newCategoryId],
        { ...foundItem, categoryId: newCategoryId }
      ];
      
      setItemsByCategory(newItemsByCategory);
      
      // Track the change
      const existingChangeIndex = changes.findIndex((change) => change.itemId === itemId);
      
      if (existingChangeIndex !== -1) {
        // Update existing change
        const newChanges = [...changes];
        newChanges[existingChangeIndex].categoryId = newCategoryId;
        setChanges(newChanges);
      } else {
        // Add new change
        setChanges([...changes, { itemId, categoryId: newCategoryId }]);
      }
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await onSave(changes);
      setChanges([]);
      setSuccess('Changes saved successfully');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (error: any) {
      console.error('Error saving changes:', error);
      setError(error.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Create notification component
  const Notification = ({ type, message }: { type: 'error' | 'success'; message: string }) => {
    return (
      <div className={`flex items-center p-3 rounded-md ${
        type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
                          'bg-green-50 text-green-700 border border-green-200'
      }`}>
        {type === 'error' ? 
          <AlertCircle className="mr-2 h-5 w-5" /> : 
          <CheckCircle2 className="mr-2 h-5 w-5" />
        }
        <span>{message}</span>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Item Categories</h2>
        <Button 
          onClick={handleSave} 
          disabled={changes.length === 0 || isSaving}
          className="flex items-center"
        >
          {isSaving ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            `Save Changes (${changes.length})`
          )}
        </Button>
      </div>
      
      {error && (
        <Notification type="error" message={error} />
      )}
      
      {success && (
        <Notification type="success" message={success} />
      )}
      
      {changes.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-700 text-sm">
          You have {changes.length} unsaved {changes.length === 1 ? 'change' : 'changes'}. 
          Click "Save Changes" to apply them.
        </div>
      )}
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              id={`category-${category.id}`} // Used for drop target identification
              className="border rounded-md p-4 bg-gray-50"
            >
              <h3 className="font-medium mb-3 pb-2 border-b">{category.name}</h3>
              
              <SortableContext items={itemsByCategory[category.id]?.map(item => item.id) || []}>
                <div className="space-y-2 min-h-[50px]">
                  {itemsByCategory[category.id]?.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      categories={categories}
                      onCategoryChange={handleCategoryChange}
                    />
                  ))}
                  {itemsByCategory[category.id]?.length === 0 && (
                    <div className="p-4 text-center text-gray-500 bg-white rounded-md border border-dashed">
                      No items in this category
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
        
        {/* Overlay for the dragged item */}
        <DragOverlay>
          {activeItem ? <DragOverlayItem item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default ItemCategorizer; 