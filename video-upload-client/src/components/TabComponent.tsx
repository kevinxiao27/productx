"use client";

import { useState, useEffect } from "react";
import VideoRecorder from "./VideoRecorder";
type Tab = "record";

export default function TabComponent() {
  const [activeTab, setActiveTab] = useState<Tab>("record");
  const [key, setKey] = useState<number>(0); // Key used to force component remount

  // When tab changes, increment key to force component remount
  // This ensures clean up of camera resources when switching tabs
  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [activeTab]);

  return (
    <div className='w-full bg-nerveBlack text-gray-300 font-mono p-4 rounded-sm'>
      <h2 className='text-2xl text-titleBlue mb-4'>NERVE VIDEO RECORDER</h2>

      <div className='border-b border-gray-700 mb-6'>
        <nav className='flex space-x-6' aria-label='Tabs'>
          <button
            onClick={() => setActiveTab("record")}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors duration-200 ${
              activeTab === "record"
                ? "border-titleBlue text-titleBlue"
                : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500"
            }`}
          >
            RECORD VIDEO
          </button>
        </nav>
      </div>

      <div className='border border-gray-700 rounded-sm p-6 bg-black/30'>
        <VideoRecorder key={`recorder-${key}`} />
      </div>

      <div className='mt-6 text-xs text-gray-500'>
        <p>Use this interface to record video evidence. All videos are encrypted and securely stored.</p>
      </div>
    </div>
  );
}
