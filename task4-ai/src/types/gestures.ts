export type GestureType =
  | 'fist'
  | 'open_palm'
  | 'point'
  | 'pinch'
  | 'victory'
  | 'thumbs_up'
  | 'swipe_left'
  | 'swipe_right'
  | 'none';

export interface GestureLabel {
  type: GestureType;
  label: string;
  icon: string;
  description: string;
  action: string;
}

export const GESTURE_MAP: Record<GestureType, GestureLabel> = {
  fist: {
    type: 'fist',
    label: 'Fist',
    icon: '✊',
    description: 'Close all fingers into a fist',
    action: 'Click / Select',
  },
  open_palm: {
    type: 'open_palm',
    label: 'Open Palm',
    icon: '🖐️',
    description: 'Spread all fingers wide open',
    action: 'Release / Stop',
  },
  point: {
    type: 'point',
    label: 'Point',
    icon: '☝️',
    description: 'Extend only the index finger',
    action: 'Move Cursor',
  },
  pinch: {
    type: 'pinch',
    label: 'Pinch',
    icon: '🤏',
    description: 'Touch thumb and index fingertips',
    action: 'Drag & Drop',
  },
  victory: {
    type: 'victory',
    label: 'Victory',
    icon: '✌️',
    description: 'Index and middle finger up in V shape',
    action: 'Scroll Up',
  },
  thumbs_up: {
    type: 'thumbs_up',
    label: 'Thumbs Up',
    icon: '👍',
    description: 'Closed fist with thumb extended up',
    action: 'Volume Up',
  },
  swipe_left: {
    type: 'swipe_left',
    label: 'Swipe Left',
    icon: '👈',
    description: 'Move open hand quickly to the left',
    action: 'Previous Track',
  },
  swipe_right: {
    type: 'swipe_right',
    label: 'Swipe Right',
    icon: '👉',
    description: 'Move open hand quickly to the right',
    action: 'Next Track',
  },
  none: {
    type: 'none',
    label: 'No Gesture',
    icon: '⬚',
    description: 'No hand or gesture detected',
    action: 'Idle',
  },
};

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface HandData {
  landmarks: Landmark[];
  handedness: 'Left' | 'Right';
  gesture: GestureType;
  pinchDistance: number;
  palmCenter: { x: number; y: number };
  fingertip: { x: number; y: number };
}

export interface TrackingState {
  hands: HandData[];
  fps: number;
  isTracking: boolean;
}
