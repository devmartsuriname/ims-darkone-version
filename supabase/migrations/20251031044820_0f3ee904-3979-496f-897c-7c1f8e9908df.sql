-- Fix Control Queue visibility by updating applications SELECT policy
-- Drop existing policy
DROP POLICY IF EXISTS "Staff can view all applications" ON applications;

-- Create updated policy with Control access
CREATE POLICY "Staff and Control can view applications"
ON applications
FOR SELECT
TO authenticated
USING (
  can_view_all_applications() 
  OR can_review_applications() 
  OR can_control_inspect()
  OR (created_by = auth.uid())
);

-- Add comment for documentation
COMMENT ON POLICY "Staff and Control can view applications" ON applications IS 
'Allows Staff (admin, it, staff) to view all applications, Control users to view applications for their queue, Reviewers (director, minister) to view applications for decision-making, and users to view their own created applications.';