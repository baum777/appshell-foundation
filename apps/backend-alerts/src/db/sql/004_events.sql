CREATE TABLE IF NOT EXISTS alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES alerts(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  type text NOT NULL,
  stage int NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_user_created ON alert_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_alert_created ON alert_events(alert_id, created_at DESC);

