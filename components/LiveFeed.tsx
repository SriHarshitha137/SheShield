
import React, { useEffect, useRef, useState } from 'react';

interface LiveFeedProps {
  isActive: boolean;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isActive) {
      const startCamera = async () => {
        try {
          const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        } catch (err) {
          console.error("Camera error:", err);
        }
      };
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  return (
    <div className={`relative overflow-hidden rounded-3xl shadow-xl aspect-video bg-black transition-all ${isActive ? 'ring-4 ring-red-500 ring-offset-4' : ''}`}>
      {!isActive ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <i className="fas fa-video-slash text-2xl"></i>
          </div>
          <span className="text-sm font-medium">Camera standby</span>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            REC 00:0{Math.floor(Math.random() * 9)}:1{Math.floor(Math.random() * 9)}
          </div>
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-mono">
            LIVE BROADCASTING TO CLOUD
          </div>
        </>
      )}
    </div>
  );
};
