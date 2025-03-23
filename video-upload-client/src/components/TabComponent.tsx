'use client';

import { useState, useEffect } from 'react';
import VideoRecorder from './VideoRecorder';
type Tab = 'record';

export default function TabComponent() {
  const [activeTab, setActiveTab] = useState<Tab>('record');
  const [key, setKey] = useState<number>(0); // Key used to force component remount
  
  // When tab changes, increment key to force component remount
  // This ensures clean up of camera resources when switching tabs
  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [activeTab]);
  
  return (
    <div className="w-full bg-nerveBlack">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('record')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'record'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Record Video
          </button>
        </nav>
      </div>
      
      <div className="mt-6">
          <VideoRecorder key={`recorder-${key}`} /> : 
      </div>
    </div>
  );
}