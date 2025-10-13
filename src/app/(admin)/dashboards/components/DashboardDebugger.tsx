import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const DashboardDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkConnections = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        supabase: 'checking...',
        auth: 'checking...',
        data: 'checking...'
      };

      try {
        // Check Supabase connection
        const { data: testData, error: testError } = await supabase
          .from('applications')
          .select('id')
          .limit(1);
        
        info.supabase = testError ? `Error: ${testError.message}` : 'Connected ✓';
        info.data = testData ? `${testData.length} records` : 'No data';

        // Check auth
        const { data: { session } } = await supabase.auth.getSession();
        info.auth = session ? `User: ${session.user.email}` : 'No session';

      } catch (error) {
        info.error = String(error);
        console.error('Dashboard debugger error:', error);
      }

      setDebugInfo(info);
      console.log('🔍 Dashboard Debug Info:', info);
    };

    checkConnections();
  }, []);

  return (
    <div className="alert alert-info">
      <h6>Dashboard Debug Info</h6>
      <pre className="mb-0" style={{ fontSize: '0.75rem' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};
