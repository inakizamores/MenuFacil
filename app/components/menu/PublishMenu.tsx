'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, CheckCircle2, Globe, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';

/**
 * Props for the PublishMenu component
 * @interface PublishMenuProps
 * @property {string} menuId - ID of the menu to publish/unpublish
 * @property {string} restaurantId - ID of the restaurant the menu belongs to
 * @property {boolean} isPublished - Current published state of the menu
 * @property {string|null} lastPublishedAt - Timestamp of when the menu was last published
 * @property {Function} onPublish - Callback function to publish the menu
 * @property {Function} onUnpublish - Callback function to unpublish the menu
 */
interface PublishMenuProps {
  menuId: string;
  restaurantId: string;
  isPublished: boolean;
  lastPublishedAt: string | null;
  onPublish: (menuId: string) => Promise<{ success: boolean; error?: string }>;
  onUnpublish: (menuId: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * PublishMenu Component
 * 
 * A component for managing the publication status of a menu.
 * Provides toggle functionality to publish or unpublish a menu,
 * along with status indicators and links to view the published menu.
 *
 * @param {PublishMenuProps} props - Component props
 * @returns {JSX.Element} - The rendered component
 */
const PublishMenu: React.FC<PublishMenuProps> = ({
  menuId,
  restaurantId,
  isPublished,
  lastPublishedAt,
  onPublish,
  onUnpublish
}) => {
  const router = useRouter();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [publishState, setPublishState] = useState(isPublished);

  /**
   * Handles toggling the publish state of the menu
   * @param {boolean} checked - The new publish state
   */
  const handlePublishToggle = async (checked: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = checked 
        ? await onPublish(menuId)
        : await onUnpublish(menuId);
        
      if (result.success) {
        setPublishState(checked);
        setSuccess(`Menu successfully ${checked ? 'published' : 'unpublished'}`);
        // Refresh the page data
        router.refresh();
      } else {
        setError(result.error || `Failed to ${checked ? 'publish' : 'unpublish'} menu`);
      }
    } catch (err: any) {
      console.error('Error toggling menu publish state:', err);
      setError(err.message || `Failed to ${checked ? 'publish' : 'unpublish'} menu`);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Opens the published menu in a new tab
   */
  const viewPublishedMenu = () => {
    window.open(`/r/${restaurantId}/menu/${menuId}`, '_blank');
  };
  
  /**
   * Formats a date string for display
   * @param {string|null} dateString - ISO date string or null
   * @returns {string} - Formatted date string or "Never" if null
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Menu Visibility</h2>
      
      {/* Error notification */}
      {error && (
        <div className="mb-4 flex items-center p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success notification */}
      {success && (
        <div className="mb-4 flex items-center p-3 rounded-md bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="mr-2 h-5 w-5" />
          <span>{success}</span>
        </div>
      )}
      
      {/* Main toggle control */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-gray-100 rounded-full p-2">
            <Globe className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <p className="font-medium">Public availability</p>
            <p className="text-sm text-gray-500">
              {publishState 
                ? 'Your menu is currently visible to the public' 
                : 'Your menu is currently hidden from the public'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          {loading ? (
            <Spinner size="sm" className="mr-3" />
          ) : (
            <>
              <span className="mr-3 text-sm font-medium text-gray-700">
                {publishState ? 'Published' : 'Draft'}
              </span>
              <Switch 
                checked={publishState} 
                onCheckedChange={handlePublishToggle}
                disabled={loading}
              />
            </>
          )}
        </div>
      </div>
      
      {/* Last published info */}
      <div className="text-sm text-gray-600 mb-4">
        Last published: <span className="font-medium">{formatDate(lastPublishedAt)}</span>
      </div>
      
      {/* View published menu button - only shown when menu is published */}
      {publishState && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={viewPublishedMenu}
        >
          <EyeIcon className="h-4 w-4" />
          View Published Menu
        </Button>
      )}
    </div>
  );
};

export default PublishMenu; 