-- Add unique constraint to prevent duplicate user_progress entries (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_progress_per_user'
    ) THEN
        ALTER TABLE public.user_progress
        ADD CONSTRAINT unique_user_progress_per_user UNIQUE (user_id);
    END IF;
END $$;

-- Clean up existing duplicates before adding constraint
DELETE FROM public.user_progress a USING (
    SELECT MIN(ctid) as ctid, user_id
    FROM public.user_progress 
    GROUP BY user_id HAVING COUNT(*) > 1
) b
WHERE a.user_id = b.user_id 
AND a.ctid <> b.ctid;