import React from 'react'
import { useLayoutContext } from '@/context/useLayoutContext'
import useViewPort from '@/hooks/useViewPort'

// Responsive wrapper component for conditional rendering
interface ResponsiveWrapperProps {
  children: React.ReactNode
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  showAbove?: boolean // Show component above breakpoint
  showBelow?: boolean // Show component below breakpoint
  className?: string
}

const BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  breakpoint = 'md',
  showAbove = false,
  showBelow = false,
  className = ''
}) => {
  const { width } = useViewPort()
  const breakpointWidth = BREAKPOINTS[breakpoint]
  
  const shouldShow = showAbove 
    ? width >= breakpointWidth 
    : showBelow 
    ? width < breakpointWidth 
    : true
  
  if (!shouldShow) return null
  
  return <div className={className}>{children}</div>
}

// Mobile-specific components
export const MobileOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <ResponsiveWrapper showBelow breakpoint="md" className={className}>
    {children}
  </ResponsiveWrapper>
)

export const DesktopOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <ResponsiveWrapper showAbove breakpoint="md" className={className}>
    {children}
  </ResponsiveWrapper>
)

export const TabletOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const { width } = useViewPort()
  const shouldShow = width >= 768 && width < 1200
  
  if (!shouldShow) return null
  
  return <div className={className}>{children}</div>
}

// Responsive navigation helper
export const ResponsiveNavigation: React.FC<{
  mobileContent: React.ReactNode
  desktopContent: React.ReactNode
  className?: string
}> = ({ mobileContent, desktopContent, className = '' }) => (
  <div className={className}>
    <MobileOnly>{mobileContent}</MobileOnly>
    <DesktopOnly>{desktopContent}</DesktopOnly>
  </div>
)

// Enhanced responsive button component
interface ResponsiveButtonProps {
  children: React.ReactNode
  mobileText?: string
  desktopText?: string
  mobileIcon?: string
  desktopIcon?: string
  className?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  mobileText,
  desktopText,
  mobileIcon,
  desktopIcon,
  className = '',
  onClick,
  disabled = false,
  variant = 'primary'
}) => {
  const { width } = useViewPort()
  const isMobile = width < 768
  
  const buttonContent = isMobile 
    ? (mobileText || children)
    : (desktopText || children)
  
  return (
    <button 
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {isMobile && mobileIcon && <i className={`${mobileIcon} me-1`} />}
      {!isMobile && desktopIcon && <i className={`${desktopIcon} me-2`} />}
      {buttonContent}
    </button>
  )
}

// Responsive grid helper
interface ResponsiveGridProps {
  children: React.ReactNode
  mobileColumns?: 1 | 2 | 3 | 4
  tabletColumns?: 1 | 2 | 3 | 4 | 6
  desktopColumns?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = 'md',
  className = ''
}) => {
  const gapClass = gap === 'sm' ? 'g-2' : gap === 'lg' ? 'g-4' : 'g-3'
  
  return (
    <div className={`row ${gapClass} ${className}`}>
      {React.Children.map(children, (child, index) => (
        <div 
          key={index}
          className={`col-${12 / mobileColumns} col-md-${12 / tabletColumns} col-xl-${12 / desktopColumns}`}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Responsive table wrapper
interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
  horizontalScroll?: boolean
  stackOnMobile?: boolean
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className = '',
  horizontalScroll = true,
  stackOnMobile = false
}) => {
  const wrapperClass = horizontalScroll 
    ? 'table-responsive table-enhanced-responsive'
    : ''
  
  const tableClass = stackOnMobile 
    ? 'table table-stack-mobile'
    : 'table'
  
  return (
    <div className={wrapperClass}>
      <table className={`${tableClass} ${className}`}>
        {children}
      </table>
    </div>
  )
}

// Custom hook for responsive breakpoints
export const useResponsive = () => {
  const { width } = useViewPort()
  
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1200,
    isDesktop: width >= 1200,
    isSmallMobile: width < 576,
    isLargeMobile: width >= 576 && width < 768,
    width,
    breakpoint: width < 576 ? 'xs' 
      : width < 768 ? 'sm'
      : width < 992 ? 'md'
      : width < 1200 ? 'lg'
      : width < 1400 ? 'xl'
      : 'xxl'
  }
}

// Responsive layout context
export interface ResponsiveLayoutProps {
  sidebar?: 'hidden' | 'collapsed' | 'full'
  navigation?: 'top' | 'side' | 'both'
  density?: 'comfortable' | 'compact' | 'spacious'
}

export const useResponsiveLayout = () => {
  const { width } = useViewPort()
  const { menu, changeMenu } = useLayoutContext()
  
  React.useEffect(() => {
    // Auto-adjust sidebar based on screen size
    if (width < 768 && menu.size !== 'hidden') {
      changeMenu.size('hidden')
    } else if (width >= 768 && width < 1200 && menu.size === 'hidden') {
      changeMenu.size('condensed')
    } else if (width >= 1200 && menu.size === 'condensed') {
      changeMenu.size('default')
    }
  }, [width, menu.size, changeMenu])
  
  const getLayout = (): ResponsiveLayoutProps => {
    if (width < 768) {
      return {
        sidebar: 'hidden',
        navigation: 'top',
        density: 'compact'
      }
    } else if (width < 1200) {
      return {
        sidebar: 'collapsed',
        navigation: 'both',
        density: 'comfortable'
      }
    } else {
      return {
        sidebar: 'full',
        navigation: 'both',
        density: 'spacious'
      }
    }
  }
  
  return {
    layout: getLayout(),
    isMobileLayout: width < 768,
    isTabletLayout: width >= 768 && width < 1200,
    isDesktopLayout: width >= 1200
  }
}