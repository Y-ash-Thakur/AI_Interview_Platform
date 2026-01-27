-- =====================================================
-- AI Interview Platform - Supabase Database Setup
-- =====================================================
-- Run this SQL script in your Supabase SQL Editor
-- to set up all necessary tables and security policies
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Interviews Table
-- Stores all interview sessions and their results
CREATE TABLE IF NOT EXISTS interviews (
    -- Primary key
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Foreign key to auth.users (Supabase built-in)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Interview Configuration
    role VARCHAR(255) NOT NULL,
    interview_type VARCHAR(100) NOT NULL CHECK (interview_type IN ('technical', 'behavioral', 'mixed')),
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    current_role VARCHAR(255),
    num_questions INTEGER NOT NULL CHECK (num_questions > 0 AND num_questions <= 20),
    
    -- Interview Data (stored as JSONB for flexibility)
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Results
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    feedback TEXT,
    strengths TEXT[],
    improvements TEXT[],
    
    -- Metadata
    duration_seconds INTEGER CHECK (duration_seconds >= 0),
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    vapi_call_id VARCHAR(255)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Index for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_interviews_user_id 
    ON interviews(user_id);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_interviews_created_at 
    ON interviews(created_at DESC);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_interviews_status 
    ON interviews(status);

-- Composite index for user + date queries
CREATE INDEX IF NOT EXISTS idx_interviews_user_date 
    ON interviews(user_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on interviews table
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own interviews
CREATE POLICY "Users can view own interviews"
    ON interviews
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own interviews
CREATE POLICY "Users can insert own interviews"
    ON interviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own interviews
CREATE POLICY "Users can update own interviews"
    ON interviews
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own interviews
CREATE POLICY "Users can delete own interviews"
    ON interviews
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPFUL VIEWS (Optional)
-- =====================================================

-- View for user statistics
CREATE OR REPLACE VIEW user_interview_stats AS
SELECT 
    user_id,
    COUNT(*) as total_interviews,
    AVG(overall_score) as average_score,
    SUM(duration_seconds) as total_practice_time,
    MAX(created_at) as last_interview_date,
    COUNT(CASE WHEN overall_score >= 80 THEN 1 END) as high_score_count,
    COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard_interviews
FROM interviews
WHERE status = 'completed'
GROUP BY user_id;

-- =====================================================
-- SAMPLE QUERIES (for testing)
-- =====================================================

-- Get all interviews for current user (run this after authentication)
-- SELECT * FROM interviews WHERE user_id = auth.uid() ORDER BY created_at DESC;

-- Get user statistics
-- SELECT * FROM user_interview_stats WHERE user_id = auth.uid();

-- Get average score by difficulty
-- SELECT difficulty, AVG(overall_score) as avg_score 
-- FROM interviews 
-- WHERE user_id = auth.uid() AND status = 'completed'
-- GROUP BY difficulty;

-- =====================================================
-- CLEANUP (Optional - use if you need to reset)
-- =====================================================

-- CAUTION: These commands will delete all data!
-- Only run these if you want to start fresh

-- DROP VIEW IF EXISTS user_interview_stats;
-- DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP TABLE IF EXISTS interviews;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verify policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- NOTES
-- =====================================================

/*
1. This script is idempotent - you can run it multiple times safely
2. RLS ensures users can only access their own data
3. All queries must be authenticated (using Supabase client)
4. The questions and answers are stored as JSONB for flexibility
5. Indexes improve query performance for common operations
6. The updated_at column is automatically maintained

IMPORTANT: 
- Make sure to run this in your Supabase SQL Editor
- Test the policies work correctly after setup
- Keep your service_role key secret - it bypasses RLS
*/
