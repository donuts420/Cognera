CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('caregiver', 'health_worker', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE care_relation AS ENUM ('primary_caregiver', 'family', 'asha', 'phc_doctor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE dementia_stage AS ENUM ('unknown', 'at_risk', 'mild', 'moderate', 'severe');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE cognitive_domain AS ENUM ('memory', 'attention', 'processing_speed', 'visuospatial', 'language', 'executive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE reminder_type AS ENUM ('medicine', 'hydration', 'activity', 'appointment');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE occurrence_status AS ENUM ('pending', 'acknowledged', 'snoozed', 'missed', 'skipped');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE alert_kind AS ENUM ('missed_dose', 'missed_appointment', 'low_hydration', 'engagement_drop', 'cognitive_decline', 'assessment_due', 'distress_signal');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE assessment_kind AS ENUM ('baseline', 'monthly', 'adhoc');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE vault_kind AS ENUM ('person', 'place', 'event', 'song', 'object');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE trend_direction AS ENUM ('improving', 'stable', 'declining', 'insufficient_data');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'caregiver',
  preferred_locale TEXT NOT NULL DEFAULT 'en',
  village TEXT,
  block TEXT,
  district TEXT,
  state TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  device_label TEXT DEFAULT 'web',
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  photo_key TEXT,
  birth_year INTEGER,
  sex TEXT,
  preferred_locale TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  village TEXT,
  block TEXT,
  district TEXT,
  state TEXT,
  abha_number TEXT,
  dementia_stage dementia_stage NOT NULL DEFAULT 'unknown',
  diagnosis_notes TEXT,
  exit_pin_hash TEXT,
  onboarded_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_patients_state ON patients(state);
CREATE INDEX IF NOT EXISTS idx_patients_district ON patients(district);
CREATE INDEX IF NOT EXISTS idx_patients_block ON patients(block);

CREATE TABLE IF NOT EXISTS care_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  relationship care_relation NOT NULL,
  can_edit_care_plan BOOLEAN NOT NULL DEFAULT false,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_care_rel_unique ON care_relationships(user_id, patient_id) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  granted_by_user_id UUID REFERENCES users(id),
  guardian_relation TEXT,
  is_guardian_consent BOOLEAN NOT NULL DEFAULT false,
  locale TEXT NOT NULL DEFAULT 'en',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  evidence JSONB
);

CREATE TABLE IF NOT EXISTS patient_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  label TEXT,
  app_version TEXT,
  last_seen_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  UNIQUE(patient_id, device_id)
);

