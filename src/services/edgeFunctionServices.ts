import { supabase } from '@/integrations/supabase/client'

interface CreateApplicationData {
  applicant: {
    first_name: string
    last_name: string
    national_id: string
    email?: string
    phone?: string
    address?: string
    district?: string
    marital_status?: string
    nationality?: string
    date_of_birth?: string
    household_size?: number
    children_count?: number
    monthly_income?: number
    spouse_income?: number
    employment_status?: string
    employer_name?: string
  }
  application: {
    service_type: string
    property_address?: string
    property_district?: string
    property_type?: string
    title_type?: string
    ownership_status?: string
    property_surface_area?: number
    requested_amount?: number
    reason_for_request?: string
    special_circumstances?: string
  }
}

interface UpdateApplicationStateData {
  application_id: string
  new_state: string
  notes?: string
  assigned_to?: string
}

// Application Service API
export const applicationService = {
  async createApplication(data: CreateApplicationData) {
    const { data: result, error } = await supabase.functions.invoke('application-service', {
      body: {
        action: 'create',
        ...data
      }
    })

    if (error) throw error
    return result
  },

  async updateApplicationState(data: UpdateApplicationStateData) {
    const { data: result, error } = await supabase.functions.invoke('application-service', {
      body: {
        action: 'update-state',
        ...data
      }
    })

    if (error) throw error
    return result
  },

  async getApplication(applicationId: string) {
    const { data: result, error } = await supabase.functions.invoke('application-service', {
      body: {
        action: 'get',
        application_id: applicationId
      }
    })

    if (error) throw error
    return result
  },

  async listApplications(params?: {
    page?: number
    limit?: number
    status?: string
    assigned_to?: string
  }) {
    const { data: result, error } = await supabase.functions.invoke('application-service', {
      body: {
        action: 'list',
        ...params
      }
    })

    if (error) throw error
    return result
  },

  async updateApplication(applicationId: string, updateData: any) {
    const { data: result, error } = await supabase.functions.invoke('application-service', {
      body: {
        action: 'update',
        application_id: applicationId,
        update_data: updateData
      }
    })

    if (error) throw error
    return result
  }
}

// Workflow Service API
export const workflowService = {
  async transitionState(data: {
    application_id: string
    target_state: string
    notes?: string
    assigned_to?: string
  }) {
    const { data: result, error } = await supabase.functions.invoke('workflow-service', {
      body: {
        action: 'transition',
        ...data
      }
    })

    if (error) throw error
    return result
  },

  async validateTransition(application_id: string, target_state: string) {
    const { data: result, error } = await supabase.functions.invoke('workflow-service', {
      body: {
        action: 'validate-transition',
        application_id,
        target_state
      }
    })

    if (error) throw error
    return result
  },

  async getAvailableTransitions(application_id: string) {
    const { data: result, error } = await supabase.functions.invoke('workflow-service', {
      body: {
        action: 'available-transitions',
        application_id
      }
    })

    if (error) throw error
    return result
  },

  async getWorkflowStatus(application_id: string) {
    const { data: result, error } = await supabase.functions.invoke('workflow-service', {
      body: {
        action: 'workflow-status',
        application_id
      }
    })

    if (error) throw error
    return result
  },

  async createTask(data: {
    application_id: string
    task_type: string
    title: string
    description?: string
    assigned_to?: string
    priority?: number
    due_date?: string
  }) {
    const { data: result, error } = await supabase.functions.invoke('workflow-service', {
      body: {
        action: 'create-task',
        ...data
      }
    })

    if (error) throw error
    return result
  },

  async getTasks(params?: {
    application_id?: string
    assigned_to?: string
    status?: string
  }) {
    const { data: result, error } = await supabase.functions.invoke('workflow-service', {
      body: {
        action: 'tasks',
        ...params
      }
    })

    if (error) throw error
    return result
  },

  async completeTask(task_id: string, notes?: string) {
    const { data: result, error } = await supabase.functions.invoke('workflow-service', {
      body: {
        action: 'complete-task',
        task_id,
        notes
      }
    })

    if (error) throw error
    return result
  }
}

