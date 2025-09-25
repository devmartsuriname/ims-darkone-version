import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Alert, Button, ProgressBar } from 'react-bootstrap';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';

interface SystemStats {
  totalApplications: number;
  applicationsByState: Record<string, number>;
  totalUsers: number;
  usersByRole: Record<string, number>;
  totalNotifications: number;
  unreadNotifications: number;
  edgeFunctionHealth: Record<string, boolean>;
}

interface WorkflowMetrics {
  averageProcessingTime: number;
  slaCompliance: number;
  completionRate: number;
  activeWorkflows: number;
}

export const WorkflowSummaryDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadSystemStats = async () => {
    try {
      setLoading(true);

      // Get application statistics
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('current_state, created_at, completed_at');

      if (appError) throw appError;

      // Get user statistics  
      const { data: userRoles, error: userError } = await supabase
        .from('user_roles')
        .select('role, is_active')
        .eq('is_active', true);

      if (userError) throw userError;

      // Get notification statistics
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('read_at');

      if (notifError) throw notifError;

      // Calculate statistics
      const applicationsByState = (applications || []).reduce((acc, app) => {
        if (app?.current_state) {
          acc[app.current_state] = (acc[app.current_state] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const usersByRole = (userRoles || []).reduce((acc, user) => {
        if (user?.role) {
          acc[user.role] = (acc[user.role] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Test edge function health
      const edgeFunctions = [
        'user-management',
        'application-service', 
        'workflow-service',
        'notification-service',
        'email-service'
      ];

      const edgeFunctionHealth: Record<string, boolean> = {};
      
      for (const func of edgeFunctions) {
        try {
          const { error } = await supabase.functions.invoke(func, {
            body: { action: 'health_check' }
          });
          edgeFunctionHealth[func] = !error;
        } catch {
          edgeFunctionHealth[func] = false;
        }
      }

      setStats({
        totalApplications: applications?.length || 0,
        applicationsByState,
        totalUsers: userRoles?.length || 0,
        usersByRole,
        totalNotifications: notifications?.length || 0,
        unreadNotifications: notifications?.filter(n => !n.read_at).length || 0,
        edgeFunctionHealth
      });

      // Calculate workflow metrics
      const completedApps = (applications || []).filter(app => 
        app.current_state === 'CLOSURE' && app.completed_at
      );

      const avgProcessingTime = completedApps.length > 0 
        ? completedApps.reduce((sum, app) => {
            if (app.created_at && app.completed_at) {
              const start = new Date(app.created_at).getTime();
              const end = new Date(app.completed_at).getTime();
              return sum + (end - start);
            }
            return sum;
          }, 0) / completedApps.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      setMetrics({
        averageProcessingTime: Math.round(avgProcessingTime * 10) / 10,
        slaCompliance: 85, // Placeholder - would need actual SLA tracking
        completionRate: (applications?.length || 0) > 0 
          ? (completedApps.length / (applications?.length || 1)) * 100 
          : 0,
        activeWorkflows: (applications || []).filter(app => 
          !['CLOSURE', 'REJECTED'].includes(app.current_state || '')
        ).length
      });

      setLastRefresh(new Date());
      
    } catch (error: any) {
      console.error('Failed to load system stats:', error);
      toast.error(`Failed to load system statistics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemStats();
  }, []);

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'secondary',
      'INTAKE_REVIEW': 'info',
      'CONTROL_ASSIGN': 'warning',
      'CONTROL_IN_PROGRESS': 'warning',
      'TECHNICAL_REVIEW': 'primary',
      'SOCIAL_REVIEW': 'primary',
      'DIRECTOR_REVIEW': 'dark',
      'MINISTER_DECISION': 'dark',
      'CLOSURE': 'success',
      'REJECTED': 'danger',
      'ON_HOLD': 'warning'
    };
    return colors[state] || 'secondary';
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'admin': 'danger',
      'director': 'dark',
      'minister': 'dark',
      'staff': 'primary',
      'control': 'warning',
      'front_office': 'info'
    };
    return colors[role] || 'secondary';
  };

  const formatStateName = (state: string) => {
    return state.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatRoleName = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading system statistics...</p>
      </div>
    );
  }

  if (!stats || !metrics) {
    return (
      <Alert variant="warning">
        Failed to load system statistics. Please try refreshing the page.
      </Alert>
    );
  }

  const healthyFunctions = Object.values(stats.edgeFunctionHealth).filter(Boolean).length;
  const totalFunctions = Object.keys(stats.edgeFunctionHealth).length;

  return (
    <div className="workflow-summary-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">System Overview</h5>
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </small>
          <Button variant="outline-primary" size="sm" onClick={loadSystemStats}>
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Row className="mb-4">
        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Edge Functions</h6>
              <h3 className={`mb-1 ${healthyFunctions === totalFunctions ? 'text-success' : 'text-warning'}`}>
                {healthyFunctions}/{totalFunctions}
              </h3>
              <small className="text-muted">Services Online</small>
              <ProgressBar 
                now={(healthyFunctions / totalFunctions) * 100} 
                variant={healthyFunctions === totalFunctions ? 'success' : 'warning'}
                className="mt-2"
                style={{ height: 8 }}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Applications</h6>
              <h3 className="text-primary mb-1">{stats.totalApplications}</h3>
              <small className="text-muted">Total in System</small>
              <div className="mt-2">
                <Badge bg="success" className="me-1">
                  {stats.applicationsByState['CLOSURE'] || 0} Completed
                </Badge>
                <Badge bg="warning">
                  {metrics.activeWorkflows} Active
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Users</h6>
              <h3 className="text-info mb-1">{stats.totalUsers}</h3>
              <small className="text-muted">Active Users</small>
              <div className="mt-2">
                <Badge bg="danger" className="me-1">
                  {stats.usersByRole['admin'] || 0} Admin
                </Badge>
                <Badge bg="primary">
                  {stats.usersByRole['staff'] || 0} Staff
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Notifications</h6>
              <h3 className="text-warning mb-1">{stats.unreadNotifications}</h3>
              <small className="text-muted">Unread of {stats.totalNotifications}</small>
              <div className="mt-2">
                <ProgressBar 
                  now={stats.totalNotifications > 0 ? (stats.unreadNotifications / stats.totalNotifications) * 100 : 0}
                  variant="warning"
                  style={{ height: 8 }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Breakdowns */}
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Applications by State</h6>
            </Card.Header>
            <Card.Body>
              <div className="application-states">
                {Object.entries(stats.applicationsByState).map(([state, count]) => (
                  <div key={state} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div className="d-flex align-items-center">
                      <Badge bg={getStateColor(state)} className="me-2">
                        {count}
                      </Badge>
                      <span>{formatStateName(state)}</span>
                    </div>
                    <small className="text-muted">
                      {((count / stats.totalApplications) * 100).toFixed(1)}%
                    </small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Users by Role</h6>
            </Card.Header>
            <Card.Body>
              <div className="user-roles">
                {Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div className="d-flex align-items-center">
                      <Badge bg={getRoleColor(role)} className="me-2">
                        {count}
                      </Badge>
                      <span>{formatRoleName(role)}</span>
                    </div>
                    <small className="text-muted">
                      {((count / stats.totalUsers) * 100).toFixed(1)}%
                    </small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row className="mt-4">
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Workflow Performance Metrics</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-primary">{metrics.averageProcessingTime} days</h5>
                    <small className="text-muted">Avg Processing Time</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-success">{metrics.slaCompliance}%</h5>
                    <small className="text-muted">SLA Compliance</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-info">{metrics.completionRate.toFixed(1)}%</h5>
                    <small className="text-muted">Completion Rate</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-warning">{metrics.activeWorkflows}</h5>
                    <small className="text-muted">Active Workflows</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edge Function Health Details */}
      <Row className="mt-4">
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Edge Function Health</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                {Object.entries(stats.edgeFunctionHealth).map(([func, healthy]) => (
                  <Col md={4} key={func} className="mb-2">
                    <div className="d-flex align-items-center">
                      <Badge bg={healthy ? 'success' : 'danger'} className="me-2">
                        {healthy ? '✓' : '✗'}
                      </Badge>
                      <span className={healthy ? 'text-success' : 'text-danger'}>
                        {func.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkflowSummaryDashboard;