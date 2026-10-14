CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  age INTEGER,
  gender TEXT,
  height_cm NUMERIC,
  experience_level TEXT,
  goal TEXT,
  weight_unit TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS body_logs (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  weight_kg NUMERIC
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  equipment TEXT,
  external_id TEXT,
  source TEXT,
  body_part TEXT,
  target TEXT,
  image_url TEXT,
  gif_url TEXT,
  instructions_es TEXT,
  instructions_en TEXT,
  secondary_muscles TEXT
);

CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS routine_days (
  id TEXT PRIMARY KEY,
  routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  name TEXT,
  sort_order INTEGER
);

CREATE TABLE IF NOT EXISTS routine_exercises (
  id TEXT PRIMARY KEY,
  day_id TEXT NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
  exercise_id TEXT REFERENCES exercises(id) ON DELETE SET NULL,
  sets INTEGER,
  rep_min INTEGER,
  rep_max INTEGER,
  rest_seconds INTEGER,
  notes TEXT,
  sort_order INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  day_id TEXT REFERENCES routine_days(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS session_entries (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  routine_exercise_id TEXT,
  exercise_id TEXT
);

CREATE TABLE IF NOT EXISTS session_sets (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES session_entries(id) ON DELETE CASCADE,
  set_number INTEGER,
  reps NUMERIC,
  weight_kg NUMERIC,
  rpe NUMERIC,
  rir NUMERIC,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ
);
