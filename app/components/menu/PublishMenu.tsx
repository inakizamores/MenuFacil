'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { publishMenu, unpublishMenu } from '@/actions/menus';

interface PublishMenuProps {
  /** The ID of the menu to publish or unpublish */
  menuId: string;
  /** Whether the menu is currently active/published */
  isActive: boolean;
  /** The name of the menu for display purposes */
  menuName: string;
  /** Callback function triggered when publish/unpublish is successful */
  onSuccess: () => void;
}

/**
 * PublishMenu Component
 * 
 * A component for publishing and unpublishing menus with version tracking.
 * Provides a UI for setting version information and publication notes.
 *
 * @param menuId - The ID of the menu to publish/unpublish
 * @param isActive - Whether the menu is currently active/published
 * @param menuName - The name of the menu for display
 * @param onSuccess - Callback when publish/unpublish succeeds
 */
const PublishMenu = ({ menuId, isActive, menuName, onSuccess }: PublishMenuProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [publishNotes, setPublishNotes] = useState('');
  const [version, setVersion] = useState('');

  /**
   * Handles the publish menu action
   * Creates a new published version and marks the menu as active
   */
  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);

    try {
      const result = await publishMenu({
        id: menuId,
        version: version || undefined,
        publishNotes: publishNotes || undefined
      });

      if (result.success) {
        setShowForm(false);
        onSuccess();
      } else {
        setError(result.error || 'Failed to publish menu');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error publishing menu:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * Handles the unpublish menu action
   * Marks the menu as inactive, preserving version history
   */
  const handleUnpublish = async () => {
    setIsUnpublishing(true);
    setError(null);

    try {
      const result = await unpublishMenu(menuId);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Failed to unpublish menu');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error unpublishing menu:', err);
    } finally {
      setIsUnpublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Menu Publication</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-700">
            Status: <span className={isActive ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
              {isActive ? 'Published' : 'Draft'}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {isActive 
              ? 'This menu is currently visible to customers.' 
              : 'This menu is not published and is only visible to you.'}
          </p>
        </div>
        
        {isActive ? (
          <Button
            variant="outline"
            onClick={handleUnpublish}
            disabled={isUnpublishing}
          >
            {isUnpublishing ? 'Unpublishing...' : 'Unpublish Menu'}
          </Button>
        ) : (
          <Button
            onClick={() => setShowForm(true)}
            disabled={isPublishing || showForm}
          >
            Publish Menu
          </Button>
        )}
      </div>
      
      {showForm && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Publish "{menuName}"</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
                Version (Optional)
              </label>
              <Input
                id="version"
                placeholder="e.g., 1.0.0 or Summer 2024"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                If left blank, a date-based version will be generated automatically.
              </p>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Publication Notes (Optional)
              </label>
              <Textarea
                id="notes"
                placeholder="What's new in this version?"
                value={publishNotes}
                onChange={(e) => setPublishNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish Now'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishMenu; 