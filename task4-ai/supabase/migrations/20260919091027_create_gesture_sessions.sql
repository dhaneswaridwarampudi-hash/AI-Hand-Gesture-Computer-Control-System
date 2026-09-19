/*
# Create gesture_sessions table for hand gesture control system

## Purpose
Stores session data for the AI Hand Gesture Computer Control System — each
time a user starts and stops the gesture control system, a session record is
created with stats about which gestures were used and how long the session lasted.

## New Tables
- `gesture_sessions`
  - `id` (uuid, primary key)
  - `started_at` (timestamptz, when the session began)
  - `ended_at` (timestamptz, when the session ended, nullable for in-progress sessions)
  - `duration_seconds` (integer, total session duration)
  - `gestures_detected` (integer, total number of gestures recognized)
  - `gesture_breakdown` (jsonb, per-gesture-type counts, e.g. {"click": 5, "scroll": 3})
  - `created_at` (timestamptz, record creation timestamp)

## Security
- Enable RLS on `gesture_sessions`.
- This is a single-tenant app with no sign-in screen, so all CRUD is allowed
  for both anon and authenticated roles (the data is intentionally public/shared).
*/

CREATE TABLE IF NOT EXISTS gesture_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer DEFAULT 0,
  gestures_detected integer DEFAULT 0,
  gesture_breakdown jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gesture_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sessions" ON gesture_sessions;
CREATE POLICY "anon_select_sessions" ON gesture_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON gesture_sessions;
CREATE POLICY "anon_insert_sessions" ON gesture_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON gesture_sessions;
CREATE POLICY "anon_update_sessions" ON gesture_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON gesture_sessions;
CREATE POLICY "anon_delete_sessions" ON gesture_sessions FOR DELETE
  TO anon, authenticated USING (true);
