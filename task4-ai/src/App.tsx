import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraView } from '@/components/CameraView';
import { VirtualDesktop } from '@/components/VirtualDesktop';
import { GestureGuide } from '@/components/GestureGuide';
import { StatsBar } from '@/components/StatsBar';
import { useHandTracking } from '@/hooks/useHandTracking';
import type { GestureType } from '@/types/gestures';
import { GESTURE_MAP } from '@/types/gestures';
import { supabase } from '@/lib/supabase';

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { trackingState, isLoading, error, isStarted, startCamera, stopCamera } =
    useHandTracking(videoRef);

  const [totalGestures, setTotalGestures] = useState(0);
  const [gestureCounts, setGestureCounts] = useState<Record<string, number>>({});
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [activeGesture, setActiveGesture] = useState<GestureType>('none');

  const sessionStartRef = useRef<number | null>(null);
  const gestureCountsRef = useRef<Record<string, number>>({});
  const totalGesturesRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);

  // Session timer
  useEffect(() => {
    if (!isStarted) {
      setSessionTime(0);
      return;
    }
    const interval = setInterval(() => {
      if (sessionStartRef.current) {
        setSessionTime(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted]);

  const handleStart = useCallback(async () => {
    await startCamera();
    sessionStartRef.current = Date.now();
    setSessionStart(Date.now());
    gestureCountsRef.current = {};
    totalGesturesRef.current = 0;
    setGestureCounts({});
    setTotalGestures(0);

    // Create session record in Supabase
    try {
      const { data } = await supabase
        .from('gesture_sessions')
        .insert({
          started_at: new Date().toISOString(),
          gestures_detected: 0,
          gesture_breakdown: {},
        })
        .select('id')
        .single();
      if (data) {
        sessionIdRef.current = data.id;
      }
    } catch {
      // Non-critical — session tracking is best-effort
    }
  }, [startCamera]);

  const handleStop = useCallback(async () => {
    stopCamera();
    const duration = sessionStartRef.current
      ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
      : 0;

    // Update session record in Supabase
    if (sessionIdRef.current) {
      try {
        await supabase
          .from('gesture_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: duration,
            gestures_detected: totalGesturesRef.current,
            gesture_breakdown: gestureCountsRef.current,
          })
          .eq('id', sessionIdRef.current);
      } catch {
        // Non-critical
      }
      sessionIdRef.current = null;
    }

    sessionStartRef.current = null;
    setSessionStart(null);
  }, [stopCamera]);

  const handleGesture = useCallback((gesture: GestureType) => {
    if (gesture === 'none') return;
    totalGesturesRef.current += 1;
    setTotalGestures(totalGesturesRef.current);

    gestureCountsRef.current = {
      ...gestureCountsRef.current,
      [gesture]: (gestureCountsRef.current[gesture] || 0) + 1,
    };
    setGestureCounts({ ...gestureCountsRef.current });
  }, []);

  // Track active gesture for UI
  useEffect(() => {
    if (trackingState.hands.length > 0) {
      setActiveGesture(trackingState.hands[0].gesture);
    } else {
      setActiveGesture('none');
    }
  }, [trackingState.hands]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4l3 3m12 9l3 3M3 20l3-3m12-9l3-3" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                GestureControl AI
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Control your computer with hand gestures — powered by computer vision
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/50">
              <div className={`w-2 h-2 rounded-full ${isStarted ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-medium text-slate-400">
                {isStarted ? 'Tracking' : 'Standby'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/50">
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-medium text-slate-400">{trackingState.fps} FPS</span>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="mb-6">
          <StatsBar
            fps={trackingState.fps}
            isTracking={trackingState.isTracking}
            totalGestures={totalGestures}
            gestureCounts={gestureCounts}
            sessionTime={sessionTime}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Camera + Desktop */}
          <div className="lg:col-span-2 space-y-6">
            <CameraView
              videoRef={videoRef}
              hands={trackingState.hands}
              isTracking={trackingState.isTracking}
              isStarted={isStarted}
              isLoading={isLoading}
              error={error}
              onStart={handleStart}
              onStop={handleStop}
            />

            <VirtualDesktop
              hands={trackingState.hands}
              isTracking={trackingState.isTracking}
              onGesture={handleGesture}
            />
          </div>

          {/* Right: Gesture Guide */}
          <div className="space-y-6">
            <GestureGuide activeGesture={activeGesture} />

            {/* AI Approach explanation */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-200">AI Approach</h3>
              </div>
              <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
                <p>
                  This system uses <span className="text-cyan-300 font-medium">MediaPipe Hand Landmarker</span>,
                  a Google machine learning model that detects 21 3D landmarks on each hand in real-time.
                </p>
                <p>
                  The model runs entirely in your browser using GPU acceleration. Each frame from your webcam
                  is analyzed to identify finger positions, which are then classified into gestures using
                  geometric heuristics — comparing finger extension states, tip-to-joint distances, and
                  movement velocity.
                </p>
                <p>
                  Gestures are mapped to computer actions: <span className="text-slate-300">pointing</span> moves
                  the cursor, <span className="text-slate-300">fist</span> clicks, <span className="text-slate-300">victory</span> scrolls,
                  <span className="text-slate-300"> thumbs up</span> controls volume, and <span className="text-slate-300">swipes</span> navigate.
                </p>
              </div>
            </div>

            {/* Session info */}
            {isStarted && (
              <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-400/20 p-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <h3 className="text-sm font-semibold text-cyan-300">Session Active</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your gesture data is being saved to track your session stats. Move your hand in front of the
                  camera and try different gestures to control the virtual desktop.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-600">
            <p>GestureControl AI — Hand gesture computer control powered by MediaPipe & computer vision</p>
            <p>Allow camera access when prompted · Best in good lighting</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
