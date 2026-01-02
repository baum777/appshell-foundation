CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  channel_inapp boolean NOT NULL DEFAULT true,
  channel_push boolean NOT NULL DEFAULT false,
  cooldown_seconds int NOT NULL DEFAULT 3600,
  stage_max int NOT NULL DEFAULT 3,
  rules jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alert_runs (
  alert_id uuid PRIMARY KEY REFERENCES alerts(id) ON DELETE CASCADE,
  stage int NOT NULL DEFAULT 0,
  last_fired_at timestamptz,
  cooldown_until timestamptz,
  last_eval_at timestamptz,
  last_snapshot jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_enabled ON alerts(user_id, enabled);

