'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function FileUploader() {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    await uploadFile(file);
  };
  
  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const filePath = `uploads/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percent));
          }
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);
      
      setStatus({
        message: `File uploaded successfully! URL: ${urlData.publicUrl}`,
        isError: false
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus({
        message: `Upload failed: ${error instanceof Error ? error.message : String(error)}`,
        isError: true
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="max-w-2xl mx-auto">
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Select file to upload
        </label>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          accept="video/*,image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        <p className="mt-1 text-sm text-gray-500">
          Supported files: Videos, images, audio, and documents
        </p>
      </div>
      
      {uploading && (
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-center mt-2 text-sm text-gray-600">
            Uploading: {uploadProgress}%
          </p>
        </div>
      )}
      
      {status && (
        <div className={`p-4 rounded-md w-full max-w-2xl mx-auto ${
          status.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {status.message}
        </div>
      )}
    </div>
  );
}