CREATE TABLE IF NOT EXISTS staff_roles ( id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE, description text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now() );

ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view staff roles"
ON staff_roles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin users can manage staff roles"
ON staff_roles
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can manage permissions"
  ON permissions
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
('class_create', 'Ability to create new classes'),
('class_read', 'Ability to view classes'),
('class_update', 'Ability to update classes'),
('class_delete', 'Ability to delete classes'),
('instructor_create', 'Ability to create new instructors'),
('instructor_read', 'Ability to view instructors'),
('instructor_update', 'Ability to update instructors'),
('instructor_delete', 'Ability to delete instructors'),
('customer_create', 'Ability to create new customers'),
('customer_read', 'Ability to view customers'),
('customer_update', 'Ability to update customers'),
('customer_delete', 'Ability to delete customers'),
('booking_create', 'Ability to create new bookings'),
('booking_read', 'Ability to view bookings'),
('booking_update', 'Ability to update bookings'),
('booking_delete', 'Ability to delete bookings'),
('news_create', 'Ability to create news articles'),
('news_read', 'Ability to view news articles'),
('news_update', 'Ability to update news articles'),
('news_delete', 'Ability to delete news articles'),
('cms_manage', 'Ability to manage CMS content'),
('reports_view', 'Ability to view reports'),
('vendor_manage', 'Ability to manage vendors'),
('roles_manage', 'Ability to manage staff roles and permissions');


INSERT INTO permissions (name, description) VALUES
('exercise_type_create', 'Ability to create new exercise types'),
('exercise_type_read', 'Ability to view exercise types'),
('exercise_type_update', 'Ability to update exercise types'),
('exercise_type_delete', 'Ability to delete exercise types'),
('paq_reviews', 'Ability to manage PAQs'),
('manage_enrollments', 'Ability to manage Enrollments'),
('create_enrollments', 'Ability to create Enrollments'),
('class_calendar', 'Ability to view class calendar'),
('customer_cancellation_request', 'Ability to manage customer class canacellation requests'),
('instructor_cancellation_request', 'Ability to manage instructor class canacellation requests'),
('manage_terminations', 'Ability to manage terminations');

CREATE TABLE IF NOT EXISTS staff_role_permissions ( role_id uuid REFERENCES staff_roles(id) ON DELETE CASCADE, permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE, PRIMARY KEY (role_id, permission_id), created_at timestamptz DEFAULT now() );

ALTER TABLE staff_role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view staff role permissions"
ON staff_role_permissions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin users can manage staff role permissions"
ON staff_role_permissions
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE users
ADD COLUMN staff_role_id uuid REFERENCES staff_roles(id) ON DELETE SET NULL;

-- Update RLS policy for users table to allow admins to update staff_role_id
DROP POLICY "Users can update their own profile" ON users;

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin users can update any user profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE instructors
ADD COLUMN user_id uuid REFERENCES users(id);

-- Add an index for faster lookups on user_id
CREATE INDEX IF NOT EXISTS instructors_user_id_idx ON instructors (user_id);
