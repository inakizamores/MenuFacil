import { FC, useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { FiUpload, FiX } from 'react-icons/fi';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSizeInMB?: number;
  isLoading?: boolean;
  progress?: number;
  preview?: string;
}

export const FileUpload: FC<FileUploadProps> = ({
  onFileSelected,
  accept = '*/*',
  maxSizeInMB = 5,
  isLoading = false,
  progress = 0,
  preview
}) => {
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    validateAndProcessFile(files[0]);
  };
  
  const validateAndProcessFile = (file: File) => {
    setError(null);
    
    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError(`File size exceeds ${maxSizeInMB}MB limit.`);
      return;
    }
    
    // Check file type if accept is provided
    if (accept !== '*/*') {
      const acceptTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      
      // If it's an image/ and we accept image/*, that should be valid
      const isValidType = acceptTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return fileType.startsWith(`${category}/`);
        }
        return type === fileType;
      });
      
      if (!isValidType) {
        setError(`File type not accepted. Please upload ${accept}`);
        return;
      }
    }
    
    // If validation passes, call the provided callback
    onFileSelected(file);
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };
  
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full">
      {/* File Upload Area */}
      {!preview && (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${error ? 'border-red-300 bg-red-50' : ''} transition-colors duration-200`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center cursor-pointer">
            <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Drag and drop a file here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              {accept === '*/*' ? 'Any file type' : `Accepted: ${accept}`} (Max: {maxSizeInMB}MB)
            </p>
            
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            
            {isLoading && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">Uploading... {progress}%</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Preview Area */}
      {preview && (
        <div className="border rounded-lg p-3 relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-gray-100">
            <Image
              src={preview}
              alt="File preview"
              fill
              className="object-cover"
            />
          </div>
          
          <Button
            onClick={() => openFileDialog()}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            {isLoading ? <Spinner size="sm" /> : 'Change file'}
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
          
          {isLoading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">Uploading... {progress}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 