import { useState } from 'react';
import type { GestureType } from '@/types/gestures';
import { GESTURE_MAP } from '@/types/gestures';

const GESTURE_ORDER: GestureType[] = [
  'point',
  'fist',
  'open_palm',
  'pinch',
  'victory',
  'thumbs_up',
  'swipe_left',
  'swipe_right',
];

export function GestureGuide({ activeGesture }: { activeGesture: GestureType }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-slate-200">Gesture Guide</h3>
            <p className="text-xs text-slate-500">How to control your computer</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 space-y-2">
          {GESTURE_ORDER.map((type) => {
            const info = GESTURE_MAP[type];
            const isActive = activeGesture === type;
            return (
              <div
                key={type}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/15 border border-cyan-400/40 scale-[1.02]'
                    : 'bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className={`text-2xl ${isActive ? 'scale-110' : ''} transition-transform`}>
                  {info.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {info.label}
                    </span>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-400 text-slate-900 animate-pulse">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{info.description}</p>
                </div>
                <div className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                  isActive
                    ? 'bg-cyan-400/20 text-cyan-300'
                    : 'bg-slate-700/40 text-slate-400'
                }`}>
                  {info.action}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
