-- Counselor policies
CREATE POLICY "Counselors can view assigned student data"
ON users
FOR SELECT
USING (auth.jwt() ->> 'role' = 'counselor');
