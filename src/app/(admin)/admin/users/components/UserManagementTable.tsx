import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { EnhancedButton } from '@/components/ui/EnhancedButtons';
import { TableSkeleton } from '@/components/ui/LoadingStates';
import { toast } from 'react-toastify';

type UserProfile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'];

interface UserWithRoles extends UserProfile {
  user_roles: UserRole[];
}

interface UserManagementTableProps {
  onUserSelect: (userId: string) => void;
  refreshKey: number;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  onUserSelect,
  refreshKey
}) => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const itemsPerPage = 20;

  // Fetch users from database
  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles!profiles_user_roles_user_id_fkey (
            id,
            role,
            assigned_at,
            is_active,
            assigned_by
          )
        `, { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`
          first_name.ilike.%${searchTerm}%,
          last_name.ilike.%${searchTerm}%,
          email.ilike.%${searchTerm}%
        `);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active');
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        toast.error('Failed to load users');
        console.error('Error fetching users:', error);
        return;
      }

      let filteredData = data || [];

      // Apply role filter after fetching (since it's a related table)
      if (roleFilter !== 'all') {
        filteredData = filteredData.filter(user => 
          Array.isArray(user.user_roles) && user.user_roles.some((role: any) => role.role === roleFilter && role.is_active)
        );
      }

      setUsers(filteredData as any);
      setTotalCount(count || 0);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter, refreshKey]);

  // Get user's active roles
  const getUserRoles = (userRoles: UserRole[]) => {
    return userRoles.filter(role => role.is_active).map(role => role.role);
  };

  // Format role badges
  const getRoleBadges = (roles: string[]) => {
    const roleColors: Record<string, string> = {
      'admin': 'bg-danger',
      'it': 'bg-primary',
      'staff': 'bg-success',
      'control': 'bg-warning',
      'director': 'bg-info',
      'minister': 'bg-dark',
      'front_office': 'bg-secondary',
      'applicant': 'bg-light text-dark'
    };

    return roles.map((role, index) => (
      <span key={index} className={`badge ${roleColors[role] || 'bg-secondary'} me-1`}>
        {role.replace('_', ' ').toUpperCase()}
      </span>
    ));
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading) {
    return <TableSkeleton rows={10} columns={6} />;
  }

  return (
    <div className="card">
      <div className="card-body">
        {/* Search and Filter Controls */}
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="it">IT</option>
              <option value="staff">Staff</option>
              <option value="control">Control</option>
              <option value="director">Director</option>
              <option value="minister">Minister</option>
              <option value="front_office">Front Office</option>
              <option value="applicant">Applicant</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="col-md-2">
            <EnhancedButton
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              fullWidth
            >
              <i className="bi bi-arrow-clockwise"></i> Clear
            </EnhancedButton>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th scope="col">User</th>
                <th scope="col">Contact</th>
                <th scope="col">Department</th>
                <th scope="col">Roles</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <div className="text-muted">
                      <i className="bi bi-people" style={{ fontSize: '2rem' }}></i>
                      <div className="mt-2">No users found</div>
                      <small>Try adjusting your search criteria</small>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm me-3">
                          <div className="avatar-title bg-primary rounded-circle">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                        </div>
                        <div>
                          <strong>{user.first_name} {user.last_name}</strong>
                          <br />
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {user.phone && (
                          <div>
                            <i className="bi bi-telephone"></i> {user.phone}
                          </div>
                        )}
                        {user.email && (
                          <div>
                            <i className="bi bi-envelope"></i> {user.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{user.department || 'Not specified'}</strong>
                        {user.position && (
                          <div>
                            <small className="text-muted">{user.position}</small>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {getRoleBadges(getUserRoles(user.user_roles))}
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <EnhancedButton
                          size="sm"
                          variant="outline-primary"
                          onClick={() => onUserSelect(user.id)}
                          title="Edit User"
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} users
            </div>
            <nav aria-label="Users pagination">
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
    </div>
  );
};

export default UserManagementTable;