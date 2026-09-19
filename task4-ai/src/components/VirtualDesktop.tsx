import { useEffect, useRef, useState } from 'react';
import type { HandData, GestureType } from '@/types/gestures';
import { GESTURE_MAP } from '@/types/gestures';

interface VirtualDesktopProps {
  hands: HandData[];
  isTracking: boolean;
  onGesture: (gesture: GestureType) => void;
}

interface WindowApp {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  content: 'browser' | 'music' | 'volume' | 'gallery' | 'terminal';
}

const APPS: WindowApp[] = [
  {
    id: 'browser',
    title: 'Browser',
    icon: '🌐',
    x: 40,
    y: 40,
    width: 320,
    height: 200,
    color: 'from-blue-500/20 to-cyan-500/10',
    content: 'browser',
  },
  {
    id: 'music',
    title: 'Music Player',
    icon: '🎵',
    x: 400,
    y: 40,
    width: 280,
    height: 200,
    color: 'from-purple-500/20 to-pink-500/10',
    content: 'music',
  },
  {
    id: 'volume',
    title: 'Volume Control',
    icon: '🔊',
    x: 40,
    y: 280,
    width: 280,
    height: 180,
    color: 'from-amber-500/20 to-orange-500/10',
    content: 'volume',
  },
  {
    id: 'gallery',
    title: 'Photo Gallery',
    icon: '🖼️',
    x: 360,
    y: 280,
    width: 320,
    height: 180,
    color: 'from-emerald-500/20 to-teal-500/10',
    content: 'gallery',
  },
];

