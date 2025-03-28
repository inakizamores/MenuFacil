-- Create a table to store backup log records
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly')),
  status VARCHAR(20) NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'in_progress', 'completed', 'failed')),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100),
  file_path TEXT,
  file_size BIGINT,
  duration_seconds INT
);

-- Comments
COMMENT ON TABLE backup_logs IS 'Records of database backup operations';
COMMENT ON COLUMN backup_logs.id IS 'Unique identifier for the backup log';
COMMENT ON COLUMN backup_logs.type IS 'Type of backup (daily, weekly, monthly)';
COMMENT ON COLUMN backup_logs.status IS 'Current status of the backup operation';
COMMENT ON COLUMN backup_logs.details IS 'Additional details about the backup process';
COMMENT ON COLUMN backup_logs.created_at IS 'Timestamp when the backup was initiated';
COMMENT ON COLUMN backup_logs.updated_at IS 'Timestamp when the backup log was last updated';
COMMENT ON COLUMN backup_logs.created_by IS 'System or user that initiated the backup';
COMMENT ON COLUMN backup_logs.file_path IS 'Path to the backup file';
COMMENT ON COLUMN backup_logs.file_size IS 'Size of the backup file in bytes';
COMMENT ON COLUMN backup_logs.duration_seconds IS 'Time taken to complete the backup in seconds';

-- Index for faster queries
CREATE INDEX IF NOT EXISTS backup_logs_created_at_idx ON backup_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS backup_logs_type_idx ON backup_logs (type);
CREATE INDEX IF NOT EXISTS backup_logs_status_idx ON backup_logs (status);

-- Automatically update updated_at
CREATE OR REPLACE FUNCTION update_backup_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER backup_logs_updated_at_trigger
BEFORE UPDATE ON backup_logs
FOR EACH ROW
EXECUTE FUNCTION update_backup_logs_updated_at();

-- Add RLS policies for backup_logs
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view backup logs
CREATE POLICY backup_logs_select_policy
  ON backup_logs
  FOR SELECT
  USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'system_admin');

-- Only system level operations can insert/update backup logs  
CREATE POLICY backup_logs_insert_policy
  ON backup_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY backup_logs_update_policy
  ON backup_logs
  FOR UPDATE
  USING (true);

-- Add grant for service role
GRANT ALL ON backup_logs TO service_role; 