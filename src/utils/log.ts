/**
 * ✅ Phase 6: Comprehensive Logging System
 * 
 * Structured logging with levels and groups, controlled by environment variables.
 * 
 * Environment Variables:
 * - VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error' (default: 'info')
 * - VITE_LOG_AUTH: 'true' | 'false' (default: 'true')
 * - VITE_LOG_ROUTE: 'true' | 'false' (default: 'true')
 * - VITE_LOG_SETUP: 'true' | 'false' (default: 'true')
 * - VITE_LOG_WORKFLOW: 'true' | 'false' (default: 'false')
 * - VITE_LOG_CACHE: 'true' | 'false' (default: 'false')
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogGroup = 'AUTH' | 'ROUTE' | 'SETUP' | 'WORKFLOW' | 'CACHE' | 'SYSTEM'

interface LogConfig {
  level: LogLevel
  groups: {
    AUTH: boolean
    ROUTE: boolean
    SETUP: boolean
    WORKFLOW: boolean
    CACHE: boolean
    SYSTEM: boolean
  }
}

// Parse environment variables
const getLogLevel = (): LogLevel => {
  const level = import.meta.env.VITE_LOG_LEVEL?.toLowerCase()
  if (level === 'debug' || level === 'info' || level === 'warn' || level === 'error') {
    return level
  }
  return 'info'
}

const isGroupEnabled = (group: string): boolean => {
  const envVar = import.meta.env[`VITE_LOG_${group}`]
  // Default to true for core groups (AUTH, ROUTE, SETUP), false for others
  if (envVar === undefined) {
    return ['AUTH', 'ROUTE', 'SETUP', 'SYSTEM'].includes(group)
  }
  return envVar === 'true'
}

const config: LogConfig = {
  level: getLogLevel(),
  groups: {
    AUTH: isGroupEnabled('AUTH'),
    ROUTE: isGroupEnabled('ROUTE'),
    SETUP: isGroupEnabled('SETUP'),
    WORKFLOW: isGroupEnabled('WORKFLOW'),
    CACHE: isGroupEnabled('CACHE'),
    SYSTEM: isGroupEnabled('SYSTEM'),
  }
}

// Level priority for filtering
const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Check if a log should be displayed based on level and group
const shouldLog = (level: LogLevel, group: LogGroup): boolean => {
  // Check level priority
  if (levelPriority[level] < levelPriority[config.level]) {
    return false
  }
  
  // Check if group is enabled
  return config.groups[group]
}

// Format log message with timestamp and group
const formatMessage = (group: LogGroup, message: string): string => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
  return `[${timestamp}] [${group}] ${message}`
}

// Core logging functions
const createLogger = (group: LogGroup) => ({
  debug: (message: string, data?: any) => {
    if (shouldLog('debug', group)) {
      console.debug(formatMessage(group, message), data ?? '')
    }
  },
  
  info: (message: string, data?: any) => {
    if (shouldLog('info', group)) {
      console.info(formatMessage(group, message), data ?? '')
    }
  },
  
  warn: (message: string, data?: any) => {
    if (shouldLog('warn', group)) {
      console.warn(formatMessage(group, message), data ?? '')
    }
  },
  
  error: (message: string, data?: any) => {
    if (shouldLog('error', group)) {
      console.error(formatMessage(group, message), data ?? '')
    }
  },
})

// Export group-specific loggers
export const log = {
  auth: createLogger('AUTH'),
  route: createLogger('ROUTE'),
  setup: createLogger('SETUP'),
  workflow: createLogger('WORKFLOW'),
  cache: createLogger('CACHE'),
  system: createLogger('SYSTEM'),
  
  // Utility to check configuration
  getConfig: () => ({ ...config }),
  
  // Utility to enable/disable groups at runtime (for debugging)
  setGroup: (group: LogGroup, enabled: boolean) => {
    config.groups[group] = enabled
  },
}

// Log the configuration on initialization (only in development)
if (import.meta.env.DEV) {
  console.info('📋 [LOG] Configuration:', {
    level: config.level,
    enabledGroups: Object.entries(config.groups)
      .filter(([_, enabled]) => enabled)
      .map(([group]) => group),
  })
}
