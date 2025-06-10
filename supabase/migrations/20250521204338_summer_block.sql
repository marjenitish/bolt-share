/*
  # Create exercise types table and update classes

  1. New Tables
    - `exercise_types`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `what_to_bring` (text[])
      - `duration` (interval)
      - `cost` (decimal)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Modify classes table to use exercise_type_id as foreign key
    - Add foreign key constraint

  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create exercise_types table
CREATE TABLE IF NOT EXISTS exercise_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  what_to_bring text[],
  duration interval NOT NULL,
  cost decimal(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exercise_types ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can view exercise types"
  ON exercise_types
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create exercise types"
  ON exercise_types
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update exercise types"
  ON exercise_types
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add exercise_type_id to classes
ALTER TABLE classes
ADD COLUMN exercise_type_id uuid REFERENCES exercise_types(id);

-- Migrate existing data
DO $$
BEGIN
  -- For each unique exercise_type in classes
  FOR exercise IN 
    SELECT DISTINCT exercise_type 
    FROM classes 
    WHERE exercise_type IS NOT NULL
  LOOP
    -- Create new exercise type
    INSERT INTO exercise_types (name, duration)
    VALUES (exercise.exercise_type, '1 hour'::interval)
    RETURNING id INTO exercise_type_id;
    
    -- Update classes to use new exercise_type_id
    UPDATE classes 
    SET exercise_type_id = exercise_type_id
    WHERE exercise_type = exercise.exercise_type;
  END LOOP;
END $$;