// supabase/migrations/20250606144222_add_class_attendance.sql
CREATE TABLE IF NOT EXISTS class_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  attended boolean NOT NULL DEFAULT false,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE class_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage attendance for their classes"
  ON class_attendance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN instructors i ON c.instructor_id = i.id
      WHERE c.id = class_attendance.class_id
      AND i.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN instructors i ON c.instructor_id = i.id
      WHERE c.id = class_attendance.class_id
      AND i.user_id = auth.uid()
    )
  );


-- supabase/migrations/20250607144222_add_class_rolls.sql
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

