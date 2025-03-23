'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function VideoRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recordedVideoRef = useRef<HTMLVideoElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Update video srcObject when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' }, width: 1280, height: 720 }, 
        audio: true 
      });
      
      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setStatus({
        message: `Error accessing camera: ${err instanceof Error ? err.message : String(err)}`,
        isError: true
      });
    }
  };
  
  // Start recording
  const startRecording = () => {
    if (!stream) return;
  
    chunksRef.current = [];
  
    // Use browser-compatible MIME type
    let options = { mimeType: '' };
  
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      options.mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      options.mimeType = 'video/webm;codecs=vp8';
    } else {
      options = {};
    }
  
    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
  
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);
      };
  
      mediaRecorder.start(100); // 100ms chunks
      setRecording(true);
    } catch (err) {
      console.error('MediaRecorder error:', err);
      setStatus({
        message: `MediaRecorder error: ${err instanceof Error ? err.message : String(err)}`,
        isError: true,
      });
    }
  };
  
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      // Stop all tracks in the stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };
  
  // Update recorded video ref when recordedVideo changes
  useEffect(() => {
    if (recordedVideoRef.current && recordedVideo) {
      recordedVideoRef.current.src = recordedVideo;
    }
  }, [recordedVideo]);
  
  // Upload recorded video
  const uploadRecording = async () => {
    if (chunksRef.current.length === 0) return;
    
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
    
    await uploadFile(file);
  };
  
  // Upload file to Supabase
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
        });
  
      if (error) throw error;
  
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);
  
      setStatus({
        message: `File uploaded successfully! URL: ${urlData.publicUrl}`,
        isError: false,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus({
        message: `Upload failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        isError: true,
      });
    } finally {
      setUploading(false);
    }
  };
  
  
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {!recordedVideo ? (
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden w-full max-w-2xl">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />

            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Camera preview will appear here</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden w-full max-w-2xl">
            <video 
              ref={recordedVideoRef} 
              controls 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-center space-x-4">
        {!stream && !recordedVideo && (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Start Camera
          </button>
        )}
        
        {stream && !recording && !recordedVideo && (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Start Recording
          </button>
        )}
        
        {recording && (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Stop Recording
          </button>
        )}
        
        {recordedVideo && (
          <button
            onClick={uploadRecording}
            disabled={uploading}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : 'Upload Recording'}
          </button>
        )}
        
        {recordedVideo && (
          <button
            onClick={() => {
              setRecordedVideo(null);
              setStream(null);
              chunksRef.current = [];
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Record New
          </button>
        )}
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