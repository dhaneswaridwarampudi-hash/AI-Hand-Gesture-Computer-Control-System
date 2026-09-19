import { useEffect, useRef } from 'react';
import type { HandData } from '@/types/gestures';
import { HAND_CONNECTIONS } from '@/lib/gestureDetection';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  hands: HandData[];
  isTracking: boolean;
  isStarted: boolean;
  isLoading: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

const FINGER_COLORS = [
  '#22d3ee',
  '#22d3ee',
  '#34d399',
  '#34d399',
  '#34d399',
  '#fbbf24',
  '#fbbf24',
  '#fbbf24',
  '#fbbf24',
  '#f87171',
  '#f87171',
  '#f87171',
  '#f87171',
  '#a78bfa',
  '#a78bfa',
  '#a78bfa',
  '#f87171',
  '#e879f9',
  '#e879f9',
  '#e879f9',
  '#e879f9',
];

export function CameraView({
  videoRef,
  hands,
  isTracking,
  isStarted,
  isLoading,
  error,
  onStart,
  onStop,
}: CameraViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1280;
    canvas.height = 720;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (hands.length > 0) {
      for (const hand of hands) {
        const w = canvas.width;
        const h = canvas.height;

        // Draw connections
        ctx.lineWidth = 3;
        for (const [a, b] of HAND_CONNECTIONS) {
          const pa = hand.landmarks[a];
          const pb = hand.landmarks[b];
          const gradient = ctx.createLinearGradient(pa.x * w, pa.y * h, pb.x * w, pb.y * h);
          gradient.addColorStop(0, FINGER_COLORS[a]);
          gradient.addColorStop(1, FINGER_COLORS[b]);
          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(pa.x * w, pa.y * h);
          ctx.lineTo(pb.x * w, pb.y * h);
          ctx.stroke();
        }

        // Draw landmarks
        for (let i = 0; i < hand.landmarks.length; i++) {
          const lm = hand.landmarks[i];
          const x = lm.x * w;
          const y = lm.y * h;
          const radius = i === 0 ? 8 : i % 4 === 0 ? 6 : 4;

          ctx.fillStyle = FINGER_COLORS[i];
          ctx.shadowColor = FINGER_COLORS[i];
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Draw palm center
        const pc = hand.palmCenter;
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pc.x * w, pc.y * h, 30, 0, Math.PI * 2);
        ctx.stroke();

        // Draw gesture label
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        const labelX = hand.landmarks[0].x * w;
        const labelY = hand.landmarks[0].y * h;
        ctx.font = 'bold 20px system-ui';
        const gestureText = hand.gesture.replace('_', ' ').toUpperCase();
        const metrics = ctx.measureText(gestureText);
        const padX = 12;
        const padY = 6;
        const boxW = metrics.width + padX * 2;
        const boxH = 28 + padY * 2;
        ctx.beginPath();
        ctx.roundRect(labelX - boxW / 2, labelY + 20, boxW, boxH, 8);
        ctx.fill();
        ctx.fillStyle = '#22d3ee';
        ctx.textAlign = 'center';
        ctx.fillText(gestureText, labelX, labelY + 42);
      }
    }
  }, [hands]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/50 shadow-2xl">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full -scale-x-100 pointer-events-none"
      />

      {/* Scanline effect */}
      {isTracking && (
        <div className="absolute inset-0 pointer-events-none scanline-overlay" />
      )}

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400/60 rounded-br-lg pointer-events-none" />

      {/* Not started overlay */}
      {!isStarted && !isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30 animate-pulse-slow">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-300 text-lg mb-2 font-medium">Camera is off</p>
          <p className="text-slate-500 text-sm mb-6">Click start to begin hand tracking</p>
          <button
            onClick={onStart}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-base hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95"
          >
            Start Camera
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin mb-4" />
          <p className="text-cyan-300 text-sm font-medium">Initializing AI model...</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-300 text-base font-semibold mb-2">Camera Error</p>
          <p className="text-slate-400 text-sm text-center max-w-md mb-6">{error}</p>
          <button
            onClick={onStart}
            className="px-6 py-2.5 rounded-lg bg-slate-800 text-slate-200 font-medium text-sm border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Stop button when tracking */}
      {isStarted && !isLoading && !error && (
        <button
          onClick={onStop}
          className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-red-500/90 text-white text-sm font-medium hover:bg-red-500 transition-colors backdrop-blur-sm shadow-lg z-10"
        >
          Stop
        </button>
      )}
    </div>
  );
}
