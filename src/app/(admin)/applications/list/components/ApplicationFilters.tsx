import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ApplicationFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  assignedFilter: string;
  onAssignedChange: (assigned: string) => void;
  onExport: () => void;
  selectedCount: number;
}

const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  assignedFilter,
  onAssignedChange,
  onExport,
  selectedCount
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  // Fetch users for assignment filter
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('is_active', true)
        .order('first_name');
      
      setUsers(data || []);
    };

    fetchUsers();
  }, []);

  // Fetch application statistics
  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('applications')
        .select('current_state');
      
      if (data) {
        const total = data.length;
        const pending = data.filter(app => 
          ['DRAFT', 'INTAKE_REVIEW'].includes(app.current_state || '')
        ).length;
        const inProgress = data.filter(app => 
          ['CONTROL_ASSIGN', 'CONTROL_VISIT_SCHEDULED', 'CONTROL_IN_PROGRESS', 
           'TECHNICAL_REVIEW', 'SOCIAL_REVIEW', 'DIRECTOR_REVIEW', 'MINISTER_DECISION'].includes(app.current_state || '')
        ).length;
        const completed = data.filter(app => 
          ['CLOSURE', 'REJECTED'].includes(app.current_state || '')
        ).length;

        setStats({ total, pending, inProgress, completed });
      }
    };

    fetchStats();
  }, []);

  const applicationStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'INTAKE_REVIEW', label: 'Intake Review' },
    { value: 'CONTROL_ASSIGN', label: 'Control Assignment' },
    { value: 'CONTROL_VISIT_SCHEDULED', label: 'Visit Scheduled' },
    { value: 'CONTROL_IN_PROGRESS', label: 'Control in Progress' },
    { value: 'TECHNICAL_REVIEW', label: 'Technical Review' },
    { value: 'SOCIAL_REVIEW', label: 'Social Review' },
    { value: 'DIRECTOR_REVIEW', label: 'Director Review' },
    { value: 'MINISTER_DECISION', label: 'Minister Decision' },
    { value: 'CLOSURE', label: 'Completed' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'ON_HOLD', label: 'On Hold' }
  ];

  return (
    <div className="card mb-4">
      <div className="card-body">
        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{stats.total}</h4>
                    <span className="small">Total Applications</span>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-files" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{stats.pending}</h4>
                    <span className="small">Pending Review</span>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-clock" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{stats.inProgress}</h4>
                    <span className="small">In Progress</span>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-gear" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{stats.completed}</h4>
                    <span className="small">Completed</span>
                  </div>
                  <div className="align-self-center">
                    <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="row align-items-end">
          <div className="col-md-4">
            <label htmlFor="searchInput" className="form-label">Search Applications</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                id="searchInput"
                className="form-control"
                placeholder="Search by application #, name, or ID..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => onSearchChange('')}
                  title="Clear search"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          <div className="col-md-3">
            <label htmlFor="statusFilter" className="form-label">Status</label>
            <select
              id="statusFilter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              {applicationStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label htmlFor="assignedFilter" className="form-label">Assigned To</label>
            <select
              id="assignedFilter"
              className="form-select"
              value={assignedFilter}
              onChange={(e) => onAssignedChange(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="unassigned">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={onExport}
                title="Export to CSV"
              >
                <i className="bi bi-download"></i> Export
              </button>
            </div>
          </div>
        </div>

        {/* Selection Info */}
        {selectedCount > 0 && (
          <div className="alert alert-info mt-3 mb-0">
            <i className="bi bi-info-circle"></i> {selectedCount} application(s) selected
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationFilters;