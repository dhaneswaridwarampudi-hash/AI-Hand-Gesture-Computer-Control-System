import type { GestureType, Landmark } from '@/types/gestures';

// MediaPipe hand landmark indices
const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const INDEX_PIP = 6;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const MIDDLE_PIP = 10;
const MIDDLE_TIP = 12;
const RING_MCP = 13;
const RING_PIP = 14;
const RING_TIP = 16;
const PINKY_MCP = 17;
const PINKY_PIP = 18;
const PINKY_TIP = 20;

function dist(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function isFingerExtended(tip: Landmark, pip: Landmark, mcp: Landmark): boolean {
  return tip.y < pip.y && pip.y < mcp.y;
}

function isFingerCurled(tip: Landmark, pip: Landmark, mcp: Landmark): boolean {
  return tip.y > pip.y && pip.y > mcp.y;
}

function isThumbExtended(landmarks: Landmark[]): boolean {
  const wrist = landmarks[WRIST];
  const thumbTip = landmarks[THUMB_TIP];
  const indexMcp = landmarks[INDEX_MCP];
  const thumbDist = dist(thumbTip, wrist);
  const indexDist = dist(indexMcp, wrist);
  return thumbDist > indexDist * 0.7;
}

export function detectGesture(landmarks: Landmark[]): GestureType {
  if (!landmarks || landmarks.length < 21) return 'none';

  const indexExt = isFingerExtended(landmarks[INDEX_TIP], landmarks[INDEX_PIP], landmarks[INDEX_MCP]);
  const middleExt = isFingerExtended(landmarks[MIDDLE_TIP], landmarks[MIDDLE_PIP], landmarks[MIDDLE_MCP]);
  const ringExt = isFingerExtended(landmarks[RING_TIP], landmarks[RING_PIP], landmarks[RING_MCP]);
  const pinkyExt = isFingerExtended(landmarks[PINKY_TIP], landmarks[PINKY_PIP], landmarks[PINKY_MCP]);
  const thumbExt = isThumbExtended(landmarks);

  const extendedCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

  // Fist: all fingers curled
  if (extendedCount === 0 && !thumbExt) {
    return 'fist';
  }

  // Thumbs up: all fingers curled but thumb extended
  if (extendedCount === 0 && thumbExt) {
    return 'thumbs_up';
  }

  // Point: only index extended
  if (indexExt && !middleExt && !ringExt && !pinkyExt) {
    return 'point';
  }

  // Victory: index and middle extended, others curled
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    return 'victory';
  }

  // Open palm: all fingers extended
  if (extendedCount >= 3) {
    return 'open_palm';
  }

  // Pinch: thumb and index tips very close, other fingers curled
  const pinchDist = dist(landmarks[THUMB_TIP], landmarks[INDEX_TIP]);
  const palmSize = dist(landmarks[WRIST], landmarks[MIDDLE_MCP]);
  const normalizedPinch = palmSize > 0 ? pinchDist / palmSize : 1;

  if (normalizedPinch < 0.35 && !middleExt && !ringExt && !pinkyExt) {
    return 'pinch';
  }

  return 'none';
}

export function getPalmCenter(landmarks: Landmark[]): { x: number; y: number } {
  const points = [landmarks[0], landmarks[5], landmarks[9], landmarks[13], landmarks[17]];
  const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  return { x, y };
}

export function getPinchDistance(landmarks: Landmark[]): number {
  return dist(landmarks[THUMB_TIP], landmarks[INDEX_TIP]);
}

export function getFingertip(landmarks: Landmark[]): { x: number; y: number } {
  return { x: landmarks[INDEX_TIP].x, y: landmarks[INDEX_TIP].y };
}

// Swipe detection state
let lastPalmX = 0;
let lastPalmTime = 0;
let swipeCooldown = 0;

export function detectSwipe(landmarks: Landmark[], currentGesture: GestureType, now: number): GestureType {
  if (currentGesture !== 'open_palm') {
    lastPalmX = 0;
    lastPalmTime = 0;
    return currentGesture;
  }

  const palmX = landmarks[WRIST].x;

  if (lastPalmX === 0) {
    lastPalmX = palmX;
    lastPalmTime = now;
    return currentGesture;
  }

  const dt = now - lastPalmTime;
  if (dt < 200) return currentGesture;
  if (now < swipeCooldown) return currentGesture;

  const dx = palmX - lastPalmX;

  if (Math.abs(dx) > 0.15) {
    swipeCooldown = now + 800;
    lastPalmX = palmX;
    lastPalmTime = now;
    return dx < 0 ? 'swipe_left' : 'swipe_right';
  }

  lastPalmX = palmX;
  lastPalmTime = now;
  return currentGesture;
}

export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function isFingerCurledPublic(tip: Landmark, pip: Landmark, mcp: Landmark): boolean {
  return isFingerCurled(tip, pip, mcp);
}

export function isFingerExtendedPublic(tip: Landmark, pip: Landmark, mcp: Landmark): boolean {
  return isFingerExtended(tip, pip, mcp);
}
