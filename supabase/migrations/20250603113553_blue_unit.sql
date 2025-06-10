/*
  # Create homepage CMS tables

  1. New Tables
    - `homepage_sections`
      - `id` (uuid, primary key)
      - `section_id` (text) - unique identifier for each section
      - `title` (text)
      - `subtitle` (text)
      - `content` (text)
      - `image_url` (text)
      - `button_text` (text)
      - `button_link` (text)
      - `order` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `homepage_features`
      - `id` (uuid, primary key)
      - `icon` (text)
      - `title` (text)
      - `description` (text)
      - `order` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `homepage_exercises`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text[])
      - `image` (text)
      - `duration` (text)
      - `order` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create homepage_sections table
CREATE TABLE IF NOT EXISTS homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id text UNIQUE NOT NULL,
  title text,
  subtitle text,
  content text,
  image_url text,
  button_text text,
  button_link text,
  "order" integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE homepage_sections
ADD COLUMN stats jsonb;

-- Create homepage_features table
CREATE TABLE IF NOT EXISTS homepage_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create homepage_exercises table
CREATE TABLE IF NOT EXISTS homepage_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text[] NOT NULL,
  image text NOT NULL,
  duration text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_exercises ENABLE ROW LEVEL SECURITY;

-- Create policies for homepage_sections
CREATE POLICY "Public users can view active homepage sections"
  ON homepage_sections
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage homepage sections"
  ON homepage_sections
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policies for homepage_features
CREATE POLICY "Public users can view active homepage features"
  ON homepage_features
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage homepage features"
  ON homepage_features
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policies for homepage_exercises
CREATE POLICY "Public users can view active homepage exercises"
  ON homepage_exercises
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage homepage exercises"
  ON homepage_exercises
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default sections
INSERT INTO homepage_sections (section_id, title, subtitle, content, is_active)
VALUES 
  ('hero', 'Exercise Classes for Active Living', 'Join our community of active adults aged 50+ and discover classes designed to keep you healthy, social, and engaged.', NULL, true),
  ('health-safety', 'Health & Safety Assured', 'Your health and safety is important to us. All programs, events and services follow best-practice health and safety procedures in accordance with the NSW government.', NULL, true),
  ('footer', 'Ready to Start Your Journey?', 'Join our community today and discover the benefits of active living with SHARE.', NULL, true);