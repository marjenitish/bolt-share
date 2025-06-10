/*
  # Add zip code to classes table

  1. Changes
    - Add zip_code column to classes table
    - Make it optional to maintain compatibility with existing data
*/

ALTER TABLE classes 
ADD COLUMN zip_code text;