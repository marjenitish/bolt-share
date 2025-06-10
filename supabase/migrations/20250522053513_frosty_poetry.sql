/*
  # Add enrollment tables and related schemas

  1. New Tables
    - `enrollments`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `class_id` (uuid, foreign key)
      - `enrollment_type` (text) - 'trial' or 'direct'
      - `status` (text) - 'pending', 'active', 'completed', 'cancelled'
      - `payment_status` (text) - 'pending', 'paid', 'refunded'
      - `payment_intent` (text) - Stripe payment intent ID
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `questionnaires`
      - `id` (uuid, primary key)
      - `enrollment_id` (uuid, foreign key)
      - `paq_completed` (boolean)
      - `paq_file_url` (text)
      - `survey_completed` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  enrollment_type text NOT NULL CHECK (enrollment_type IN ('trial', 'direct')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_intent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questionnaires table
CREATE TABLE IF NOT EXISTS questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES enrollments(id) ON DELETE CASCADE,
  paq_completed boolean DEFAULT false,
  paq_file_url text,
  survey_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

-- Policies for enrollments
CREATE POLICY "Users can view their own enrollments"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM customers WHERE id = customer_id
  ));

CREATE POLICY "Users can create enrollments"
  ON enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own enrollments"
  ON enrollments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM customers WHERE id = customer_id
  ));

-- Policies for questionnaires
CREATE POLICY "Users can view their own questionnaires"
  ON questionnaires
  FOR SELECT
  TO authenticated
  USING (enrollment_id IN (
    SELECT id FROM enrollments WHERE customer_id IN (
      SELECT id FROM customers WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can create questionnaires"
  ON questionnaires
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own questionnaires"
  ON questionnaires
  FOR UPDATE
  TO authenticated
  USING (enrollment_id IN (
    SELECT id FROM enrollments WHERE customer_id IN (
      SELECT id FROM customers WHERE id = auth.uid()
    )
  ));