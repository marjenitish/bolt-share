/*
  # Create customers table

  1. New Tables
    - `customers`
      - Basic Information
        - `id` (uuid, primary key)
        - `surname` (text)
        - `first_name` (text)
        - `street_number` (text)
        - `street_name` (text)
        - `suburb` (text)
        - `post_code` (text)
        - `contact_no` (text)
        - `email` (text)
        - `country_of_birth` (text)
        - `date_of_birth` (date)
        - `work_mobile` (text)
        - `paq_form` (boolean)
        - `australian_citizen` (boolean)
        - `language_other_than_english` (text)
        - `english_proficiency` (text)
        - `indigenous_status` (text)
        - `reason_for_class` (text)
        - `how_did_you_hear` (text)
        - `occupation` (text)
      - Next of Kin
        - `next_of_kin_name` (text)
        - `next_of_kin_relationship` (text)
        - `next_of_kin_mobile` (text)
        - `next_of_kin_phone` (text)
      - Equipment and Status
        - `equipment_purchased` (text[])
        - `status` (text)
      - Metadata
        - `created_at` (timestamptz)
        - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `customers` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Basic Information
  surname text NOT NULL,
  first_name text NOT NULL,
  street_number text,
  street_name text,
  suburb text,
  post_code text,
  contact_no text,
  email text,
  country_of_birth text,
  date_of_birth date,
  work_mobile text,
  paq_form boolean DEFAULT false,
  australian_citizen boolean,
  language_other_than_english text,
  english_proficiency text CHECK (english_proficiency IN ('Very Well', 'Well', 'Not Well', 'Not at All')),
  indigenous_status text CHECK (indigenous_status IN ('Yes', 'No', 'Prefer not to say')),
  reason_for_class text,
  how_did_you_hear text,
  occupation text,
  -- Next of Kin
  next_of_kin_name text,
  next_of_kin_relationship text,
  next_of_kin_mobile text,
  next_of_kin_phone text,
  -- Equipment and Status
  equipment_purchased text[],
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);