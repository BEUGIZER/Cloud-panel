CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown' CHECK (status IN ('up', 'degraded', 'down', 'unknown')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO services (name, status)
SELECT 'example-api', 'up'
WHERE NOT EXISTS (SELECT 1 FROM services);
