-- Add unique constraint to application_steps table to support upsert operations
-- This ensures one record per application per workflow step
ALTER TABLE application_steps 
ADD CONSTRAINT application_steps_application_id_step_name_key 
UNIQUE (application_id, step_name);

-- Add comment for documentation
COMMENT ON CONSTRAINT application_steps_application_id_step_name_key 
ON application_steps IS 'Ensures one record per application per workflow step - enables efficient upsert operations';