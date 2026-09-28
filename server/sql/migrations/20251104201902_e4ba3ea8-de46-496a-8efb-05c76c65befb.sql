-- Add group_members field to quiz2_submissions table
ALTER TABLE quiz2_submissions 
ADD COLUMN group_members TEXT;