export function VirtualDesktop({ hands, isTracking, onGesture }: VirtualDesktopProps) {
  const [cursorPos, setCursorPos] = useState({ x: 400, y: 300 });
  const [volume, setVolume] = useState(50);
  const [scrollY, setScrollY] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [clickEffect, setClickEffect] = useState<{ x: number; y: number; id: number } | null>(null);
  const [activeGesture, setActiveGesture] = useState<GestureType>('none');
  const [lastGesture, setLastGesture] = useState<GestureType>('none');
  const [gestureCooldown, setGestureCooldown] = useState(0);
  const [highlightedApp, setHighlightedApp] = useState<string | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const galleryImages = [
    'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1287142/pexels-photo-1287142.jpeg?auto=compress&cs=tinysrgb&w=400',
  ];

  const galleryColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  useEffect(() => {
    if (!isTracking || hands.length === 0) {
      setActiveGesture('none');
      return;
    }

    const hand = hands[0];
    const now = Date.now();
    if (now < gestureCooldown) return;

    const gesture = hand.gesture;

    // Update cursor position based on fingertip
    if (desktopRef.current) {
      const rect = desktopRef.current.getBoundingClientRect();
      const cursorX = (1 - hand.fingertip.x) * rect.width;
      const cursorY = hand.fingertip.y * rect.height;
      setCursorPos({ x: cursorX, y: cursorY });
    }

    setActiveGesture(gesture);

    // Handle gestures
    if (gesture !== lastGesture && gesture !== 'none') {
      onGesture(gesture);

      switch (gesture) {
        case 'fist':
          setClickEffect({ x: cursorPos.x, y: cursorPos.y, id: now });
          setTimeout(() => setClickEffect(null), 600);
          break;
        case 'victory':
          setScrollY((prev) => Math.max(prev - 50, 0));
          break;
        case 'thumbs_up':
          setVolume((prev) => Math.min(prev + 10, 100));
          break;
        case 'swipe_left':
          setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
          break;
        case 'swipe_right':
          setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
          break;
      }

      setLastGesture(gesture);
      setGestureCooldown(now + 500);
    } else if (gesture === 'none' && lastGesture !== 'none') {
      setLastGesture('none');
    }

    // Check which app the cursor is over
    for (const app of APPS) {
      if (
        cursorPos.x >= app.x &&
        cursorPos.x <= app.x + app.width &&
        cursorPos.y >= app.y &&
        cursorPos.y <= app.y + app.height
      ) {
        setHighlightedApp(app.id);
        break;
      } else {
        setHighlightedApp(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hands, isTracking]);

  const gestureInfo = GESTURE_MAP[activeGesture] || GESTURE_MAP.none;

  return (
    <div className="relative w-full h-full">
      {/* Desktop header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isTracking ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs font-medium text-slate-400">
            {isTracking ? 'Live Gesture Control Active' : 'Tracking Inactive'}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/50">
          <span className="text-base">{gestureInfo.icon}</span>
          <span className="text-xs font-semibold text-cyan-300">
            {activeGesture !== 'none' ? gestureInfo.label : 'Idle'}
          </span>
          {activeGesture !== 'none' && (
            <span className="text-[10px] text-slate-500">→ {gestureInfo.action}</span>
          )}
        </div>
      </div>

      {/* Virtual desktop area */}
      <div
        ref={desktopRef}
        className="relative w-full h-[480px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700/50 overflow-hidden"
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* App windows */}
        {APPS.map((app) => (
          <div
            key={app.id}
            className={`absolute rounded-xl border transition-all duration-200 overflow-hidden ${
              highlightedApp === app.id
                ? 'border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                : 'border-slate-700/50'
            }`}
            style={{
              left: app.x,
              top: app.y,
              width: app.width,
              height: app.height,
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${app.color}`} />
            <div className="relative p-3 h-full flex flex-col">
              {/* Window title bar */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{app.icon}</span>
                <span className="text-xs font-medium text-slate-300">{app.title}</span>
                <div className="ml-auto flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400/60" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                  <div className="w-2 h-2 rounded-full bg-green-400/60" />
                </div>
              </div>

              {/* App content */}
              {app.content === 'browser' && (
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/60">
                    <div className="w-3 h-3 rounded-full border border-slate-600" />
                    <div className="flex-1 h-3 rounded bg-slate-700/40" />
                  </div>
                  <div className="flex-1 space-y-1.5 overflow-hidden">
                    <div className="h-2 w-3/4 rounded bg-slate-700/40" />
                    <div className="h-2 w-full rounded bg-slate-700/30" />
                    <div className="h-2 w-5/6 rounded bg-slate-700/30" />
                    <div className="h-8 w-full rounded bg-slate-700/20" />
                    <div className="h-2 w-2/3 rounded bg-slate-700/30" />
                    <div className="h-2 w-full rounded bg-slate-700/20" />
                  </div>
                </div>
              )}

              {app.content === 'music' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                    🎵
                  </div>
                  <div className="h-2 w-24 rounded bg-slate-700/40" />
                  <div className="h-1.5 w-16 rounded bg-slate-700/30" />
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-base text-slate-400">⏮</span>
                    <span className="text-xl text-slate-200">▶</span>
                    <span className="text-base text-slate-400">⏭</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Swipe to change track
                  </div>
                </div>
              )}

              {app.content === 'volume' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <span className="text-3xl">{volume === 0 ? '🔇' : volume < 33 ? '🔈' : volume < 66 ? '🔉' : '🔊'}</span>
                  <div className="w-full px-2">
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                        style={{ width: `${volume}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-300">{volume}%</span>
                  <div className="text-[10px] text-slate-500">👍 to increase volume</div>
                </div>
              )}

              {app.content === 'gallery' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <div
                    className="w-full h-20 rounded-lg flex items-center justify-center text-2xl transition-all duration-300"
                    style={{ backgroundColor: galleryColors[galleryIndex] + '40' }}
                  >
                    <img
                      src={galleryImages[galleryIndex]}
                      alt="Gallery"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {galleryImages.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          idx === galleryIndex ? 'bg-emerald-400 w-4' : 'bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-500">Swipe to navigate</div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Custom cursor */}
        {isTracking && (
          <div
            className="absolute pointer-events-none transition-all duration-75"
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {activeGesture === 'fist' ? (
              <div className="w-8 h-8 rounded-full bg-cyan-400/30 border-2 border-cyan-400 flex items-center justify-center animate-ping-once">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
              </div>
            ) : activeGesture === 'pinch' ? (
              <div className="w-6 h-6 rounded-full bg-amber-400/30 border-2 border-amber-400 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-cyan-400/20 border-2 border-cyan-400/80" />
            )}
          </div>
        )}

        {/* Click ripple effect */}
        {clickEffect && (
          <div
            key={clickEffect.id}
            className="absolute pointer-events-none"
            style={{ left: clickEffect.x, top: clickEffect.y, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-12 h-12 rounded-full border-2 border-cyan-400 animate-click-ripple" />
          </div>
        )}

        {/* Not tracking hint */}
        {!isTracking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2 opacity-40">🖐️</div>
              <p className="text-slate-500 text-sm">Start camera to control this desktop with gestures</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
