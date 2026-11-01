import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw, RefreshCw, Maximize2, Minimize2, Eye, SunMedium } from 'lucide-react';

interface DocumentViewerProps {
  dataUrl: string;
  mimeType: string;
  fileName: string;
  fileSize?: number;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  dataUrl,
  mimeType,
  fileName,
  fileSize,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3.5));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setHighContrast(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className={`flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'relative'
    }`}>
      {/* Top Document Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-slate-300 text-xs">
        <div className="flex items-center gap-2 truncate max-w-[200px] sm:max-w-xs">
          <span className="font-medium text-white truncate">{fileName || 'Document Snapshot'}</span>
          {fileSize && (
            <span className="text-slate-400 font-mono">
              ({(fileSize / 1024).toFixed(0)} KB)
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            title="Toggle contrast enhancement (great for faint pencil or handwriting)"
            className={`p-1.5 rounded transition-colors ${
              highContrast ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <SunMedium className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom out"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-slate-400 px-1 select-none min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom in"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            title="Rotate 90 degrees"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Reset viewer"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Viewport Canvas */}
      <div
        className={`relative flex-1 overflow-hidden flex items-center justify-center p-4 select-none ${
          scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            filter: highContrast ? 'contrast(170%) brightness(95%)' : 'none',
          }}
          className="max-w-full max-h-full flex items-center justify-center"
        >
          {isPdf ? (
            <object
              data={dataUrl}
              type="application/pdf"
              className="w-[600px] h-[750px] bg-white rounded shadow-lg max-w-full"
            >
              <div className="p-8 text-center text-slate-400 bg-slate-950 rounded">
                <p className="font-semibold text-white mb-2">PDF Document Ready</p>
                <p className="text-xs">Preview loaded and analyzed by Gemini OCR engine.</p>
              </div>
            </object>
          ) : (
            <img
              src={dataUrl}
              alt={fileName || 'Scanned Document Preview'}
              className="max-h-[680px] max-w-full object-contain rounded shadow-2xl bg-white/5"
              draggable={false}
            />
          )}
        </div>

        {/* Hint footer */}
        <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur px-2.5 py-1 rounded text-[11px] text-slate-400 pointer-events-none">
          {scale > 1 ? 'Drag to pan around document' : 'Compare handwritten and printed entries against form'}
        </div>
      </div>
    </div>
  );
};
