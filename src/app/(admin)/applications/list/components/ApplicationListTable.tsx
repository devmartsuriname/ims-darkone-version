import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { EnhancedButton } from '@/components/ui/EnhancedButtons';
import { TableSkeleton } from '@/components/ui/LoadingStates';
import { toast } from 'react-toastify';

type Application = Database['public']['Tables']['applications']['Row'] & {
  applicants?: Database['public']['Tables']['applicants']['Row'] | null;
  application_steps?: Database['public']['Tables']['application_steps']['Row'][];
};

interface ApplicationListTableProps {
  searchTerm: string;
  statusFilter: string;
  assignedFilter: string;
  onApplicationSelect: (applicationId: string) => void;
  selectedApplications: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const ApplicationListTable: React.FC<ApplicationListTableProps> = ({
  searchTerm,
  statusFilter,
  assignedFilter,
  onApplicationSelect,
  selectedApplications,
  onSelectionChange
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const itemsPerPage = 25;

  // Fetch applications from database
  const fetchApplications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('applications')
        .select(`
          *,
          applicants (
            id,
            first_name,
            last_name,
            national_id,
            phone,
            email
          ),
          application_steps!inner (
            id,
            step_name,
            status,
            created_at,
            assigned_to,
            is_active
          )
        `)
        .eq('application_steps.is_active', true);

      // Apply filters
      if (searchTerm) {
        query = query.or(`
          application_number.ilike.%${searchTerm}%,
          applicants.first_name.ilike.%${searchTerm}%,
          applicants.last_name.ilike.%${searchTerm}%,
          applicants.national_id.ilike.%${searchTerm}%
        `);
      }

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('current_state', statusFilter as Database['public']['Enums']['application_state']);
      }

      if (assignedFilter && assignedFilter !== 'all') {
        if (assignedFilter === 'unassigned') {
          query = query.is('assigned_to', null);
        } else {
          query = query.eq('assigned_to', assignedFilter);
        }
      }

      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        toast.error('Failed to load applications');
        console.error('Error fetching applications:', error);
        return;
      }

      setApplications((data as Application[]) || []);
      setTotalCount(count || 0);
    } catch (error) {
      toast.error('Failed to load applications');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [searchTerm, statusFilter, assignedFilter, currentPage, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Handle row selection
  const handleRowSelect = (applicationId: string) => {
    const newSelection = selectedApplications.includes(applicationId)
      ? selectedApplications.filter(id => id !== applicationId)
      : [...selectedApplications, applicationId];
    onSelectionChange(newSelection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(applications.map(app => app.id));
    }
  };

  // Format status badge
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'DRAFT': 'bg-secondary',
      'INTAKE_REVIEW': 'bg-primary',
      'CONTROL_ASSIGN': 'bg-warning',
      'CONTROL_VISIT_SCHEDULED': 'bg-info',
      'CONTROL_IN_PROGRESS': 'bg-info',
      'TECHNICAL_REVIEW': 'bg-warning',
      'SOCIAL_REVIEW': 'bg-warning',
      'DIRECTOR_REVIEW': 'bg-success',
      'MINISTER_DECISION': 'bg-success',
      'CLOSURE': 'bg-success',
      'REJECTED': 'bg-danger',
      'ON_HOLD': 'bg-secondary'
    };

    return (
      <span className={`badge ${statusColors[status] || 'bg-secondary'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  // Format priority level
  const getPriorityBadge = (priority: number) => {
    const priorityColors: Record<number, string> = {
      1: 'bg-danger',
      2: 'bg-warning', 
      3: 'bg-success',
      4: 'bg-info',
      5: 'bg-secondary'
    };

    return (
      <span className={`badge ${priorityColors[priority] || 'bg-secondary'}`}>
        {priority === 1 ? 'Critical' : 
         priority === 2 ? 'High' :
         priority === 3 ? 'Normal' :
         priority === 4 ? 'Low' : 'Very Low'}
      </span>
    );
  };

  if (loading) {
    return <TableSkeleton rows={10} columns={9} />;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead className="table-dark">
          <tr>
            <th scope="col" style={{ width: '50px' }}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={selectedApplications.length === applications.length && applications.length > 0}
                  onChange={handleSelectAll}
                />
              </div>
            </th>
            <th 
              scope="col" 
              className="sortable"
              onClick={() => handleSort('application_number')}
            >
              Application # {sortField === 'application_number' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
              )}
            </th>
            <th scope="col">Applicant</th>
            <th scope="col">Contact</th>
            <th 
              scope="col" 
              className="sortable"
              onClick={() => handleSort('current_state')}
            >
              Status {sortField === 'current_state' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
              )}
            </th>
            <th scope="col">Priority</th>
            <th 
              scope="col" 
              className="sortable"
              onClick={() => handleSort('requested_amount')}
            >
              Amount {sortField === 'requested_amount' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
              )}
            </th>
            <th 
              scope="col" 
              className="sortable"
              onClick={() => handleSort('created_at')}
            >
              Created {sortField === 'created_at' && (
                <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
              )}
            </th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-4">
                <div className="text-muted">
                  <i className="bi bi-search" style={{ fontSize: '2rem' }}></i>
                  <div className="mt-2">No applications found</div>
                  <small>Try adjusting your search criteria</small>
                </div>
              </td>
            </tr>
          ) : (
            applications.map((application) => (
              <tr key={application.id}>
                <td>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={() => handleRowSelect(application.id)}
                    />
                  </div>
                </td>
                <td>
                  <strong>{application.application_number}</strong>
                  <br />
                  <small className="text-muted">{application.service_type}</small>
                </td>
                <td>
                  <div>
                    <strong>
                      {application.applicants?.first_name} {application.applicants?.last_name}
                    </strong>
                    <br />
                    <small className="text-muted">
                      ID: {application.applicants?.national_id}
                    </small>
                  </div>
                </td>
                <td>
                  <div>
                    {application.applicants?.phone && (
                      <div>
                        <i className="bi bi-telephone"></i> {application.applicants.phone}
                      </div>
                    )}
                    {application.applicants?.email && (
                      <div>
                        <i className="bi bi-envelope"></i> {application.applicants.email}
                      </div>
                    )}
                  </div>
                </td>
                <td>{getStatusBadge(application.current_state || 'DRAFT')}</td>
                <td>{getPriorityBadge(application.priority_level || 3)}</td>
                <td>
                  {application.requested_amount ? (
                    <div>
                      <strong>SRD {application.requested_amount.toLocaleString()}</strong>
                      {application.approved_amount && (
                        <div>
                          <small className="text-success">
                            Approved: SRD {application.approved_amount.toLocaleString()}
                          </small>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted">Not specified</span>
                  )}
                </td>
                <td>
                  <small className="text-muted">
                    {new Date(application.created_at || '').toLocaleDateString()}
                  </small>
                </td>
                <td>
                  <div className="btn-group" role="group">
                    <EnhancedButton
                      size="sm"
                      variant="outline-primary"
                      onClick={() => onApplicationSelect(application.id)}
                      title="View Details"
                    >
                      <i className="bi bi-eye"></i>
                    </EnhancedButton>
                    <EnhancedButton
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => window.open(`/admin/applications/intake?edit=${application.id}`, '_blank')}
                      title="Edit Application"
                    >
                      <i className="bi bi-pencil"></i>
                    </EnhancedButton>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} applications
          </div>
          <nav aria-label="Applications pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ApplicationListTable;