/*
  # Link customers table to users table

  1. Changes
    - Add `user_id` column to `customers` table
    - Add foreign key constraint to `users(id)`
    - Make `user_id` nullable
    - Add index for faster lookups
*/

ALTER TABLE customers
ADD COLUMN user_id uuid REFERENCES users(id);

-- Add an index for faster lookups on user_id
CREATE INDEX IF NOT EXISTS customers_user_id_idx ON customers (user_id);