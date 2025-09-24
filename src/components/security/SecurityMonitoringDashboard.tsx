import React, { useState, useEffect } from 'react';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { LoadingSpinner } from '@/components/ui/LoadingStates';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'authentication' | 'access_denied' | 'privilege_escalation' | 'data_breach' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  description: string;
  details: Record<string, any>;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
}

interface ThreatMetrics {
  totalThreats: number;
  activeThreatCount: number;
  resolvedThreats: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
}

export const SecurityMonitoringDashboard: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<ThreatMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<{
    severity?: string;
    type?: string;
    status?: string;
  }>({});

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from audit_logs or security_events table
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: 'authentication',
          severity: 'medium',
          user_id: 'user-123',
          ip_address: '192.168.1.100',
          description: 'Multiple failed login attempts',
          details: { attempts: 5, timespan: '5 minutes' },
          status: 'active'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          type: 'access_denied',
          severity: 'high',
          user_id: 'user-456',
          ip_address: '10.0.0.50',
          description: 'Unauthorized access attempt to admin functions',
          details: { attempted_resource: '/admin/users', method: 'GET' },
          status: 'investigating'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: 'suspicious_activity',
          severity: 'low',
          user_id: 'user-789',
          ip_address: '203.0.113.42',
          description: 'Unusual login location detected',
          details: { country: 'Unknown', previous_location: 'Suriname' },
          status: 'resolved'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          type: 'privilege_escalation',
          severity: 'critical',
          user_id: 'user-999',
          ip_address: '198.51.100.25',
          description: 'Attempt to escalate privileges detected',
          details: { target_role: 'admin', current_role: 'staff' },
          status: 'investigating'
        }
      ];

      // Apply filters
      let filteredEvents = mockEvents;
      if (filter.severity) {
        filteredEvents = filteredEvents.filter(event => event.severity === filter.severity);
      }
      if (filter.type) {
        filteredEvents = filteredEvents.filter(event => event.type === filter.type);
      }
      if (filter.status) {
        filteredEvents = filteredEvents.filter(event => event.status === filter.status);
      }

      setEvents(filteredEvents);

      // Calculate metrics
      const totalThreats = mockEvents.length;
      const activeThreatCount = mockEvents.filter(e => e.status === 'active').length;
      const resolvedThreats = mockEvents.filter(e => e.status === 'resolved').length;
      const criticalThreats = mockEvents.filter(e => e.severity === 'critical').length;
      const highThreats = mockEvents.filter(e => e.severity === 'high').length;
      const mediumThreats = mockEvents.filter(e => e.severity === 'medium').length;
      const lowThreats = mockEvents.filter(e => e.severity === 'low').length;

      setMetrics({
        totalThreats,
        activeThreatCount,
        resolvedThreats,
        criticalThreats,
        highThreats,
        mediumThreats,
        lowThreats
      });

    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, newStatus: SecurityEvent['status']) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: newStatus } : event
    ));
    
    // In production, this would update the database
    console.log(`Updated event ${eventId} status to ${newStatus}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-danger';
      case 'high': return 'text-warning';
      case 'medium': return 'text-info';
      case 'low': return 'text-secondary';
      default: return 'text-muted';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-danger';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-info';
      case 'low': return 'bg-secondary';
      default: return 'bg-light';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-danger';
      case 'investigating': return 'text-warning';
      case 'resolved': return 'text-success';
      case 'false_positive': return 'text-muted';
      default: return 'text-secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'authentication': return 'solar:user-id-bold';
      case 'access_denied': return 'solar:shield-cross-bold';
      case 'privilege_escalation': return 'solar:arrow-up-bold';
      case 'data_breach': return 'solar:database-bold';
      case 'suspicious_activity': return 'solar:eye-bold';
      default: return 'solar:shield-warning-bold';
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <LoadingSpinner />
          <p className="mt-2 text-muted">Loading security monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Security Metrics Overview */}
      <div className="col-12 mb-4">
        <div className="row">
          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-start border-danger border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-2">Active Threats</h6>
                    <h3 className="mb-0 text-danger">{metrics?.activeThreatCount || 0}</h3>
                  </div>
                  <div className="align-self-center">
                    <IconifyIcon icon="solar:shield-warning-bold" className="text-danger fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-start border-warning border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-2">Critical Issues</h6>
                    <h3 className="mb-0 text-warning">{metrics?.criticalThreats || 0}</h3>
                  </div>
                  <div className="align-self-center">
                    <IconifyIcon icon="solar:danger-triangle-bold" className="text-warning fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-start border-success border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-2">Resolved</h6>
                    <h3 className="mb-0 text-success">{metrics?.resolvedThreats || 0}</h3>
                  </div>
                  <div className="align-self-center">
                    <IconifyIcon icon="solar:shield-check-bold" className="text-success fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-3">
            <div className="card border-start border-info border-4">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-2">Total Events</h6>
                    <h3 className="mb-0 text-info">{metrics?.totalThreats || 0}</h3>
                  </div>
                  <div className="align-self-center">
                    <IconifyIcon icon="solar:document-bold" className="text-info fs-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <select 
                  className="form-select"
                  value={filter.severity || ''}
                  onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value || undefined }))}
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select"
                  value={filter.type || ''}
                  onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value || undefined }))}
                >
                  <option value="">All Types</option>
                  <option value="authentication">Authentication</option>
                  <option value="access_denied">Access Denied</option>
                  <option value="privilege_escalation">Privilege Escalation</option>
                  <option value="data_breach">Data Breach</option>
                  <option value="suspicious_activity">Suspicious Activity</option>
                </select>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select"
                  value={filter.status || ''}
                  onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value || undefined }))}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="false_positive">False Positive</option>
                </select>
              </div>
              <div className="col-md-3">
                <button 
                  className="btn btn-outline-primary w-100"
                  onClick={loadSecurityData}
                  disabled={isLoading}
                >
                  <IconifyIcon icon="solar:refresh-bold" className="me-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Events */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Security Events</h6>
          </div>
          <div className="card-body">
            {events.length === 0 ? (
              <div className="text-center py-4">
                <IconifyIcon icon="solar:shield-check-bold" className="fs-1 text-success" />
                <p className="text-muted mt-2">No security events match the current filters</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Severity</th>
                      <th>Time</th>
                      <th>User/IP</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <IconifyIcon 
                              icon={getTypeIcon(event.type)} 
                              className="me-2 fs-5 text-primary"
                            />
                            <div>
                              <div className="fw-medium">{event.description}</div>
                              <small className="text-muted">
                                {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getSeverityBadge(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="text-nowrap">
                            {event.timestamp.toLocaleTimeString()}
                          </div>
                          <small className="text-muted">
                            {event.timestamp.toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          <div>
                            {event.user_id && (
                              <div className="small">{event.user_id}</div>
                            )}
                            <div className="text-muted small">{event.ip_address}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-light ${getStatusColor(event.status)}`}>
                            {event.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td>
                          <div className="dropdown">
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              <IconifyIcon icon="solar:menu-dots-bold" />
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button 
                                  className="dropdown-item"
                                  onClick={() => updateEventStatus(event.id, 'investigating')}
                                >
                                  Mark as Investigating
                                </button>
                              </li>
                              <li>
                                <button 
                                  className="dropdown-item"
                                  onClick={() => updateEventStatus(event.id, 'resolved')}
                                >
                                  Mark as Resolved
                                </button>
                              </li>
                              <li>
                                <button 
                                  className="dropdown-item"
                                  onClick={() => updateEventStatus(event.id, 'false_positive')}
                                >
                                  Mark as False Positive
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};