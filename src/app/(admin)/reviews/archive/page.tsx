import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';
import { StaffGuard } from '@/components/auth/RoleGuards';
import PageTitle from '@/components/PageTitle';

interface DecisionRecord {
  id: string;
  application_number: string;
  current_state: string | null;
  requested_amount: number | null;
  approved_amount: number | null;
  created_at: string | null;
  completed_at: string | null;
  applicant: {
    first_name: string;
    last_name: string;
    phone: string | null;
  };
  property_address: string | null;
  service_type: string | null;
  tasks: {
    id: string;
    title: string;
    description: string | null;
    task_type: string;
    completed_at: string | null;
  }[];
}

const DecisionArchivePage = () => {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL_TIME');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDecisions();
  }, [filter, dateFilter, searchTerm]);

  const fetchDecisions = async () => {
    try {
      let query = supabase
        .from('applications')
        .select(`
          id,
          application_number,
          current_state,
          requested_amount,
          approved_amount,
          created_at,
          completed_at,
          property_address,
          service_type,
          applicants!inner (
            first_name,
            last_name,
            phone
          ),
          tasks (
            id,
            title,
            description,
            task_type,
            completed_at
          )
        `)
        .in('current_state', ['CLOSURE', 'REJECTED'])
        .order('completed_at', { ascending: false });

      // Apply filters
      if (filter === 'APPROVED') {
        query = query.eq('current_state', 'CLOSURE');
      } else if (filter === 'REJECTED') {
        query = query.eq('current_state', 'REJECTED');
      }

      // Date filter
      if (dateFilter !== 'ALL_TIME') {
        const now = new Date();
        let fromDate: Date;
        
        switch (dateFilter) {
          case 'LAST_WEEK':
            fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'LAST_MONTH':
            fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'LAST_QUARTER':
            fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            fromDate = new Date(0);
        }
        
        query = query.gte('completed_at', fromDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      let processedDecisions = data?.map(app => ({
        ...app,
        applicant: Array.isArray(app.applicants) ? app.applicants[0] : app.applicants || {
          first_name: '',
          last_name: '',
          phone: null
        }
      })) || [];

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        processedDecisions = processedDecisions.filter(decision =>
          decision.application_number.toLowerCase().includes(term) ||
          decision.applicant.first_name.toLowerCase().includes(term) ||
          decision.applicant.last_name.toLowerCase().includes(term) ||
          (decision.property_address && decision.property_address.toLowerCase().includes(term))
        );
      }

      setDecisions(processedDecisions);
    } catch (error) {
      console.error('Error fetching decisions:', error);
      toast.error('Failed to load decision archive');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      // Create CSV content
      const headers = [
        'Application Number',
        'Applicant Name',
        'Phone',
        'Property Address',
        'Service Type',
        'Decision',
        'Requested Amount',
        'Approved Amount',
        'Decision Date',
        'Minister Notes'
      ];

      const csvData = decisions.map(decision => {
        const ministerTask = decision.tasks.find(task => task.task_type === 'MINISTER_DECISION');
        
        return [
          decision.application_number,
          `${decision.applicant.first_name} ${decision.applicant.last_name}`,
          decision.applicant.phone || '',
          decision.property_address || '',
          decision.service_type,
          decision.current_state === 'CLOSURE' ? 'APPROVED' : 'REJECTED',
          decision.requested_amount || 0,
          decision.approved_amount || 0,
          decision.completed_at ? new Date(decision.completed_at).toLocaleDateString() : '',
          ministerTask?.description || ''
        ];
      });

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decision_archive_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Decision archive exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export decision archive');
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SRD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDecisionBadge = (state: string | null) => {
    if (state === 'CLOSURE') {
      return <span className="badge bg-success">Approved</span>;
    } else if (state === 'REJECTED') {
      return <span className="badge bg-danger">Rejected</span>;
    }
    return <span className="badge bg-secondary">Unknown</span>;
  };

  if (loading) {
    return (
      <StaffGuard>
        <div className="d-flex justify-content-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </StaffGuard>
    );
  }

  return (
    <StaffGuard>
      <div className="container-fluid">
        <PageTitle title="Decision Archive" subName="Reviews" />

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="card-title mb-1">Decision Archive</h5>
                    <p className="card-text mb-0">Historical record of all ministerial decisions</p>
                  </div>
                  
                  <button
                    className="btn btn-success"
                    onClick={exportData}
                  >
                    <i className="bx bx-download me-2"></i>
                    Export CSV
                  </button>
                </div>

                <div className="row mb-4">
                  <div className="col-md-3">
                    <label className="form-label">Decision Filter</label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="form-select"
                    >
                      <option value="ALL">All Decisions</option>
                      <option value="APPROVED">Approved Only</option>
                      <option value="REJECTED">Rejected Only</option>
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="form-select"
                    >
                      <option value="ALL_TIME">All Time</option>
                      <option value="LAST_WEEK">Last Week</option>
                      <option value="LAST_MONTH">Last Month</option>
                      <option value="LAST_QUARTER">Last Quarter</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Search</label>
                    <div className="search-bar">
                      <span><i className="bx bx-search"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by application number, name, or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12">
                    <div className="alert alert-info">
                      <strong>Total Records:</strong> {decisions.length} decisions found
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover table-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Application</th>
                        <th>Applicant</th>
                        <th>Property</th>
                        <th>Decision</th>
                        <th>Requested</th>
                        <th>Approved</th>
                        <th>Decision Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {decisions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-4">
                            <div className="text-muted">
                              <i className="bx bx-search-alt me-2"></i>
                              No decisions found matching the current filters
                            </div>
                          </td>
                        </tr>
                      ) : (
                        decisions.map((decision) => {
                          const ministerTask = decision.tasks.find(task => task.task_type === 'MINISTER_DECISION');
                          
                          return (
                            <tr key={decision.id}>
                              <td>
                                <strong>{decision.application_number}</strong>
                                <br />
                                <small className="text-muted">{decision.service_type}</small>
                              </td>
                              <td>
                                <div>
                                  <strong>{decision.applicant.first_name} {decision.applicant.last_name}</strong>
                                  <br />
                                  <small className="text-muted">{decision.applicant.phone}</small>
                                </div>
                              </td>
                              <td>
                                <small>{decision.property_address || 'Not specified'}</small>
                              </td>
                              <td>{getDecisionBadge(decision.current_state)}</td>
                              <td>{formatCurrency(decision.requested_amount)}</td>
                              <td>
                                {decision.current_state === 'CLOSURE' ? 
                                  formatCurrency(decision.approved_amount) : 
                                  <span className="text-muted">N/A</span>
                                }
                              </td>
                              <td>
                                {decision.completed_at ? (
                                  <div>
                                    {new Date(decision.completed_at).toLocaleDateString()}
                                    <br />
                                    <small>{new Date(decision.completed_at).toLocaleTimeString()}</small>
                                  </div>
                                ) : (
                                  <small className="text-muted">Unknown</small>
                                )}
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    if (ministerTask?.description) {
                                      alert(`Decision Notes:\n\n${ministerTask.description}`);
                                    } else {
                                      alert('No decision notes available');
                                    }
                                  }}
                                >
                                  <i className="bx bx-show me-1"></i>
                                  View Notes
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffGuard>
  );
};

export default DecisionArchivePage;