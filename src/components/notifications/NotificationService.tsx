import React from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  recipient_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  category: 'APPLICATION' | 'SYSTEM' | 'REMINDER' | 'DECISION';
  application_id?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Send notification to specific user
   */
  static async sendNotification(data: NotificationData): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('notification-service', {
        body: {
          type: 'in_app',
          recipients: [data.recipient_id],
          subject: data.title,
          message: data.message,
          priority: data.type === 'ERROR' ? 'high' : 'normal',
          data: {
            category: data.category,
            application_id: data.application_id,
            ...data.metadata
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users by role
   */
  static async sendNotificationToRole(role: string, data: Omit<NotificationData, 'recipient_id'>): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('notification-service', {
        body: {
          role,
          title: data.title,
          message: data.message,
          type: data.type,
          category: data.category,
          application_id: data.application_id,
          metadata: data.metadata
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to send notification to role:', error);
      throw error;
    }
  }

  /**
   * Director decision notifications
   */
  static async notifyDirectorDecision(applicationId: string, decision: string, notes: string): Promise<void> {
    try {
      // Get application details
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
          application_number,
          applicants:applicant_id (first_name, last_name)
        `)
        .eq('id', applicationId)
        .single();

      if (appError) throw appError;

      const applicantName = application.applicants 
        ? `${application.applicants.first_name} ${application.applicants.last_name}`
        : 'Unknown Applicant';

      // Notify Minister
      await this.sendNotificationToRole('minister', {
        title: 'Director Recommendation Received',
        message: `Application ${application.application_number} (${applicantName}) has received a director recommendation: ${decision}`,
        type: 'INFO',
        category: 'DECISION',
        application_id: applicationId,
        metadata: { decision, notes }
      });

      // Notify relevant staff
      await this.sendNotificationToRole('staff', {
        title: 'Director Review Completed',
        message: `Application ${application.application_number} has been reviewed by the director and forwarded for ministerial decision.`,
        type: 'INFO',
        category: 'APPLICATION',
        application_id: applicationId
      });

    } catch (error) {
      console.error('Failed to send director decision notifications:', error);
    }
  }

  /**
   * Minister decision notifications
   */
  static async notifyMinisterDecision(applicationId: string, decision: string, finalAmount?: number): Promise<void> {
    try {
      // Get application details
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
          application_number,
          applicants:applicant_id (first_name, last_name, email, phone)
        `)
        .eq('id', applicationId)
        .single();

      if (appError) throw appError;

      const applicantName = application.applicants 
        ? `${application.applicants.first_name} ${application.applicants.last_name}`
        : 'Unknown Applicant';
      const isApproved = decision === 'APPROVED' || decision === 'CONDITIONAL_APPROVAL';

      // Notify all staff about the final decision
      await this.sendNotificationToRole('staff', {
        title: `Application ${isApproved ? 'Approved' : 'Rejected'}`,
        message: `Application ${application.application_number} (${applicantName}) has been ${decision.toLowerCase()} by the Minister.${finalAmount ? ` Final amount: SRD ${finalAmount.toLocaleString()}` : ''}`,
        type: isApproved ? 'SUCCESS' : 'WARNING',
        category: 'DECISION',
        application_id: applicationId,
        metadata: { decision, finalAmount }
      });

      // Notify front office for applicant contact
      await this.sendNotificationToRole('front_office', {
        title: 'Applicant Notification Required',
        message: `Please contact ${applicantName} regarding the ${decision.toLowerCase()} decision for application ${application.application_number}.`,
        type: 'INFO',
        category: 'REMINDER',
        application_id: applicationId,
        metadata: { 
          applicant_contact: {
            name: applicantName,
            email: application.applicants?.email || null,
            phone: application.applicants?.phone || null
          },
          decision,
          finalAmount
        }
      });

    } catch (error) {
      console.error('Failed to send minister decision notifications:', error);
    }
  }

  /**
   * Application status change notifications
   */
  static async notifyStatusChange(applicationId: string, fromState: string, toState: string): Promise<void> {
    try {
      const { data: application, error } = await supabase
        .from('applications')
        .select(`
          application_number,
          assigned_to,
          applicants:applicant_id (first_name, last_name)
        `)
        .eq('id', applicationId)
        .single();

      if (error) throw error;

      const applicantName = application.applicants 
        ? `${application.applicants.first_name} ${application.applicants.last_name}`
        : 'Unknown Applicant';

      // Notify assigned user if any
      if (application.assigned_to) {
        await this.sendNotification({
          recipient_id: application.assigned_to,
          title: 'Application Status Updated',
          message: `Application ${application.application_number} (${applicantName}) has moved from ${fromState} to ${toState}`,
          type: 'INFO',
          category: 'APPLICATION',
          application_id: applicationId
        });
      }

      // Notify relevant role based on new state
      const roleMap: Record<string, string> = {
        'CONTROL_ASSIGN': 'control',
        'TECHNICAL_REVIEW': 'staff',
        'SOCIAL_REVIEW': 'staff',
        'DIRECTOR_REVIEW': 'director',
        'MINISTER_DECISION': 'minister'
      };

      const targetRole = roleMap[toState];
      if (targetRole) {
        await this.sendNotificationToRole(targetRole, {
          title: 'New Application Assignment',
          message: `Application ${application.application_number} (${applicantName}) is now ready for ${toState.replace('_', ' ').toLowerCase()}`,
          type: 'INFO',
          category: 'APPLICATION',
          application_id: applicationId
        });
      }

    } catch (error) {
      console.error('Failed to send status change notifications:', error);
    }
  }

  /**
   * SLA deadline notifications
   */
  static async notifySLADeadline(applicationId: string, hoursRemaining: number): Promise<void> {
    try {
      const { data: application, error } = await supabase
        .from('applications')
        .select(`
          application_number,
          current_state,
          assigned_to,
          applicants:applicant_id (first_name, last_name)
        `)
        .eq('id', applicationId)
        .single();

      if (error) throw error;

      const applicantName = application.applicants 
        ? `${application.applicants.first_name} ${application.applicants.last_name}`
        : 'Unknown Applicant';
      const urgencyLevel = hoursRemaining <= 24 ? 'ERROR' : hoursRemaining <= 48 ? 'WARNING' : 'INFO';

      const notification: Omit<NotificationData, 'recipient_id'> = {
        title: `SLA Deadline Approaching`,
        message: `Application ${application.application_number} (${applicantName}) has ${hoursRemaining} hours remaining until SLA deadline in ${application.current_state}`,
        type: urgencyLevel as 'INFO' | 'WARNING' | 'ERROR',
        category: 'REMINDER',
        application_id: applicationId,
        metadata: { hoursRemaining, currentState: application.current_state }
      };

      // Notify assigned user
      if (application.assigned_to) {
        await this.sendNotification({
          recipient_id: application.assigned_to,
          ...notification
        });
      }

      // Notify supervisors if urgent
      if (hoursRemaining <= 24) {
        await this.sendNotificationToRole('admin', notification);
        await this.sendNotificationToRole('director', notification);
      }

    } catch (error) {
      console.error('Failed to send SLA deadline notifications:', error);
    }
  }
}

// React hook for real-time notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('notification-service', {
        body: { action: 'user-notifications' }
      });

      if (error) {
        // ✅ FIX #3: Gracefully handle 404 or other errors
        if (error.message?.includes('404') || error.message?.includes('Invalid endpoint')) {
          console.warn('Notification service not fully configured - using empty state');
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        
        console.error('Notification service error:', error);
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      if (data && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // ✅ Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications for current user
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('notifications_realtime')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('Real-time notification update:', payload);
            fetchNotifications(); // Refetch notifications on change
          }
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    };

    const cleanup = setupRealtimeSubscription();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('notification-service/mark-read', {
        body: { 
          notification_ids: [notificationId]
        }
      });

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at);
      const notificationIds = unreadNotifications.map(n => n.id);

      if (notificationIds.length === 0) return;

      const { error } = await supabase.functions.invoke('notification-service/mark-read', {
        body: { 
          notification_ids: notificationIds
        }
      });

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
};

export default NotificationService;