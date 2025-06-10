/*
  # Create classes table

  1. New Tables
    - `classes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text)
      - `exercise_type` (text)
      - `venue` (text)
      - `address` (text)
      - `date` (date)
      - `time` (time)
      - `instructor_id` (uuid, foreign key)
      - `fee_criteria` (text)
      - `term` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `classes` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  exercise_type text NOT NULL,
  venue text NOT NULL,
  address text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  instructor_id uuid NOT NULL REFERENCES instructors(id),
  fee_criteria text NOT NULL,
  term text NOT NULL CHECK (term IN ('Term1', 'Term2', 'Term3', 'Term4')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all classes
CREATE POLICY "Anyone can view classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create classes
CREATE POLICY "Authenticated users can create classes"
  ON classes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update classes
CREATE POLICY "Authenticated users can update classes"
  ON classes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);