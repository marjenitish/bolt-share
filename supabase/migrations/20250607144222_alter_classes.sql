-- Remove existing date and time columns
ALTER TABLE classes DROP COLUMN date;
ALTER TABLE classes DROP COLUMN time;

-- Add new columns for recurring schedule
ALTER TABLE classes ADD COLUMN day_of_week INTEGER NOT NULL; -- e.g., 1=Monday, 7=Sunday
ALTER TABLE classes ADD COLUMN start_time TIME NOT NULL;
ALTER TABLE classes ADD COLUMN end_time TIME;
ALTER TABLE classes ADD COLUMN is_recurring BOOLEAN DEFAULT TRUE;


ALTER TABLE bookings ADD COLUMN booking_date DATE NOT NULL;


ALTER TABLE bookings
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN medical_certificate_url TEXT,
ADD COLUMN cancellation_status TEXT DEFAULT 'pending' CHECK (cancellation_status IN ('pending', 'accepted', 'rejected'));

ALTER TABLE customers
ADD COLUMN customer_credit INTEGER DEFAULT 0;
