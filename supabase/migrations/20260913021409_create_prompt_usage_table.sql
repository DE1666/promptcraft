/*
# Create prompt_usage table for daily generation limits

1. New Tables
- `prompt_usage`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user, references auth.users)
  - `date` (date, not null, defaults to current date)
  - `count` (integer, not null, defaults to 0)
  - `plan` (text, not null, defaults to 'free')
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
2. Security
- Enable RLS on `prompt_usage`.
- Owner-scoped CRUD: each authenticated user can only access their own usage rows.
- Unique constraint on (user_id, date) to prevent duplicate daily records.
3. Notes
- This table tracks how many prompts a user has generated per day.
- Free plan users are limited to 5 generations per day.
- Pro/Enterprise users have unlimited generations (enforced in app logic).
*/

CREATE TABLE IF NOT EXISTS prompt_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  count integer NOT NULL DEFAULT 0,
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE prompt_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_usage" ON prompt_usage;
CREATE POLICY "select_own_usage" ON prompt_usage FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_usage" ON prompt_usage;
CREATE POLICY "insert_own_usage" ON prompt_usage FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_usage" ON prompt_usage;
CREATE POLICY "update_own_usage" ON prompt_usage FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_usage" ON prompt_usage;
CREATE POLICY "delete_own_usage" ON prompt_usage FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
