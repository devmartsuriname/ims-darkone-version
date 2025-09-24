-- Create storage buckets for IMS file management
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']),
  ('control-photos', 'control-photos', false, 26214400, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Documents bucket RLS policies
CREATE POLICY "Authenticated users can view documents" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Staff can upload documents" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Staff can update own documents" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admin/IT can delete documents" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'documents' AND 
    (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'it') 
        AND is_active = true
      ) OR
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Control photos bucket RLS policies  
CREATE POLICY "Control staff can view photos" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'control-photos' AND 
    auth.role() = 'authenticated' AND
    (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'it', 'control', 'staff', 'director', 'minister') 
        AND is_active = true
      )
    )
  );

CREATE POLICY "Control staff can upload photos" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'control-photos' AND 
    auth.role() = 'authenticated' AND
    (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'it', 'control') 
        AND is_active = true
      )
    )
  );

CREATE POLICY "Control staff can update own photos" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'control-photos' AND 
    auth.role() = 'authenticated' AND
    (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'it', 'control') 
        AND is_active = true
      ) AND
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

CREATE POLICY "Admin/IT can delete control photos" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'control-photos' AND 
    (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'it') 
        AND is_active = true
      ) OR
      (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() 
          AND role = 'control' 
          AND is_active = true
        ) AND
        (storage.foldername(name))[1] = auth.uid()::text
      )
    )
  );

-- Create helper function for generating secure file paths
CREATE OR REPLACE FUNCTION public.generate_file_path(
  bucket_name TEXT,
  application_id UUID,
  file_extension TEXT,
  subfolder TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_folder TEXT;
  timestamp_str TEXT;
  random_suffix TEXT;
  full_path TEXT;
BEGIN
  -- Get user ID as folder name
  user_folder := auth.uid()::text;
  
  -- Generate timestamp string
  timestamp_str := to_char(now(), 'YYYY/MM/DD');
  
  -- Generate random suffix for uniqueness
  random_suffix := encode(gen_random_bytes(8), 'hex');
  
  -- Build the full path
  IF subfolder IS NOT NULL THEN
    full_path := user_folder || '/' || timestamp_str || '/' || subfolder || '/' || application_id::text || '_' || random_suffix || '.' || file_extension;
  ELSE
    full_path := user_folder || '/' || timestamp_str || '/' || application_id::text || '_' || random_suffix || '.' || file_extension;
  END IF;
  
  RETURN full_path;
END;
$$;

-- Create function to get signed URLs for file access
CREATE OR REPLACE FUNCTION public.get_file_signed_url(
  bucket_name TEXT,
  file_path TEXT,
  expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  signed_url TEXT;
BEGIN
  -- Check if user has permission to access this file
  IF bucket_name = 'documents' THEN
    -- Check if user can manage applications or is the file owner
    IF NOT (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'it', 'staff', 'front_office', 'director', 'minister') 
        AND is_active = true
      ) OR
      (storage.foldername(file_path))[1] = auth.uid()::text
    ) THEN
      RAISE EXCEPTION 'Insufficient permissions to access this file';
    END IF;
  ELSIF bucket_name = 'control-photos' THEN
    -- Check if user can view control photos
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'it', 'control', 'staff', 'director', 'minister') 
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Insufficient permissions to access this file';
    END IF;
  END IF;
  
  -- Note: In a real implementation, this would generate a proper signed URL
  -- For now, return a placeholder that indicates the file path
  RETURN '/storage/v1/object/sign/' || bucket_name || '/' || file_path;
END;
$$;

-- Create function to validate file uploads
CREATE OR REPLACE FUNCTION public.validate_file_upload(
  bucket_name TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check bucket-specific validations
  IF bucket_name = 'documents' THEN
    -- Max 50MB for documents
    IF file_size > 52428800 THEN
      RAISE EXCEPTION 'File size exceeds maximum allowed size of 50MB for documents';
    END IF;
    
    -- Check allowed mime types for documents
    IF mime_type NOT IN (
      'application/pdf', 'image/jpeg', 'image/png', 'image/gif',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ) THEN
      RAISE EXCEPTION 'File type not allowed for documents bucket';
    END IF;
    
  ELSIF bucket_name = 'control-photos' THEN
    -- Max 25MB for photos
    IF file_size > 26214400 THEN
      RAISE EXCEPTION 'File size exceeds maximum allowed size of 25MB for photos';
    END IF;
    
    -- Check allowed mime types for photos
    IF mime_type NOT IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp') THEN
      RAISE EXCEPTION 'File type not allowed for control photos bucket';
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;