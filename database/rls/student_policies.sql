-- Row Level Security per role
CREATE POLICY "Students can view their own data"
ON users
FOR SELECT
USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');
