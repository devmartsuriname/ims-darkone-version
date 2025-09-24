import React, { useState } from 'react';
import IconifyIcon from '@/components/wrapper/IconifyIcon';

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  commands?: string[];
  notes?: string[];
  status: 'pending' | 'completed' | 'current';
}

export const DeploymentGuide: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const deploymentSteps: DeploymentStep[] = [
    {
      id: 'pre-deployment',
      title: 'Pre-Deployment Validation',
      description: 'Run all checks to ensure system readiness',
      commands: [
        'Run Production Readiness Check',
        'Verify all tests pass',
        'Check database migrations'
      ],
      notes: [
        'Address any critical issues before proceeding',
        'Ensure all environment variables are set',
        'Verify backup strategy is in place'
      ],
      status: 'pending'
    },
    {
      id: 'supabase-prod',
      title: 'Supabase Production Setup',
      description: 'Configure production Supabase project',
      commands: [
        'Create new Supabase project for production',
        'Run database migrations',
        'Deploy edge functions',
        'Configure storage buckets'
      ],
      notes: [
        'Use separate project for production',
        'Configure custom domain if needed',
        'Set up monitoring and alerts'
      ],
      status: 'pending'
    },
    {
      id: 'auth-config',
      title: 'Authentication Configuration',
      description: 'Set up authentication providers and policies',
      commands: [
        'Configure email/password authentication',
        'Set up social login providers (optional)',
        'Configure email templates',
        'Test authentication flow'
      ],
      notes: [
        'Use production-ready email provider',
        'Configure proper redirect URLs',
        'Test password reset functionality'
      ],
      status: 'pending'
    },
    {
      id: 'security-setup',
      title: 'Security Configuration',
      description: 'Implement security best practices',
      commands: [
        'Review all RLS policies',
        'Configure CORS settings',
        'Set up API rate limiting',
        'Review edge function permissions'
      ],
      notes: [
        'Test policies with different user roles',
        'Ensure no data leaks through RLS',
        'Configure proper CORS for production domain'
      ],
      status: 'pending'
    },
    {
      id: 'app-deploy',
      title: 'Application Deployment',
      description: 'Deploy the frontend application',
      commands: [
        'Build production bundle',
        'Deploy to hosting platform (Vercel/Netlify)',
        'Configure custom domain',
        'Set up SSL certificate'
      ],
      notes: [
        'Update environment variables for production',
        'Test all application features',
        'Configure proper caching headers'
      ],
      status: 'pending'
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Logging',
      description: 'Set up production monitoring',
      commands: [
        'Configure Supabase monitoring',
        'Set up error tracking',
        'Configure performance monitoring',
        'Set up alerting rules'
      ],
      notes: [
        'Monitor database performance',
        'Track edge function execution times',
        'Set up uptime monitoring'
      ],
      status: 'pending'
    },
    {
      id: 'testing',
      title: 'Production Testing',
      description: 'Validate production deployment',
      commands: [
        'Run smoke tests',
        'Test user workflows end-to-end',
        'Verify integrations work',
        'Load test critical paths'
      ],
      notes: [
        'Test with production data volumes',
        'Verify backup and restore procedures',
        'Test disaster recovery plan'
      ],
      status: 'pending'
    },
    {
      id: 'go-live',
      title: 'Go Live',
      description: 'Launch the system',
      commands: [
        'Update DNS records',
        'Migrate initial data if needed',
        'Create initial admin users',
        'Notify stakeholders'
      ],
      notes: [
        'Have rollback plan ready',
        'Monitor system closely after launch',
        'Provide user training and documentation'
      ],
      status: 'pending'
    }
  ];

  const toggleStepCompletion = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const getStepIcon = (step: DeploymentStep) => {
    if (completedSteps.has(step.id)) {
      return <IconifyIcon icon="solar:check-circle-bold" className="text-success" />;
    }
    return <IconifyIcon icon="solar:clock-circle-bold" className="text-muted" />;
  };

  const completionPercentage = (completedSteps.size / deploymentSteps.length) * 100;

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Deployment Progress</h5>
              <span className="badge bg-primary">{completedSteps.size}/{deploymentSteps.length} Steps</span>
            </div>
          </div>
          <div className="card-body">
            <div className="progress mb-3" style={{ height: '8px' }}>
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ width: `${completionPercentage}%` }}
                aria-valuenow={completionPercentage} 
                aria-valuemin={0} 
                aria-valuemax={100}
              />
            </div>
            <div className="text-center">
              <h6 className="mb-0">{Math.round(completionPercentage)}% Complete</h6>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="timeline">
          {deploymentSteps.map((step, index) => (
            <div key={step.id} className="timeline-item">
              <div className="timeline-marker">
                <button
                  className="btn btn-link p-0"
                  onClick={() => toggleStepCompletion(step.id)}
                  style={{ border: 'none', background: 'none' }}
                >
                  {getStepIcon(step)}
                </button>
              </div>
              <div className="timeline-content">
                <div className="card">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{step.title}</h6>
                      <small className="text-muted">Step {index + 1}</small>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="text-muted mb-3">{step.description}</p>

                    {step.commands && (
                      <div className="mb-3">
                        <h6 className="text-primary">Actions Required:</h6>
                        <ul className="list-group list-group-flush">
                          {step.commands.map((command, cmdIndex) => (
                            <li key={cmdIndex} className="list-group-item px-0 py-2">
                              <IconifyIcon icon="solar:arrow-right-linear" className="me-2 text-primary" />
                              {command}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.notes && (
                      <div className="alert alert-info">
                        <h6 className="alert-heading">
                          <IconifyIcon icon="solar:info-circle-bold" className="me-2" />
                          Important Notes:
                        </h6>
                        <ul className="mb-0">
                          {step.notes.map((note, noteIndex) => (
                            <li key={noteIndex}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <small className="text-muted">
                        Status: {completedSteps.has(step.id) ? 'Completed' : 'Pending'}
                      </small>
                      <button
                        className={`btn btn-sm ${
                          completedSteps.has(step.id) ? 'btn-success' : 'btn-outline-primary'
                        }`}
                        onClick={() => toggleStepCompletion(step.id)}
                      >
                        {completedSteps.has(step.id) ? 'Mark Incomplete' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-12 mt-4">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Post-Deployment Checklist</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Immediate Actions (Day 1)</h6>
                <ul>
                  <li>Monitor system performance and errors</li>
                  <li>Verify all critical workflows function correctly</li>
                  <li>Check backup procedures are running</li>
                  <li>Validate user access and permissions</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6>Follow-up Actions (Week 1)</h6>
                <ul>
                  <li>Review performance metrics and optimize</li>
                  <li>Gather user feedback and address issues</li>
                  <li>Fine-tune monitoring and alerting</li>
                  <li>Plan regular maintenance windows</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};