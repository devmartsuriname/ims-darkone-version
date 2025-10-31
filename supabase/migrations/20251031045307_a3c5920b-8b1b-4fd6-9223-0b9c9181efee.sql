-- Fix Control Queue visibility: Allow Control users to view applicants
-- This enables the Control Queue to display applicant details when joining applications with applicants

-- Drop existing policy
DROP POLICY IF EXISTS "Staff can view all applicants" ON applicants;

-- Create updated policy with Control access
CREATE POLICY "Staff and Control can view applicants"
ON applicants
FOR SELECT
TO authenticated
USING (
  can_manage_applications() 
  OR can_control_inspect()
);

-- Add comment for documentation
COMMENT ON POLICY "Staff and Control can view applicants" ON applicants IS 
'Allows Staff (admin, it, staff, front_office) and Control users to view applicant records for inspections, scheduling, and application management.';