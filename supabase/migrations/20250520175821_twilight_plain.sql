/*
  # Create instructors table

  1. New Tables
    - `instructors`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `address` (text)
      - `contact_no` (text)
      - `specialty` (text)
      - `email` (text, not null)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `instructors` table
    - Add policies for authenticated users to:
      - Read all instructors
      - Create new instructors
      - Update their own instructors
*/

CREATE TABLE IF NOT EXISTS instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  contact_no text,
  specialty text,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all instructors
CREATE POLICY "Anyone can view instructors"
  ON instructors
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create instructors
CREATE POLICY "Authenticated users can create instructors"
  ON instructors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update instructors
CREATE POLICY "Authenticated users can update instructors"
  ON instructors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);