CREATE TABLE IF NOT EXISTS games (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  domains cognitive_domain[] NOT NULL DEFAULT '{}',
  level_count INTEGER NOT NULL DEFAULT 1,
  config JSONB NOT NULL DEFAULT '{}',
  requires_vault BOOLEAN NOT NULL DEFAULT false,
  is_scored BOOLEAN NOT NULL DEFAULT true,
  supports_voice BOOLEAN NOT NULL DEFAULT false,
  icon_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL REFERENCES games(slug),
  device_id TEXT,
  level INTEGER,
  difficulty NUMERIC,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_ms INTEGER,
  trials_total INTEGER DEFAULT 0,
  trials_correct INTEGER DEFAULT 0,
  accuracy NUMERIC,
  median_latency_ms INTEGER,
  max_span INTEGER,
  raw_score NUMERIC,
  performance NUMERIC,
  trials JSONB,
  completed BOOLEAN NOT NULL DEFAULT true,
  abandoned BOOLEAN NOT NULL DEFAULT false,
  ended_by_fatigue BOOLEAN NOT NULL DEFAULT false,
  is_outlier BOOLEAN NOT NULL DEFAULT false,
  played_offline BOOLEAN NOT NULL DEFAULT false,
  client_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_time ON game_sessions(patient_id, client_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_game ON game_sessions(patient_id, game_id, client_created_at DESC);

CREATE TABLE IF NOT EXISTS skill_state (
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL REFERENCES games(slug),
  theta NUMERIC NOT NULL DEFAULT 50,
  uncertainty NUMERIC NOT NULL DEFAULT 1.0,
  current_level INTEGER NOT NULL DEFAULT 1,
  consecutive_above INTEGER NOT NULL DEFAULT 0,
  consecutive_below INTEGER NOT NULL DEFAULT 0,
  sessions_played INTEGER NOT NULL DEFAULT 0,
  baseline_latency_ms INTEGER,
  last_played_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (patient_id, game_id)
);

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  kind assessment_kind NOT NULL DEFAULT 'adhoc',
  instrument_version TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  administered_by UUID REFERENCES users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_score NUMERIC,
  max_score NUMERIC,
  domain_scores JSONB,
  responses JSONB,
  interpretation TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cognitive_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  granularity TEXT NOT NULL DEFAULT 'daily',
  cwi NUMERIC,
  domain_indices JSONB,
  sessions_count INTEGER DEFAULT 0,
  minutes_engaged INTEGER DEFAULT 0,
  adherence_rate NUMERIC,
  trend_slope NUMERIC,
  ci_low NUMERIC,
  ci_high NUMERIC,
  trend_direction trend_direction NOT NULL DEFAULT 'insufficient_data',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(patient_id, snapshot_date, granularity)
);

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type reminder_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  medicine_name TEXT,
  dosage TEXT,
  photo_key TEXT,
  times_of_day TIME[],
  days_of_week SMALLINT[],
  one_off_at TIMESTAMPTZ,
  start_date DATE,
  end_date DATE,
  escalate_after_minutes INTEGER NOT NULL DEFAULT 30,
  max_snoozes INTEGER NOT NULL DEFAULT 3,
  snooze_minutes INTEGER NOT NULL DEFAULT 10,
  voice_prompt_key TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (one_off_at IS NOT NULL OR times_of_day IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS reminder_occurrences (
  id UUID PRIMARY KEY,
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status occurrence_status NOT NULL DEFAULT 'pending',
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by TEXT,
  snooze_count INTEGER NOT NULL DEFAULT 0,
  snoozed_until TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  device_id TEXT,
  synced_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_occurrence_unique ON reminder_occurrences(reminder_id, scheduled_at);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  kind alert_kind NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  title TEXT,
  body TEXT,
  payload JSONB,
  dedupe_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  resolved_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_dedupe ON alerts(patient_id, dedupe_key) WHERE dedupe_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  kind vault_kind NOT NULL,
  display_name TEXT NOT NULL,
  relationship TEXT,
  photo_key TEXT,
  audio_key TEXT,
  story_text TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  year_taken INTEGER,
  use_in_games BOOLEAN NOT NULL DEFAULT false,
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_batch_id TEXT NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  device_id TEXT,
  item_count INTEGER NOT NULL DEFAULT 0,
  applied_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sync_batch_unique ON sync_batches(client_batch_id, patient_id);

CREATE TABLE IF NOT EXISTS audit_log (
  bigserial_id BIGSERIAL PRIMARY KEY,
  actor_user_id UUID REFERENCES users(id),
  patient_id UUID,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_patient ON audit_log(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_user_id, created_at DESC);

-- ── Player experience: liked games + the daily visual tracker ──
CREATE TABLE IF NOT EXISTS game_favorites (
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  game_id    TEXT NOT NULL REFERENCES games(slug),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (patient_id, game_id)
);

-- One row per (patient, day, tracked item). item_key is 'hydration' | 'walk' |
-- 'meal' | 'med:<reminderId>'. value is a running tally the patient taps up;
-- target is the goal for that day (glasses of water, etc.).
CREATE TABLE IF NOT EXISTS patient_daily_log (
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  log_date   DATE NOT NULL,
  item_key   TEXT NOT NULL,
  value      INTEGER NOT NULL DEFAULT 0,
  target     INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (patient_id, log_date, item_key)
);
CREATE INDEX IF NOT EXISTS idx_daily_log_patient_date ON patient_daily_log(patient_id, log_date DESC);
