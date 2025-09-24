// Integration testing utilities for IMS workflow
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowTestResult {
  success: boolean;
  step: string;
  error?: string;
  data?: any;
}

export class IMSIntegrationTester {
  /**
   * Test complete workflow from intake to decision
   */
  static async testCompleteWorkflow(): Promise<WorkflowTestResult[]> {
    const results: WorkflowTestResult[] = [];
    let applicationId: string | null = null;

    try {
      // Step 1: Test Application Creation
      const creationResult = await this.testApplicationCreation();
      results.push(creationResult);
      
      if (creationResult.success && creationResult.data) {
        applicationId = creationResult.data.applicationId;
        
        if (applicationId) {
          // Step 2: Test Document Upload
          results.push(await this.testDocumentUpload(applicationId));
          
          // Step 3: Test Workflow Transition
          results.push(await this.testWorkflowTransition(applicationId, 'INTAKE_REVIEW'));
          
          // Step 4: Test Control Assignment
          results.push(await this.testControlAssignment(applicationId));
          
          // Step 5: Test Review Process
          results.push(await this.testReviewProcess(applicationId));
          
          // Step 6: Test Decision Making
          results.push(await this.testDecisionMaking(applicationId));
        }
      }

    } catch (error) {
      results.push({
        success: false,
        step: 'Workflow Test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  /**
   * Test application creation and data persistence
   */
  static async testApplicationCreation(): Promise<WorkflowTestResult> {
    try {
      // Create test applicant
      const { data: applicant, error: applicantError } = await supabase
        .from('applicants')
        .insert({
          first_name: 'Test',
          last_name: 'User',
          national_id: `TEST${Date.now()}`,
          email: `test${Date.now()}@example.com`,
          phone: '1234567890',
          address: 'Test Address 123',
          district: 'Paramaribo'
        })
        .select()
        .single();

      if (applicantError) throw applicantError;

      // Create test application
      const { data: application, error: appError } = await supabase
        .from('applications')
        .insert({
          applicant_id: applicant.id,
          application_number: `TEST-${Date.now()}`,
          service_type: 'SUBSIDY',
          property_address: 'Test Property Address',
          property_district: 'Paramaribo',
          requested_amount: 50000,
          reason_for_request: 'Test application for integration testing',
          current_state: 'DRAFT'
        })
        .select()
        .single();

      if (appError) throw appError;

      return {
        success: true,
        step: 'Application Creation',
        data: { applicantId: applicant.id, applicationId: application.id }
      };
    } catch (error) {
      return {
        success: false,
        step: 'Application Creation',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test document upload and verification
   */
  static async testDocumentUpload(applicationId: string): Promise<WorkflowTestResult> {
    try {
      // Create test document record
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          application_id: applicationId,
          document_type: 'NATIONAL_ID',
          document_name: 'Test National ID',
          file_path: `test/documents/${applicationId}/test-id.pdf`,
          file_type: 'application/pdf',
          verification_status: 'PENDING'
        })
        .select()
        .single();

      if (docError) throw docError;

      return {
        success: true,
        step: 'Document Upload',
        data: { documentId: document.id }
      };
    } catch (error) {
      return {
        success: false,
        step: 'Document Upload',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test workflow state transitions
   */
  static async testWorkflowTransition(applicationId: string, targetState: string): Promise<WorkflowTestResult> {
    try {
      // Call workflow service
      const { error } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'transition',
          applicationId,
          targetState,
          notes: 'Integration test transition'
        }
      });

      if (error) throw error;

      // Verify state change
      const { data: application, error: fetchError } = await supabase
        .from('applications')
        .select('current_state')
        .eq('id', applicationId)
        .single();

      if (fetchError) throw fetchError;

      const success = application.current_state === targetState;

      return {
        success,
        step: `Workflow Transition to ${targetState}`,
        data: { currentState: application.current_state }
      };
    } catch (error) {
      return {
        success: false,
        step: `Workflow Transition to ${targetState}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test control department assignment and visit scheduling
   */
  static async testControlAssignment(applicationId: string): Promise<WorkflowTestResult> {
    try {
      // Create control visit
      const { data: visit, error: visitError } = await supabase
        .from('control_visits')
        .insert({
          application_id: applicationId,
          visit_type: 'TECHNICAL_INSPECTION',
          scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
          visit_status: 'SCHEDULED'
        })
        .select()
        .single();

      if (visitError) throw visitError;

      return {
        success: true,
        step: 'Control Assignment',
        data: { visitId: visit.id }
      };
    } catch (error) {
      return {
        success: false,
        step: 'Control Assignment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test review process (technical and social)
   */
  static async testReviewProcess(applicationId: string): Promise<WorkflowTestResult> {
    try {
      // Create technical report
      const { data: techReport, error: techError } = await supabase
        .from('technical_reports')
        .insert({
          application_id: applicationId,
          foundation_condition: 'GOOD',
          roof_condition: 'NEEDS_REPAIR',
          technical_conclusion: 'Property requires minor repairs',
          estimated_cost: 25000,
          urgency_level: 2
        })
        .select()
        .single();

      if (techError) throw techError;

      // Create social report
      const { data: socialReport, error: socialError } = await supabase
        .from('social_reports')
        .insert({
          application_id: applicationId,
          household_situation: 'STABLE',
          living_conditions_assessment: 'Adequate but could be improved',
          social_conclusion: 'Applicant qualifies for assistance',
          social_priority_level: 2
        })
        .select()
        .single();

      if (socialError) throw socialError;

      return {
        success: true,
        step: 'Review Process',
        data: { 
          techReportId: techReport.id, 
          socialReportId: socialReport.id 
        }
      };
    } catch (error) {
      return {
        success: false,
        step: 'Review Process',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test decision making process
   */
  static async testDecisionMaking(applicationId: string): Promise<WorkflowTestResult> {
    try {
      // Test director review transition
      const { error: directorError } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'transition',
          applicationId,
          targetState: 'DIRECTOR_REVIEW',
          notes: 'Ready for director review'
        }
      });

      if (directorError) throw directorError;

      // Test minister decision transition
      const { error: ministerError } = await supabase.functions.invoke('workflow-service', {
        body: {
          action: 'transition',
          applicationId,
          targetState: 'MINISTER_DECISION',
          notes: 'Director recommends approval'
        }
      });

      if (ministerError) throw ministerError;

      return {
        success: true,
        step: 'Decision Making',
        data: { stage: 'MINISTER_DECISION' }
      };
    } catch (error) {
      return {
        success: false,
        step: 'Decision Making',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test role-based access controls
   */
  static async testRoleBasedAccess(): Promise<WorkflowTestResult[]> {
    const results: WorkflowTestResult[] = [];

    try {
      // Test database functions
      const functions = [
        'can_manage_applications',
        'can_control_inspect', 
        'can_review_applications',
        'is_admin_or_it'
      ] as const;

      for (const func of functions) {
        try {
          const { data, error } = await supabase.rpc(func as any);
          results.push({
            success: !error,
            step: `Function Test: ${func}`,
            data: { result: data },
            error: error?.message
          });
        } catch (error) {
          results.push({
            success: false,
            step: `Function Test: ${func}`,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

    } catch (error) {
      results.push({
        success: false,
        step: 'Role-Based Access Test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return results;
  }

  /**
   * Clean up test data
   */
  static async cleanupTestData(applicationId: string, applicantId: string): Promise<void> {
    try {
      // Delete in correct order to respect foreign keys
      await supabase.from('documents').delete().eq('application_id', applicationId);
      await supabase.from('technical_reports').delete().eq('application_id', applicationId);
      await supabase.from('social_reports').delete().eq('application_id', applicationId);
      await supabase.from('control_visits').delete().eq('application_id', applicationId);
      await supabase.from('application_steps').delete().eq('application_id', applicationId);
      await supabase.from('applications').delete().eq('id', applicationId);
      await supabase.from('applicants').delete().eq('id', applicantId);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}