-- Create a table to store API error logs
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  path TEXT NOT NULL,
  details JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Comments
COMMENT ON TABLE error_logs IS 'Detailed logs of API errors for monitoring and debugging';
COMMENT ON COLUMN error_logs.id IS 'Unique identifier for the error log';
COMMENT ON COLUMN error_logs.request_id IS 'Unique identifier for the request that generated the error';
COMMENT ON COLUMN error_logs.error_type IS 'Category of error (auth, validation, etc.)';
COMMENT ON COLUMN error_logs.message IS 'Human-readable error message';
COMMENT ON COLUMN error_logs.path IS 'API path where the error occurred';
COMMENT ON COLUMN error_logs.details IS 'Additional error details in JSON format';
COMMENT ON COLUMN error_logs.user_id IS 'ID of the user who experienced the error, if authenticated';
COMMENT ON COLUMN error_logs.created_at IS 'Timestamp when the error occurred';
COMMENT ON COLUMN error_logs.ip_address IS 'IP address that made the request';
COMMENT ON COLUMN error_logs.user_agent IS 'Browser/client user agent';

-- Indices for faster querying
CREATE INDEX IF NOT EXISTS error_logs_request_id_idx ON error_logs (request_id);
CREATE INDEX IF NOT EXISTS error_logs_error_type_idx ON error_logs (error_type);
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON error_logs (user_id);
CREATE INDEX IF NOT EXISTS error_logs_path_idx ON error_logs (path);

-- Enable Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Only system administrators can view error logs
CREATE POLICY error_logs_select_policy
  ON error_logs
  FOR SELECT
  USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'system_admin');

-- Allow insertion from server-side functions
CREATE POLICY error_logs_insert_policy
  ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- Give service role access to error_logs
GRANT ALL ON error_logs TO service_role; 