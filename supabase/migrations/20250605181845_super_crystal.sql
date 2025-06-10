CREATE TABLE IF NOT EXISTS class_rolls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  generated_at timestamptz DEFAULT now(),
  downloaded_at timestamptz,
  format text NOT NULL CHECK (format IN ('pdf', 'csv')),
  file_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE class_rolls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage class rolls"
  ON class_rolls
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));