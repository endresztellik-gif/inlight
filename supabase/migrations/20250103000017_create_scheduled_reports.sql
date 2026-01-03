-- Create scheduled_reports table for automated email reports
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('rentals', 'clients', 'products', 'revenue', 'profit', 'comparison')),
  recurrence VARCHAR(20) NOT NULL CHECK (recurrence IN ('daily', 'weekly', 'monthly')),
  recipients TEXT[] NOT NULL, -- Array of email addresses
  filters JSONB DEFAULT '{}', -- Report filters as JSON
  is_active BOOLEAN DEFAULT true,
  next_run TIMESTAMPTZ NOT NULL,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_scheduled_reports_next_run ON scheduled_reports(next_run) WHERE is_active = true;
CREATE INDEX idx_scheduled_reports_created_by ON scheduled_reports(created_by);

-- Enable RLS
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admin and super_admin can view all scheduled reports
CREATE POLICY "view_scheduled_reports" ON scheduled_reports
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role IN ('admin', 'super_admin')
    )
  );

-- Admin and super_admin can create scheduled reports
CREATE POLICY "create_scheduled_reports" ON scheduled_reports
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role IN ('admin', 'super_admin')
    )
  );

-- Admin and super_admin can update their own or all (super_admin) scheduled reports
CREATE POLICY "update_scheduled_reports" ON scheduled_reports
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'super_admin'
    )
    OR (
      auth.uid() IN (
        SELECT user_id FROM user_profiles WHERE role = 'admin'
      )
      AND created_by = auth.uid()
    )
  );

-- Admin and super_admin can delete their own or all (super_admin) scheduled reports
CREATE POLICY "delete_scheduled_reports" ON scheduled_reports
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'super_admin'
    )
    OR (
      auth.uid() IN (
        SELECT user_id FROM user_profiles WHERE role = 'admin'
      )
      AND created_by = auth.uid()
    )
  );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_scheduled_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_scheduled_reports_updated_at
  BEFORE UPDATE ON scheduled_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_reports_updated_at();

-- Function to update next_run after execution
CREATE OR REPLACE FUNCTION update_next_run(schedule_id UUID)
RETURNS VOID AS $$
DECLARE
  current_recurrence VARCHAR(20);
  current_next_run TIMESTAMPTZ;
BEGIN
  SELECT recurrence, next_run INTO current_recurrence, current_next_run
  FROM scheduled_reports
  WHERE id = schedule_id;

  UPDATE scheduled_reports
  SET
    last_run = current_next_run,
    next_run = CASE
      WHEN current_recurrence = 'daily' THEN current_next_run + INTERVAL '1 day'
      WHEN current_recurrence = 'weekly' THEN current_next_run + INTERVAL '7 days'
      WHEN current_recurrence = 'monthly' THEN current_next_run + INTERVAL '1 month'
    END
  WHERE id = schedule_id;
END;
$$ LANGUAGE plpgsql;
