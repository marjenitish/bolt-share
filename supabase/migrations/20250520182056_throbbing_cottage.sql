/*
  # Create bookings table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key to customers)
      - `class_id` (uuid, foreign key to classes)
      - `term` (text)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `bookings` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES enrollments(id),
  class_id uuid NOT NULL REFERENCES classes(id),
  term text NOT NULL CHECK (term IN ('Term1', 'Term2', 'Term3', 'Term4')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(enrollment_id, class_id, term)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all bookings
CREATE POLICY "Anyone can view bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create bookings
CREATE POLICY "Authenticated users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update bookings
CREATE POLICY "Authenticated users can update bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete bookings
CREATE POLICY "Authenticated users can delete bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);