import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface EnhancedTooltipProps {
  content: string | React.ReactNode;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'info' | 'warning' | 'success' | 'danger';
  delay?: { show: number; hide: number };
}

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  content,
  children,
  placement = 'top',
  variant = 'info',
  delay = { show: 300, hide: 150 }
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'warning': return 'bg-warning text-dark';
      case 'success': return 'bg-success';
      case 'danger': return 'bg-danger';
      default: return 'bg-info';
    }
  };

  return (
    <OverlayTrigger
      placement={placement}
      delay={delay}
      overlay={
        <Tooltip id={`tooltip-${Math.random()}`} className={getVariantClass()}>
          {content}
        </Tooltip>
      }
    >
      {children}
    </OverlayTrigger>
  );
};

interface HelpIconProps {
  content: string | React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'danger';
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const HelpIcon: React.FC<HelpIconProps> = ({
  content,
  variant = 'info',
  placement = 'top'
}) => {
  return (
    <EnhancedTooltip content={content} variant={variant} placement={placement}>
      <i className="bi bi-question-circle ms-1 text-muted" style={{ cursor: 'help' }}></i>
    </EnhancedTooltip>
  );
};

export default EnhancedTooltip;
