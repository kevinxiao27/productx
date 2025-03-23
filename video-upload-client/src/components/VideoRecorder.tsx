'use client';

import { useState, useRef, useEffect } from 'react';

export default function VideoRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [location, setLocation] = useState<{ coordinates: [number, number] } | null>(null);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Attach stream to video preview
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Helper to get geolocation
  const fetchLocation = (): Promise<{ coordinates: [number, number] }> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            coordinates: [pos.coords.longitude, pos.coords.latitude]
          });
        },
        (err) => {
          console.error("❌ Geolocation error:", err);
          reject(new Error("Location not available."));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  // Start camera + fetch location
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: { ideal: 'environment' } },
        audio: true
      });

      const loc = await fetchLocation();
      setLocation(loc);
      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing camera or location:', err);
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        isError: true
      });
    }
  };

  // Periodically update location while recording
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (recording) {
      interval = setInterval(() => {
        fetchLocation().then(setLocation).catch(console.error);
      }, 15000); // every 15 seconds
    }

    return () => clearInterval(interval);
  }, [recording]);

  // Start recording and emit chunks every 15s
  const startRecording = () => {
    if (!stream) return;

    const mimeType = MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : '';

    try {
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          await uploadVideoChunk(event.data);
        }
      };

      mediaRecorder.start(15000); // chunk every 15s
      setRecording(true);
    } catch (err) {
      console.error('MediaRecorder error:', err);
      setStatus({
        message: `MediaRecorder error: ${err instanceof Error ? err.message : String(err)}`,
        isError: true
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  // Upload chunk with location
  const uploadVideoChunk = async (blob: Blob) => {
    try {
      if (!location) throw new Error("Location not available.");

      const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
      const formData = new FormData();
      formData.append("video", file);
      formData.append("location", JSON.stringify(location));
      formData.append("operator", "John Grey");

      const response = await fetch("http://128.189.85.69:8000/api/alerts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed: ${text}`);
      }

      const result = await response.json();
      console.log("✅ Uploaded alert:", result);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setStatus({
        message: `Upload failed: ${err instanceof Error ? err.message : JSON.stringify(err)}`,
        isError: true
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
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
      </div>

      <div className="flex justify-center space-x-4">
        {!stream && (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Start Camera
          </button>
        )}

        {stream && !recording && (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Start Recording
          </button>
        )}

        {recording && (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Stop Recording
          </button>
        )}
      </div>

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
