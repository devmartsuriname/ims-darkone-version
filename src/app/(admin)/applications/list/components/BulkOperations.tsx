import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedButton } from '@/components/ui/EnhancedButtons';
import { toast } from 'react-toastify';
import { Database } from '@/integrations/supabase/types';
import { exportToCSV, exportToPDF, exportToExcel, formatDateForExport, formatCurrencyForExport } from '@/utils/export-helpers';

interface BulkOperationsProps {
  selectedApplications: string[];
  onOperationComplete: () => void;
  onClearSelection: () => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedApplications,
  onOperationComplete,
  onClearSelection
}) => {
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch users for assignment
  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('is_active', true)
      .order('first_name');
    
    setUsers(data || []);
  };

  // Handle bulk assignment
  const handleBulkAssign = async () => {
    if (!selectedUser || selectedApplications.length === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ assigned_to: selectedUser })
        .in('id', selectedApplications);

      if (error) throw error;

      toast.success(`Successfully assigned ${selectedApplications.length} application(s)`);
      setShowAssignModal(false);
      setSelectedUser('');
      onOperationComplete();
      onClearSelection();
    } catch (error) {
      toast.error('Failed to assign applications');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async () => {
    if (!selectedStatus || selectedApplications.length === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ current_state: selectedStatus as Database['public']['Enums']['application_state'] })
        .in('id', selectedApplications);

      if (error) throw error;

      toast.success(`Successfully updated status for ${selectedApplications.length} application(s)`);
      setShowStatusModal(false);
      setSelectedStatus('');
      onOperationComplete();
      onClearSelection();
    } catch (error) {
      toast.error('Failed to update application status');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk export with format selection
  const handleBulkExport = async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          applicants (
            first_name,
            last_name,
            national_id,
            phone,
            email,
            date_of_birth,
            marital_status,
            employment_status,
            monthly_income
          )
        `)
        .in('id', selectedApplications);

      if (error) throw error;

      const columns = [
        { header: 'Application Number', key: 'application_number' },
        { header: 'Applicant Name', key: 'applicant_name' },
        { header: 'National ID', key: 'national_id' },
        { header: 'Phone', key: 'phone' },
        { header: 'Email', key: 'email' },
        { header: 'Status', key: 'current_state' },
        { header: 'Priority', key: 'priority_level' },
        { header: 'Requested Amount', key: 'requested_amount' },
        { header: 'Created Date', key: 'created_date' },
        { header: 'Property Address', key: 'property_address' },
        { header: 'Service Type', key: 'service_type' }
      ];

      const exportData = data.map(app => ({
        application_number: app.application_number,
        applicant_name: `${app.applicants?.first_name || ''} ${app.applicants?.last_name || ''}`,
        national_id: app.applicants?.national_id || '',
        phone: app.applicants?.phone || '',
        email: app.applicants?.email || '',
        current_state: app.current_state,
        priority_level: app.priority_level,
        requested_amount: formatCurrencyForExport(app.requested_amount),
        created_date: formatDateForExport(app.created_at),
        property_address: app.property_address || '',
        service_type: app.service_type
      }));

      const filename = `applications_export_${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'excel':
          exportToExcel(exportData, columns, filename);
          break;
        case 'pdf':
          exportToPDF(exportData, columns, filename, 'Applications Export Report');
          break;
        default:
          exportToCSV(exportData, columns, filename);
      }

      toast.success(`Exported ${selectedApplications.length} application(s) as ${format.toUpperCase()}`);
      setShowExportModal(false);
      onClearSelection();
    } catch (error) {
      toast.error('Failed to export applications');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk document verification
  const handleBulkVerify = async () => {
    setLoading(true);
    try {
      // Update all documents for selected applications to VERIFIED status
      const { error } = await supabase
        .from('documents')
        .update({ 
          verification_status: 'VERIFIED',
          verified_by: (await supabase.auth.getUser()).data.user?.id,
          verified_at: new Date().toISOString()
        })
        .in('application_id', selectedApplications)
        .eq('verification_status', 'PENDING');

      if (error) throw error;

      toast.success(`Verified documents for ${selectedApplications.length} application(s)`);
      onOperationComplete();
      onClearSelection();
    } catch (error) {
      toast.error('Failed to verify documents');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedApplications.length} application(s)? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .in('id', selectedApplications);

      if (error) throw error;

      toast.success(`Successfully deleted ${selectedApplications.length} application(s)`);
      onOperationComplete();
      onClearSelection();
    } catch (error) {
      toast.error('Failed to delete applications');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applicationStatuses = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'INTAKE_REVIEW', label: 'Intake Review' },
    { value: 'CONTROL_ASSIGN', label: 'Control Assignment' },
    { value: 'CONTROL_VISIT_SCHEDULED', label: 'Visit Scheduled' },
    { value: 'CONTROL_IN_PROGRESS', label: 'Control in Progress' },
    { value: 'TECHNICAL_REVIEW', label: 'Technical Review' },
    { value: 'SOCIAL_REVIEW', label: 'Social Review' },
    { value: 'DIRECTOR_REVIEW', label: 'Director Review' },
    { value: 'MINISTER_DECISION', label: 'Minister Decision' },
    { value: 'ON_HOLD', label: 'On Hold' }
  ];

  if (selectedApplications.length === 0) {
    return null;
  }

  return (
    <>
      <div className="card mb-4 border-primary">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="card-title mb-0">
                <i className="bi bi-check-square"></i> Bulk Operations
              </h6>
              <small className="text-muted">{selectedApplications.length} application(s) selected</small>
            </div>
            <div className="btn-group" role="group">
              <EnhancedButton
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  fetchUsers();
                  setShowAssignModal(true);
                }}
                disabled={loading}
              >
                <i className="bi bi-person-plus"></i> Assign
              </EnhancedButton>
              <EnhancedButton
                variant="warning"
                size="sm"
                onClick={() => setShowStatusModal(true)}
                disabled={loading}
              >
                <i className="bi bi-arrow-repeat"></i> Update Status
              </EnhancedButton>
              <EnhancedButton
                variant="success"
                size="sm"
                onClick={() => setShowExportModal(true)}
                disabled={loading}
              >
                <i className="bi bi-download"></i> Export
              </EnhancedButton>
              <EnhancedButton
                variant="info"
                size="sm"
                onClick={handleBulkVerify}
                disabled={loading}
              >
                <i className="bi bi-check-circle"></i> Verify Docs
              </EnhancedButton>
              <EnhancedButton
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                disabled={loading}
              >
                <i className="bi bi-trash"></i> Delete
              </EnhancedButton>
              <EnhancedButton
                variant="outline-secondary"
                size="sm"
                onClick={onClearSelection}
              >
                <i className="bi bi-x"></i> Clear
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Applications</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAssignModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Assign {selectedApplications.length} selected application(s) to:</p>
                <select
                  className="form-select"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Select a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <EnhancedButton
                  variant="primary"
                  onClick={handleBulkAssign}
                  disabled={!selectedUser || loading}
                  loading={loading}
                >
                  Assign Applications
                </EnhancedButton>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Status</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStatusModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Update status for {selectedApplications.length} selected application(s) to:</p>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Select a status...</option>
                  {applicationStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </button>
                <EnhancedButton
                  variant="primary"
                  onClick={handleBulkStatusUpdate}
                  disabled={!selectedStatus || loading}
                  loading={loading}
                >
                  Update Status
                </EnhancedButton>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}

      {/* Export Format Modal */}
      {showExportModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Export Applications</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowExportModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Select export format for {selectedApplications.length} selected application(s):</p>
                <div className="d-grid gap-2">
                  <EnhancedButton
                    variant="outline-primary"
                    onClick={() => handleBulkExport('csv')}
                    disabled={loading}
                  >
                    <i className="bi bi-filetype-csv"></i> Export as CSV
                  </EnhancedButton>
                  <EnhancedButton
                    variant="outline-success"
                    onClick={() => handleBulkExport('excel')}
                    disabled={loading}
                  >
                    <i className="bi bi-file-earmark-excel"></i> Export as Excel
                  </EnhancedButton>
                  <EnhancedButton
                    variant="outline-danger"
                    onClick={() => handleBulkExport('pdf')}
                    disabled={loading}
                  >
                    <i className="bi bi-file-earmark-pdf"></i> Export as PDF
                  </EnhancedButton>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowExportModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </>
  );
};

export default BulkOperations;