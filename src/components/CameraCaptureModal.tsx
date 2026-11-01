import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, AlertTriangle, CheckCircle, Video } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Initialize or reinitialize camera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your current browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No active camera device was detected on your system.');
      } else {
        setError(err.message || 'Unable to connect to camera.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-white">
                Live Document Camera
              </h3>
              <p className="text-xs text-slate-400">
                Frame the document, intake sheet, or ID card clearly
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview viewport */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-8 text-center max-w-sm">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Camera Unavailable</h4>
              <p className="text-xs text-slate-400 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Camera
              </button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured document"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Framing Box */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-indigo-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-3 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-indigo-400 -mt-1 -ml-1" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-indigo-400 -mt-1 -mr-1" />
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-medium text-white/90 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full shadow">
                    Align edges of paper or ID card within box
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-indigo-400 -mb-1 -ml-1" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-indigo-400 -mb-1 -mr-1" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={toggleFacingMode}
                disabled={!!error}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Switch Camera
              </button>

              <button
                type="button"
                onClick={handleCapture}
                disabled={!!error}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-40"
              >
                <Camera className="w-4 h-4" />
                Snap &amp; Scan
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retake Photo
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Use Photo for AI Scan
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
