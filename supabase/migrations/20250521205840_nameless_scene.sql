/*
  # Add free trial functionality to bookings

  1. Changes
    - Add is_free_trial column to bookings table
    - Set default value to false
    - Make it NOT NULL to ensure all bookings have this field set
*/

ALTER TABLE bookings 
ADD COLUMN is_free_trial boolean NOT NULL DEFAULT false;