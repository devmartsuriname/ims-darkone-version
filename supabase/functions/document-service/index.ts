import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface UploadDocumentRequest {
  application_id: string;
  document_type: string;
  document_name: string;
  file_name: string;
  file_size: number;
  file_type: string;
  is_required?: boolean;
  display_order?: number;
}

interface VerifyDocumentRequest {
  document_id: string;
  verification_status: 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW';
  verification_notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (req.method) {
      case 'POST':
        if (path === 'upload') {
          return await uploadDocument(req, user.id);
        } else if (path === 'verify') {
          return await verifyDocument(req, user.id);
        } else if (path === 'generate-upload-url') {
          return await generateUploadUrl(req, user.id);
        }
        break;
      case 'GET':
        if (path === 'list') {
          return await listDocuments(req, user.id);
        } else if (path === 'download-url') {
          return await generateDownloadUrl(req, user.id);
        } else if (path && path !== 'document-service') {
          return await getDocument(path, user.id);
        }
        break;
      case 'DELETE':
        if (path && path !== 'document-service') {
          return await deleteDocument(path, user.id);
        }
        break;
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in document-service:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateUploadUrl(req: Request, userId: string): Promise<Response> {
  const { application_id, file_name, file_size, file_type } = await req.json();

  // Validate file upload
  const { data: validationResult, error: validationError } = await supabase
    .rpc('validate_file_upload', {
      bucket_name: 'documents',
      file_name,
      file_size,
      mime_type: file_type
    });

  if (validationError) {
    throw new Error(`File validation failed: ${validationError.message}`);
  }

  // Generate file path
  const { data: filePath, error: pathError } = await supabase
    .rpc('generate_file_path', {
      bucket_name: 'documents',
      application_id,
      file_extension: file_name.split('.').pop() || 'bin'
    });

  if (pathError) {
    throw new Error(`Failed to generate file path: ${pathError.message}`);
  }

  // Generate signed upload URL
  const { data: uploadUrl, error: urlError } = await supabase.storage
    .from('documents')
    .createSignedUploadUrl(filePath);

  if (urlError) {
    throw new Error(`Failed to generate upload URL: ${urlError.message}`);
  }

  return new Response(JSON.stringify({
    upload_url: uploadUrl.signedUrl,
    file_path: filePath,
    token: uploadUrl.token
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function uploadDocument(req: Request, userId: string): Promise<Response> {
  const documentData: UploadDocumentRequest = await req.json();

  // Generate file path for the document
  const { data: filePath, error: pathError } = await supabase
    .rpc('generate_file_path', {
      bucket_name: 'documents',
      application_id: documentData.application_id,
      file_extension: documentData.file_name.split('.').pop() || 'bin'
    });

  if (pathError) {
    throw new Error(`Failed to generate file path: ${pathError.message}`);
  }

  // Create document record
  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert([{
      application_id: documentData.application_id,
      document_type: documentData.document_type,
      document_name: documentData.document_name,
      file_path: filePath,
      file_type: documentData.file_type,
      file_size: documentData.file_size,
      is_required: documentData.is_required || true,
      display_order: documentData.display_order || 0,
      uploaded_by: userId,
      verification_status: 'PENDING',
    }])
    .select('*')
    .single();

  if (docError) {
    throw new Error(`Failed to create document record: ${docError.message}`);
  }

  // Create attachment record
  const { error: attachmentError } = await supabase
    .from('attachments')
    .insert([{
      entity_type: 'document',
      entity_id: document.id,
      file_name: documentData.file_name,
      file_path: filePath,
      file_size: documentData.file_size,
      mime_type: documentData.file_type,
      uploaded_by: userId,
    }]);

  if (attachmentError) {
    console.error('Failed to create attachment record:', attachmentError);
  }

  return new Response(JSON.stringify({
    message: 'Document uploaded successfully',
    document
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function verifyDocument(req: Request, userId: string): Promise<Response> {
  const { document_id, verification_status, verification_notes }: VerifyDocumentRequest = await req.json();

  const { data: document, error: updateError } = await supabase
    .from('documents')
    .update({
      verification_status,
      verification_notes,
      verified_by: userId,
      verified_at: new Date().toISOString(),
    })
    .eq('id', document_id)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`Failed to verify document: ${updateError.message}`);
  }

  return new Response(JSON.stringify({
    message: 'Document verification updated successfully',
    document
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function listDocuments(req: Request, userId: string): Promise<Response> {
  const url = new URL(req.url);
  const application_id = url.searchParams.get('application_id');
  const verification_status = url.searchParams.get('verification_status');

  let query = supabase
    .from('documents')
    .select('*')
    .order('display_order', { ascending: true })
    .order('upload_date', { ascending: false });

  if (application_id) {
    query = query.eq('application_id', application_id);
  }

  if (verification_status) {
    query = query.eq('verification_status', verification_status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }

  return new Response(JSON.stringify({ documents: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getDocument(documentId: string, userId: string): Promise<Response> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) {
    throw new Error(`Document not found: ${error.message}`);
  }

  return new Response(JSON.stringify({ document: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateDownloadUrl(req: Request, userId: string): Promise<Response> {
  const url = new URL(req.url);
  const document_id = url.searchParams.get('document_id');
  const expires_in = parseInt(url.searchParams.get('expires_in') || '3600');

  if (!document_id) {
    throw new Error('Document ID is required');
  }

  // Get document details
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', document_id)
    .single();

  if (docError || !document) {
    throw new Error('Document not found');
  }

  // Generate signed download URL using the helper function
  const { data: signedUrl, error: urlError } = await supabase
    .rpc('get_file_signed_url', {
      bucket_name: 'documents',
      file_path: document.file_path,
      expires_in
    });

  if (urlError) {
    throw new Error(`Failed to generate download URL: ${urlError.message}`);
  }

  return new Response(JSON.stringify({
    download_url: signedUrl,
    expires_in
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deleteDocument(documentId: string, userId: string): Promise<Response> {
  // Get document details first
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', documentId)
    .single();

  if (fetchError) {
    throw new Error(`Document not found: ${fetchError.message}`);
  }

  // Delete file from storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([document.file_path]);

  if (storageError) {
    console.error('Failed to delete file from storage:', storageError);
  }

  // Delete document record
  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (deleteError) {
    throw new Error(`Failed to delete document: ${deleteError.message}`);
  }

  // Delete attachment record
  const { error: attachmentError } = await supabase
    .from('attachments')
    .delete()
    .eq('entity_type', 'document')
    .eq('entity_id', documentId);

  if (attachmentError) {
    console.error('Failed to delete attachment record:', attachmentError);
  }

  return new Response(JSON.stringify({
    message: 'Document deleted successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}