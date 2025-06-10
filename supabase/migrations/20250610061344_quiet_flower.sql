/*
  # Add cancellation fields to bookings table and customer credit

  1. Changes
    - Add cancellation_reason column to bookings table
    - Add medical_certificate_url column to bookings table
    - Add cancellation_status column to bookings table with check constraint
    - Add cancellation_reject_reason column to bookings table
    - Add customer_credit column to customers table with default value of 0
*/

-- Add cancellation fields to bookings table
ALTER TABLE bookings
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN medical_certificate_url TEXT,
ADD COLUMN cancellation_status TEXT CHECK (cancellation_status IN ('pending', 'accepted', 'rejected')),
ADD COLUMN cancellation_reject_reason TEXT;

-- Add customer credit to customers table
ALTER TABLE customers
ADD COLUMN customer_credit INTEGER DEFAULT 0;