// Document Service API
export const documentService = {
  async generateUploadUrl(data: {
    application_id: string
    file_name: string
    file_size: number
    file_type: string
  }) {
    const { data: result, error } = await supabase.functions.invoke('document-service', {
      body: {
        action: 'generate-upload-url',
        ...data
      }
    })

    if (error) throw error
    return result
  },

  async uploadDocument(data: {
    application_id: string
    document_type: string
    document_name: string
    file_name: string
    file_size: number
    file_type: string
    is_required?: boolean
    display_order?: number
  }) {
    const { data: result, error } = await supabase.functions.invoke('document-service', {
      body: {
        action: 'upload',
        ...data
      }
    })

    if (error) throw error
    return result
  },

  async verifyDocument(data: {
    document_id: string
    verification_status: 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW'
    verification_notes?: string
  }) {
    const { data: result, error } = await supabase.functions.invoke('document-service', {
      body: {
        action: 'verify',
        ...data
      }
    })

    if (error) throw error
    return result
  },

  async listDocuments(params?: {
    application_id?: string
    verification_status?: string
  }) {
    const { data: result, error } = await supabase.functions.invoke('document-service', {
      body: {
        action: 'list',
        ...params
      }
    })

    if (error) throw error
    return result
  },

  async getDocument(document_id: string) {
    const { data: result, error } = await supabase.functions.invoke('document-service', {
      body: {
        action: 'get',
        document_id
      }
    })

    if (error) throw error
    return result
  },

  async generateDownloadUrl(document_id: string, expires_in = 3600) {
    const { data: result, error } = await supabase.functions.invoke('document-service', {
      body: {
        action: 'download-url',
        document_id,
        expires_in
      }
    })

    if (error) throw error
    return result
  },

  async deleteDocument(document_id: string) {
    const { data: result, error } = await supabase.functions.invoke('document-service', {
      body: {
        action: 'delete',
        document_id
      }
    })

    if (error) throw error
    return result
  }
}

// Notification Service API
export const notificationService = {
  async sendNotification(data: {
    type: 'email' | 'sms' | 'in_app'
    recipients: string[]
    subject?: string
    message: string
    template?: string
    data?: Record<string, any>
    priority?: 'low' | 'normal' | 'high'
  }) {
    const { data: result, error } = await supabase.functions.invoke('notification-service', {
      body: {
        action: 'send',
        ...data
      }
    })

    if (error) throw error
    return result
  },

  async sendNotificationToRole(data: {
    role: string
    title: string
    message: string
    type?: string
    category?: string
    application_id?: string
    metadata?: Record<string, any>
  }) {
    const { data: result, error } = await supabase.functions.invoke('notification-service', {
      body: {
        action: 'send_to_role',
        ...data
      }
    })

    if (error) throw error
    return result
  },

  async createTaskNotification(data: {
    task_id: string
    type: 'assignment' | 'reminder' | 'overdue'
  }) {
    const { data: result, error } = await supabase.functions.invoke('notification-service', {
      body: {
        action: 'task-notification',
        ...data
      }
    })

    if (error) throw error
    return result
  },

  async createApplicationNotification(data: {
    application_id: string
    type: 'status_change' | 'document_request' | 'approval' | 'rejection'
    message?: string
  }) {
    const { data: result, error } = await supabase.functions.invoke('notification-service', {
      body: {
        action: 'application-notification',
        ...data
      }
    })

    if (error) throw error
    return result
  },

  async getUserNotifications() {
    const { data: result, error } = await supabase.functions.invoke('notification-service', {
      body: {
        action: 'user-notifications'
      }
    })

    if (error) throw error
    return result
  },

  async markNotificationsAsRead(notification_ids: string[]) {
    const { data: result, error } = await supabase.functions.invoke('notification-service', {
      body: {
        action: 'mark-read',
        notification_ids
      }
    })

    if (error) throw error
    return result
  },

  async sendSLAReminders() {
    const { data: result, error } = await supabase.functions.invoke('notification-service', {
      body: {
        action: 'sla-reminders'
      }
    })

    if (error) throw error
    return result
  }
}