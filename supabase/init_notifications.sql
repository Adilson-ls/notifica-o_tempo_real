-- Migration: Create notifications table and example RLS policies

-- Create table to persist notifications per user
CREATE TABLE IF NOT EXISTS public.notifications (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Example policy: allow users to see their own notifications
CREATE POLICY "Users can select their notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Example policy: allow users to insert notifications for themselves (optional)
CREATE POLICY "Users can insert their notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin role (service role) can bypass RLS naturally via service key

-- Notes:
-- 1) Apply this migration via Supabase SQL editor or psql connected to your DB.
-- 2) After creating this table, consider creating indexes for queries:
--    CREATE INDEX ON public.notifications (user_id, created_at DESC);
