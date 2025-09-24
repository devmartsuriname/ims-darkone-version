import React from 'react';

interface WorkflowStep {
  name: string;
  status: 'completed' | 'active' | 'pending';
  description: string;
  icon: string;
}

interface WorkflowSummaryProps {
  currentState: string;
  applicationNumber: string;
}

const WorkflowSummary: React.FC<WorkflowSummaryProps> = ({ currentState, applicationNumber }) => {
  const getWorkflowSteps = (state: string): WorkflowStep[] => {
    const allSteps = [
      { name: 'Application Intake', key: 'DRAFT', description: 'Initial application submission', icon: 'bx-file-plus' },
      { name: 'Intake Review', key: 'INTAKE_REVIEW', description: 'Front office verification', icon: 'bx-check-circle' },
      { name: 'Control Assignment', key: 'CONTROL_ASSIGN', description: 'Assign to control department', icon: 'bx-user-check' },
      { name: 'Site Visit', key: 'CONTROL_IN_PROGRESS', description: 'Technical inspection visit', icon: 'bx-home' },
      { name: 'Technical Review', key: 'TECHNICAL_REVIEW', description: 'Technical assessment report', icon: 'bx-wrench' },
      { name: 'Social Review', key: 'SOCIAL_REVIEW', description: 'Social worker assessment', icon: 'bx-group' },
      { name: 'Director Review', key: 'DIRECTOR_REVIEW', description: 'DVH Director recommendation', icon: 'bx-user-pin' },
      { name: 'Minister Decision', key: 'MINISTER_DECISION', description: 'Final ministerial approval', icon: 'bx-award' },
      { name: 'Complete', key: 'CLOSURE', description: 'Application finalized', icon: 'bx-check-double' }
    ];

    return allSteps.map(step => {
      let status: 'completed' | 'active' | 'pending' = 'pending';
      
      const stepIndex = allSteps.findIndex(s => s.key === step.key);
      const currentIndex = allSteps.findIndex(s => s.key === state);
      
      if (stepIndex < currentIndex || (state === 'REJECTED' && stepIndex <= currentIndex)) {
        status = 'completed';
      } else if (stepIndex === currentIndex) {
        status = 'active';
      }
      
      return {
        name: step.name,
        status,
        description: step.description,
        icon: step.icon
      };
    });
  };

  const steps = getWorkflowSteps(currentState);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'active': return 'text-primary';
      default: return 'text-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'bx-check-circle';
      case 'active': return 'bx-time-five';
      default: return 'bx-circle';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">
          <i className="bx bx-flow-chart me-2"></i>
          Application Workflow - {applicationNumber}
        </h6>
      </div>
      <div className="card-body">
        <div className="workflow-timeline">
          {steps.map((step, index) => (
            <div key={step.name} className={`timeline-item ${step.status}`}>
              <div className="d-flex align-items-start">
                <div className={`timeline-marker ${getStatusColor(step.status)}`}>
                  <i className={`bx ${getStatusIcon(step.status)} fs-5`}></i>
                </div>
                <div className="timeline-content ms-3 flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className={`mb-1 ${getStatusColor(step.status)}`}>
                      <i className={`bx ${step.icon} me-2`}></i>
                      {step.name}
                    </h6>
                    {step.status === 'completed' && (
                      <span className="badge bg-success-subtle text-success">
                        <i className="bx bx-check me-1"></i>Complete
                      </span>
                    )}
                    {step.status === 'active' && (
                      <span className="badge bg-primary-subtle text-primary">
                        <i className="bx bx-time me-1"></i>In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-muted small mb-0">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`timeline-connector ${step.status === 'completed' ? 'completed' : ''}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowSummary;