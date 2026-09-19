import { useCallback, useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { HandData, Landmark, TrackingState } from '@/types/gestures';
import {
  detectGesture,
  detectSwipe,
  getPalmCenter,
  getPinchDistance,
  getFingertip,
} from '@/lib/gestureDetection';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement>) {
  const [trackingState, setTrackingState] = useState<TrackingState>({
    hands: [],
    fps: 0,
    isTracking: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);
  const fpsCounterRef = useRef<number>(0);
  const fpsLastUpdateRef = useRef<number>(0);

  const initLandmarker = useCallback(async () => {
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    const landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    landmarkerRef.current = landmarker;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!landmarkerRef.current) {
        await initLandmarker();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      await video.play();

      setIsStarted(true);
      setTrackingState((prev) => ({ ...prev, isTracking: true }));
      setIsLoading(false);
      detectLoop();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start camera';
      setError(msg);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initLandmarker, videoRef]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
    setIsStarted(false);
    setTrackingState({ hands: [], fps: 0, isTracking: false });
  }, [videoRef]);

  const detectLoop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const now = performance.now();
    const videoTime = video.currentTime * 1000;

    const results = landmarker.detectForVideo(video, videoTime);

    const hands: HandData[] = [];

    if (results.landmarks && results.landmarks.length > 0) {
      for (let i = 0; i < results.landmarks.length; i++) {
        const landmarks = results.landmarks[i] as Landmark[];
        const handedness = results.handednesses?.[i]?.[0]?.categoryName === 'Left' ? 'Left' : 'Right';
        let gesture = detectGesture(landmarks);
        gesture = detectSwipe(landmarks, gesture, now);

        hands.push({
          landmarks,
          handedness,
          gesture,
          pinchDistance: getPinchDistance(landmarks),
          palmCenter: getPalmCenter(landmarks),
          fingertip: getFingertip(landmarks),
        });
      }
    }

    // FPS calculation
    fpsCounterRef.current++;
    if (now - fpsLastUpdateRef.current >= 1000) {
      fpsRef.current = fpsCounterRef.current;
      fpsCounterRef.current = 0;
      fpsLastUpdateRef.current = now;
    }

    const frameDelta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    setTrackingState((prev) => ({
      ...prev,
      hands,
      fps: fpsRef.current,
      isTracking: true,
    }));

    void frameDelta;

    rafRef.current = requestAnimationFrame(detectLoop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  return {
    trackingState,
    isLoading,
    error,
    isStarted,
    startCamera,
    stopCamera,
  };
}
