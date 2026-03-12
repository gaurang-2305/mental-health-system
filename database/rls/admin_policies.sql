-- Admin policies
CREATE POLICY "Admins can view all data"
ON users
FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');
