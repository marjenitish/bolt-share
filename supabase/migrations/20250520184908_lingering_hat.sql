/*
  # Add payments functionality

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key)
      - `amount` (decimal)
      - `payment_method` (text)
      - `payment_status` (text)
      - `transaction_id` (text)
      - `receipt_number` (text)
      - `payment_date` (timestamptz)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payments` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('stripe', 'cash', 'cheque', 'card')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id text,
  receipt_number text UNIQUE NOT NULL,
  payment_date timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS text AS $$
DECLARE
  receipt_no text;
  counter int;
BEGIN
  counter := 1;
  LOOP
    receipt_no := 'REC-' || LPAD(counter::text, 6, '0');
    IF NOT EXISTS (SELECT 1 FROM payments WHERE receipt_number = receipt_no) THEN
      RETURN receipt_no;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;