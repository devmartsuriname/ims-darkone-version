-- Create system health reports table for historical tracking
CREATE TABLE IF NOT EXISTS public.system_health_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  overall_status TEXT NOT NULL CHECK (overall_status IN ('healthy', 'degraded', 'critical')),
  database_metrics JSONB NOT NULL DEFAULT '{}',
  service_metrics JSONB NOT NULL DEFAULT '{}', 
  performance_metrics JSONB NOT NULL DEFAULT '{}',
  alert_count INTEGER NOT NULL DEFAULT 0,
  alerts JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_health_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for system health reports (admin/IT only)
CREATE POLICY "Admin/IT can view health reports" 
ON public.system_health_reports 
FOR SELECT 
USING (is_admin_or_it());

CREATE POLICY "System can insert health reports" 
ON public.system_health_reports 
FOR INSERT 
WITH CHECK (true);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_system_health_reports_timestamp ON public.system_health_reports(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_reports_status ON public.system_health_reports(overall_status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_health_reports_updated_at
BEFORE UPDATE ON public.system_health_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();