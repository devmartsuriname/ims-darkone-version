import { useState } from 'react';
import { StaffGuard } from '@/components/auth/RoleGuards';
import ApplicationFilters from './components/ApplicationFilters';
import ApplicationListTable from './components/ApplicationListTable';
import BulkOperations from './components/BulkOperations';
import { EnhancedButton } from '@/components/ui/EnhancedButtons';
import { toast } from 'react-toastify';

const ApplicationListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle application selection
  const handleApplicationSelect = (applicationId: string) => {
    // Navigate to application detail view
    window.open(`/admin/applications/detail/${applicationId}`, '_blank');
  };

  // Handle bulk operation completion
  const handleOperationComplete = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Operation completed successfully');
  };

  // Handle export
  const handleExport = async () => {
    try {
      // This would export all applications based on current filters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (assignedFilter !== 'all') params.append('assigned', assignedFilter);
      
      // For now, show success message
      toast.success('Export functionality will be implemented');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <StaffGuard>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">All Applications</h4>
              <div className="page-title-right">
                <div className="d-flex gap-2 align-items-center">
                  <EnhancedButton
                    variant="success"
                    onClick={() => window.open('/admin/applications/intake', '_blank')}
                  >
                    <i className="bi bi-plus-circle"></i> New Application
                  </EnhancedButton>
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item"><a href="/admin">IMS</a></li>
                    <li className="breadcrumb-item"><a href="/admin/applications">Applications</a></li>
                    <li className="breadcrumb-item active">All Applications</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ApplicationFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          assignedFilter={assignedFilter}
          onAssignedChange={setAssignedFilter}
          onExport={handleExport}
          selectedCount={selectedApplications.length}
        />

        {/* Bulk Operations */}
        <BulkOperations
          selectedApplications={selectedApplications}
          onOperationComplete={handleOperationComplete}
          onClearSelection={() => setSelectedApplications([])}
        />

        {/* Applications Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Applications List</h5>
                  <div className="text-muted">
                    <small>
                      <i className="bi bi-info-circle"></i> 
                      Click on applications to view details
                    </small>
                  </div>
                </div>
                
                <ApplicationListTable
                  key={refreshKey}
                  searchTerm={searchTerm}
                  statusFilter={statusFilter}
                  assignedFilter={assignedFilter}
                  onApplicationSelect={handleApplicationSelect}
                  selectedApplications={selectedApplications}
                  onSelectionChange={setSelectedApplications}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffGuard>
  );
};

export default ApplicationListPage;