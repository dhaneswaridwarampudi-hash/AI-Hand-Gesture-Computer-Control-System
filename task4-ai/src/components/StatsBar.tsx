import type { GestureType } from '@/types/gestures';
import { GESTURE_MAP } from '@/types/gestures';

interface StatsBarProps {
  fps: number;
  isTracking: boolean;
  totalGestures: number;
  gestureCounts: Record<string, number>;
  sessionTime: number;
}

export function StatsBar({ fps, isTracking, totalGestures, gestureCounts, sessionTime }: StatsBarProps) {
  const minutes = Math.floor(sessionTime / 60);
  const seconds = sessionTime % 60;

  const topGestures = Object.entries(gestureCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* FPS */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500 font-medium">Performance</span>
          <div className={`w-2 h-2 rounded-full ${fps >= 25 ? 'bg-green-400' : fps >= 15 ? 'bg-yellow-400' : 'bg-red-400'}`} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-100">{fps}</span>
          <span className="text-xs text-slate-500">FPS</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              fps >= 25 ? 'bg-green-400' : fps >= 15 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${Math.min((fps / 30) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Session Time */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500 font-medium">Session</span>
          <svg className={`w-3.5 h-3.5 ${isTracking ? 'text-green-400' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-100">{minutes}</span>
          <span className="text-xs text-slate-500">m</span>
          <span className="text-2xl font-bold text-slate-100">{seconds.toString().padStart(2, '0')}</span>
          <span className="text-xs text-slate-500">s</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-2">{isTracking ? 'Active session' : 'Not running'}</p>
      </div>

      {/* Total Gestures */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500 font-medium">Gestures</span>
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-100">{totalGestures}</span>
          <span className="text-xs text-slate-500">detected</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-2">Total this session</p>
      </div>

      {/* Top Gesture */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500 font-medium">Top Gestures</span>
          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        {topGestures.length > 0 ? (
          <div className="space-y-1">
            {topGestures.map(([type, count]) => {
              const info = GESTURE_MAP[type as GestureType];
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="text-sm">{info?.icon}</span>
                  <span className="text-[10px] text-slate-400 flex-1 truncate">{info?.label}</span>
                  <span className="text-[10px] font-bold text-slate-300">{count}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-slate-600 mt-2">No gestures yet</p>
        )}
      </div>
    </div>
  );
}
