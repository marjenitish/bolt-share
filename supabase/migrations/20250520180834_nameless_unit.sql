/*
  # Add fee amount to classes table

  1. Changes
    - Add fee_amount column to classes table
    - Set default value to 0
    - Make it NOT NULL to ensure all classes have a fee amount
*/

ALTER TABLE classes 
ADD COLUMN fee_amount decimal(10,2) NOT NULL DEFAULT 0.00;