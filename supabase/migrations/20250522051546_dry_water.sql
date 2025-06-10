/*
  # Add description and image link fields to instructors table

  1. Changes
    - Add description column to instructors table
    - Add image_link column to instructors table
    - Make both fields optional to maintain compatibility with existing data
*/

ALTER TABLE instructors 
ADD COLUMN description text,
ADD COLUMN image_link text;