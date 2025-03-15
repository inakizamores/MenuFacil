'use client';

import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import type { DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { Button } from '@/components/ui/Button';

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

interface DraggableItemProps {
  item: MenuItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onCategoryChange: (itemId: string, categoryId: string) => void;
  categories: Category[];
  currentCategory: string;
}

// Item drag type
const ITEM_TYPE = 'menu-item';

const DraggableItem = ({ 
  item, 
  index, 
  moveItem, 
  onCategoryChange,
  categories,
  currentCategory
}: DraggableItemProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ id: item.id, index }),
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (draggedItem: { id: string; index: number }, monitor: DropTargetMonitor) => {
      if (!draggedItem || draggedItem.index === index) {
        return;
      }
      moveItem(draggedItem.index, index);
      draggedItem.index = index;
    }
  });

  return (
    <div 
      ref={(node) => drag(drop(node))} 
      className={`p-4 mb-2 rounded-lg border bg-white shadow-sm flex items-center justify-between ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
          {item.image_url && (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-500">${item.price.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Category selector */}
      <select
        value={item.categoryId}
        onChange={(e) => onCategoryChange(item.id, e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const CategoryItems = ({ 
  category, 
  items,
  allCategories,
  onCategoryChange,
  onSaveOrder,
  isChanged
}: { 
  category: Category; 
  items: MenuItem[];
  allCategories: Category[];
  onCategoryChange: (itemId: string, categoryId: string) => void;
  onSaveOrder: () => Promise<void>;
  isChanged: boolean;
}) => {
  const [categoryItems, setCategoryItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    setCategoryItems(items.filter(item => item.categoryId === category.id));
  }, [items, category.id]);

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = categoryItems[dragIndex];
    if (!dragItem) return;
    
    const newItems = [...categoryItems];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, dragItem);
    
    setCategoryItems(newItems);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{category.name}</h3>
        {isChanged && (
          <Button
            variant="outline"
            onClick={onSaveOrder}
            className="text-sm"
          >
            Save Order
          </Button>
        )}
      </div>
      {categoryItems.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed border-gray-300 text-center text-gray-500">
          No items in this category
        </div>
      ) : (
        <div>
          {categoryItems.map((item, index) => (
            <DraggableItem
              key={item.id}
              item={item}
              index={index}
              moveItem={moveItem}
              onCategoryChange={onCategoryChange}
              categories={allCategories}
              currentCategory={category.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ItemCategorizer = ({ categories, items, onSave }: ItemCategorizerProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [changes, setChanges] = useState<Map<string, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMenuItems(items);
  }, [items]);

  const handleCategoryChange = (itemId: string, newCategoryId: string) => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, categoryId: newCategoryId } 
          : item
      )
    );
    
    setChanges(prev => {
      const newChanges = new Map(prev);
      newChanges.set(itemId, newCategoryId);
      return newChanges;
    });
  };

  const handleSaveChanges = async () => {
    if (changes.size === 0) return;
    
    setIsSaving(true);
    try {
      const itemChanges = Array.from(changes.entries()).map(([itemId, categoryId]) => ({
        itemId,
        categoryId
      }));
      
      await onSave(itemChanges);
      setChanges(new Map());
    } catch (error) {
      console.error('Error saving category changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Item Categorization</h2>
          {changes.size > 0 && (
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : `Save Changes (${changes.size})`}
            </Button>
          )}
        </div>
        
        <div className="space-y-6">
          {categories.map(category => (
            <CategoryItems
              key={category.id}
              category={category}
              items={menuItems}
              allCategories={categories}
              onCategoryChange={handleCategoryChange}
              onSaveOrder={handleSaveChanges}
              isChanged={changes.size > 0}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default ItemCategorizer; 