import React, { useState } from 'react';
import { Button, Alert, Card, Spinner } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';

interface UATUserSeederProps {
  onSuccess?: () => void;
}

export const UATUserSeeder: React.FC<UATUserSeederProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const seedUsers = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('seed-uat-users', {
        body: { action: 'seed' }
      });

      if (error) throw error;

      setResult(data);
      toast.success(data.message);
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error('UAT seeding error:', error);
      toast.error(error.message || 'Failed to seed UAT users');
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const cleanupUsers = async () => {
    if (!confirm('Are you sure you want to delete all UAT test users?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('seed-uat-users', {
        body: { action: 'cleanup' }
      });

      if (error) throw error;

      setResult(data);
      toast.success('UAT users cleaned up successfully');
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error('UAT cleanup error:', error);
      toast.error(error.message || 'Failed to cleanup UAT users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <h5 className="card-title">UAT User Seeding</h5>
        <p className="text-muted">
          Seed 7 test user accounts for workflow validation and role-based access testing.
        </p>

        <div className="d-flex gap-2 mb-3">
          <Button 
            variant="primary" 
            onClick={seedUsers} 
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="me-2" /> : null}
            Seed UAT Users
          </Button>
          <Button 
            variant="danger" 
            onClick={cleanupUsers} 
            disabled={loading}
          >
            Cleanup UAT Users
          </Button>
        </div>

        {result && (
          <Alert variant={result.success ? 'success' : 'danger'}>
            <strong>{result.message}</strong>
            {result.summary && (
              <ul className="mb-0 mt-2">
                <li>Total: {result.summary.total}</li>
                <li>Created: {result.summary.created}</li>
                <li>Skipped: {result.summary.skipped}</li>
                <li>Errors: {result.summary.errors}</li>
              </ul>
            )}
            {result.results && result.results.length > 0 && (
              <details className="mt-2">
                <summary style={{ cursor: 'pointer' }}>View Details</summary>
                <pre className="mt-2" style={{ fontSize: '0.85rem', maxHeight: '200px', overflow: 'auto' }}>
                  {JSON.stringify(result.results, null, 2)}
                </pre>
              </details>
            )}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};
