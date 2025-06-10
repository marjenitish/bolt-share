/*
  # Add image_link to exercise_types table

  1. Changes
    - Add image_link column to exercise_types table
    - Make it optional to allow for default images
*/

ALTER TABLE exercise_types 
ADD COLUMN image_link text;