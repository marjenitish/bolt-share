/*
  # Create news and events management tables

  1. New Tables
    - `news_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `status` (text)
      - `tags` (text[])
      - `is_featured` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `news_articles`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `date` (date)
      - `author` (text)
      - `banner_image_link` (text)
      - `alt_image_link` (text)
      - `published_date` (timestamptz)
      - `is_published` (boolean)
      - `title` (text)
      - `subtitle` (text)
      - `description` (text)
      - `tags` (text[])
      - `is_featured` (boolean)
      - `gallery_images` (text[])
      - `button_link` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create news_categories table
CREATE TABLE IF NOT EXISTS news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  tags text[],
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES news_categories(id),
  date date NOT NULL,
  author text NOT NULL,
  banner_image_link text,
  alt_image_link text,
  published_date timestamptz,
  is_published boolean DEFAULT false,
  title text NOT NULL,
  subtitle text,
  description text NOT NULL,
  tags text[],
  is_featured boolean DEFAULT false,
  gallery_images text[],
  button_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Policies for news_categories
CREATE POLICY "Authenticated users can view news categories"
  ON news_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create news categories"
  ON news_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update news categories"
  ON news_categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for news_articles
CREATE POLICY "Authenticated users can view news articles"
  ON news_articles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create news articles"
  ON news_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update news articles"
  ON news_articles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);