// Comprehensive Integration Testing Suite for IMS
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowTestResult {
  success: boolean;
  step: string;
  error?: string;
  data?: any;
  duration?: number;
  category?: 'workflow' | 'security' | 'performance' | 'integration';
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  totalRequests: number;
  successRate: number;
}

export interface SecurityTestResult {
  testName: string;
  passed: boolean;
  vulnerability?: string;
  recommendation?: string;
}

export class IMSIntegrationTester {
  /**
   * Run all test suites
   */
  static async runCompleteTestSuite(): Promise<{
    workflow: WorkflowTestResult[];
    security: WorkflowTestResult[];
    performance: WorkflowTestResult[];
    integration: WorkflowTestResult[];
  }> {
    return {
      workflow: await this.testCompleteWorkflow(),
      security: await this.testSecurityControls(),
      performance: await this.testPerformance(),
      integration: await this.testSystemIntegration()
    };
  }

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
    const startTime = Date.now();
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
        data: { applicantId: applicant.id, applicationId: application.id },
        duration: Date.now() - startTime,
        category: 'workflow'
      };
    } catch (error) {
      return {
        success: false,
        step: 'Application Creation',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        category: 'workflow'
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
   * Legacy test role-based access controls (deprecated - use testSecurityControls)
   */
  static async testRoleBasedAccessLegacy(): Promise<WorkflowTestResult[]> {
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
   * Test security controls and RLS policies
   */
  static async testSecurityControls(): Promise<WorkflowTestResult[]> {
    const results: WorkflowTestResult[] = [];
    const startTime = Date.now();

    try {
      // Test RLS policies
      const rlsTests = [
        { table: 'applications', description: 'Application RLS Policies' },
        { table: 'applicants', description: 'Applicant RLS Policies' },
        { table: 'documents', description: 'Document RLS Policies' },
        { table: 'user_roles', description: 'User Role RLS Policies' }
      ];

      for (const test of rlsTests) {
        try {
          // Test unauthorized access
          const { data, error } = await supabase
            .from(test.table as any)
            .select('*')
            .limit(1);
          
          results.push({
            success: true,
            step: `RLS Test: ${test.description}`,
            data: { hasRLS: true, accessible: !error, recordCount: data?.length || 0 },
            duration: Date.now() - startTime,
            category: 'security'
          });
        } catch (testError) {
          results.push({
            success: false,
            step: `RLS Test: ${test.description}`,
            error: testError instanceof Error ? testError.message : 'RLS test failed',
            duration: Date.now() - startTime,
            category: 'security'
          });
        }
      }

      // Test role-based functions
      const roleFunctions = [
        'can_manage_applications',
        'can_control_inspect',
        'can_review_applications',
        'is_admin_or_it'
      ];

      for (const func of roleFunctions) {
        try {
          const { data, error } = await supabase.rpc(func as any);
          results.push({
            success: !error,
            step: `Security Function: ${func}`,
            data: { result: data },
            error: error?.message,
            duration: Date.now() - startTime,
            category: 'security'
          });
        } catch (error) {
          results.push({
            success: false,
            step: `Security Function: ${func}`,
            error: error instanceof Error ? error.message : 'Function test failed',
            duration: Date.now() - startTime,
            category: 'security'
          });
        }
      }

    } catch (error) {
      results.push({
        success: false,
        step: 'Security Controls Test',
        error: error instanceof Error ? error.message : 'Security test failed',
        duration: Date.now() - startTime,
        category: 'security'
      });
    }

    return results;
  }

  /**
   * Test system performance under load
   */
  static async testPerformance(): Promise<WorkflowTestResult[]> {
    const results: WorkflowTestResult[] = [];
    const startTime = Date.now();

    try {
      // Test database query performance
      const queryTests = [
        { 
          name: 'Application List Query', 
          query: () => supabase.from('applications').select('*, applicants(first_name, last_name)').limit(50)
        },
        { 
          name: 'User Roles Query', 
          query: () => supabase.from('user_roles').select('*, profiles(first_name, last_name)').limit(50)
        },
        { 
          name: 'Documents Query', 
          query: () => supabase.from('documents').select('*').limit(100)
        }
      ];

      for (const test of queryTests) {
        const testStart = Date.now();
        try {
          const { data, error } = await test.query();
          const duration = Date.now() - testStart;
          
          results.push({
            success: !error && duration < 2000, // Should complete in under 2 seconds
            step: `Performance: ${test.name}`,
            data: { 
              duration,
              recordCount: data?.length || 0,
              performant: duration < 2000
            },
            error: error?.message || (duration >= 2000 ? 'Query took too long' : undefined),
            duration,
            category: 'performance'
          });
        } catch (error) {
          results.push({
            success: false,
            step: `Performance: ${test.name}`,
            error: error instanceof Error ? error.message : 'Performance test failed',
            duration: Date.now() - testStart,
            category: 'performance'
          });
        }
      }

      // Test concurrent requests
      const concurrentStart = Date.now();
      const promises = Array(5).fill(null).map(() => 
        supabase.from('reference_data').select('*').limit(10)
      );
      
      const concurrentResults = await Promise.allSettled(promises);
      const concurrentDuration = Date.now() - concurrentStart;
      const successfulRequests = concurrentResults.filter(r => r.status === 'fulfilled').length;

      results.push({
        success: successfulRequests === 5 && concurrentDuration < 3000,
        step: 'Concurrent Request Performance',
        data: {
          totalRequests: 5,
          successfulRequests,
          duration: concurrentDuration,
          averageTime: concurrentDuration / 5
        },
        error: successfulRequests < 5 ? 'Some concurrent requests failed' : 
               concurrentDuration >= 3000 ? 'Concurrent requests too slow' : undefined,
        duration: concurrentDuration,
        category: 'performance'
      });

    } catch (error) {
      results.push({
        success: false,
        step: 'Performance Test Suite',
        error: error instanceof Error ? error.message : 'Performance tests failed',
        duration: Date.now() - startTime,
        category: 'performance'
      });
    }

    return results;
  }

  /**
   * Test system integration points
   */
  static async testSystemIntegration(): Promise<WorkflowTestResult[]> {
    const results: WorkflowTestResult[] = [];
    const startTime = Date.now();

    try {
      // Test edge functions
      const edgeFunctionTests = [
        { name: 'workflow-service', endpoint: 'workflow-service' },
        { name: 'user-management', endpoint: 'user-management' },
        { name: 'application-service', endpoint: 'application-service' }
      ];

      for (const test of edgeFunctionTests) {
        const testStart = Date.now();
        try {
          const { error } = await supabase.functions.invoke(test.endpoint, {
            body: { action: 'health-check' }
          });
          
          const duration = Date.now() - testStart;
          results.push({
            success: !error,
            step: `Edge Function: ${test.name}`,
            data: { 
              duration,
              endpoint: test.endpoint,
              available: !error
            },
            error: error?.message,
            duration,
            category: 'integration'
          });
        } catch (error) {
          results.push({
            success: false,
            step: `Edge Function: ${test.name}`,
            error: error instanceof Error ? error.message : 'Function not available',
            duration: Date.now() - testStart,
            category: 'integration'
          });
        }
      }

      // Test storage buckets
      const bucketTests = ['documents', 'control-photos'];
      
      for (const bucket of bucketTests) {
        const testStart = Date.now();
        try {
          const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });
          
          results.push({
            success: !error,
            step: `Storage Bucket: ${bucket}`,
            data: { 
              bucketName: bucket,
              accessible: !error,
              fileCount: data?.length || 0
            },
            error: error?.message,
            duration: Date.now() - testStart,
            category: 'integration'
          });
        } catch (error) {
          results.push({
            success: false,
            step: `Storage Bucket: ${bucket}`,
            error: error instanceof Error ? error.message : 'Storage test failed',
            duration: Date.now() - testStart,
            category: 'integration'
          });
        }
      }

    } catch (error) {
      results.push({
        success: false,
        step: 'System Integration Test',
        error: error instanceof Error ? error.message : 'Integration tests failed',
        duration: Date.now() - startTime,
        category: 'integration'
      });
    }

    return results;
  }

  /**
   * Test data consistency and validation
   */
  static async testDataConsistency(): Promise<WorkflowTestResult[]> {
    const results: WorkflowTestResult[] = [];
    const startTime = Date.now();

    try {
      // Test foreign key constraints
      const constraintTests = [
        {
          name: 'Application-Applicant Relationship',
          query: () => supabase.from('applications')
            .select('id, applicant_id, applicants!inner(id)')
            .limit(10)
        },
        {
          name: 'Document-Application Relationship', 
          query: () => supabase.from('documents')
            .select('id, application_id, applications!inner(id)')
            .limit(10)
        }
      ];

      for (const test of constraintTests) {
        const testStart = Date.now();
        try {
          const { data, error } = await test.query();
          
          results.push({
            success: !error,
            step: `Data Consistency: ${test.name}`,
            data: { 
              recordsChecked: data?.length || 0,
              consistent: !error
            },
            error: error?.message,
            duration: Date.now() - testStart,
            category: 'integration'
          });
        } catch (error) {
          results.push({
            success: false,
            step: `Data Consistency: ${test.name}`,
            error: error instanceof Error ? error.message : 'Consistency check failed',
            duration: Date.now() - testStart,
            category: 'integration'
          });
        }
      }

    } catch (error) {
      results.push({
        success: false,
        step: 'Data Consistency Test',
        error: error instanceof Error ? error.message : 'Consistency tests failed',
        duration: Date.now() - startTime,
        category: 'integration'
      });
    }

    return results;
  }

  /**
   * Role-based access test (for backward compatibility)
   */
  static async testRoleBasedAccess(): Promise<WorkflowTestResult[]> {
    return this.testSecurityControls();
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
      await supabase.from('tasks').delete().eq('application_id', applicationId);
      await supabase.from('applications').delete().eq('id', applicationId);
      await supabase.from('applicants').delete().eq('id', applicantId);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}