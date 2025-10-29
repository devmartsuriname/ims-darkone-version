/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals and custom performance metrics
 */

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

type MetricCallback = (metric: PerformanceMetric) => void

/**
 * Report Core Web Vitals to callback
 * Uses web-vitals library pattern for consistency
 */
export function reportWebVitals(callback: MetricCallback) {
  // Cumulative Layout Shift (CLS)
  measureCLS(callback)
  
  // Largest Contentful Paint (LCP)
  measureLCP(callback)
  
  // First Input Delay (FID)
  measureFID(callback)
  
  // Time to First Byte (TTFB)
  measureTTFB(callback)
  
  // First Contentful Paint (FCP)
  measureFCP(callback)
}

/**
 * Measure Cumulative Layout Shift
 * Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25
 */
function measureCLS(callback: MetricCallback) {
  let clsValue = 0
  let clsEntries: LayoutShift[] = []

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LayoutShift[]) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value
        clsEntries.push(entry)
      }
    }
  })

  observer.observe({ type: 'layout-shift', buffered: true })

  // Report on visibility change (when user leaves page)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      observer.disconnect()
      
      callback({
        name: 'CLS',
        value: clsValue,
        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
        timestamp: Date.now()
      })
    }
  })
}

/**
 * Measure Largest Contentful Paint
 * Good: < 2500ms, Needs Improvement: 2500-4000ms, Poor: > 4000ms
 */
function measureLCP(callback: MetricCallback) {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number; loadTime: number }
    
    const value = lastEntry.renderTime || lastEntry.loadTime
    
    callback({
      name: 'LCP',
      value,
      rating: value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor',
      timestamp: Date.now()
    })
  })

  observer.observe({ type: 'largest-contentful-paint', buffered: true })
}

/**
 * Measure First Input Delay
 * Good: < 100ms, Needs Improvement: 100-300ms, Poor: > 300ms
 */
function measureFID(callback: MetricCallback) {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const firstInput = entries[0] as PerformanceEventTiming
    
    const value = firstInput.processingStart - firstInput.startTime
    
    callback({
      name: 'FID',
      value,
      rating: value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor',
      timestamp: Date.now()
    })
    
    observer.disconnect()
  })

  observer.observe({ type: 'first-input', buffered: true })
}

/**
 * Measure Time to First Byte
 * Good: < 800ms, Needs Improvement: 800-1800ms, Poor: > 1800ms
 */
function measureTTFB(callback: MetricCallback) {
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  
  if (navigationEntry) {
    const value = navigationEntry.responseStart - navigationEntry.requestStart
    
    callback({
      name: 'TTFB',
      value,
      rating: value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor',
      timestamp: Date.now()
    })
  }
}

/**
 * Measure First Contentful Paint
 * Good: < 1800ms, Needs Improvement: 1800-3000ms, Poor: > 3000ms
 */
function measureFCP(callback: MetricCallback) {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
    
    if (fcpEntry) {
      const value = fcpEntry.startTime
      
      callback({
        name: 'FCP',
        value,
        rating: value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor',
        timestamp: Date.now()
      })
    }
  })

  observer.observe({ type: 'paint', buffered: true })
}

/**
 * Custom metric: Page Load Time
 */
export function measurePageLoadTime(callback: MetricCallback) {
  window.addEventListener('load', () => {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigationEntry) {
      const value = navigationEntry.loadEventEnd - navigationEntry.fetchStart
      
      callback({
        name: 'PageLoad',
        value,
        rating: value < 3000 ? 'good' : value < 5000 ? 'needs-improvement' : 'poor',
        timestamp: Date.now()
      })
    }
  })
}

/**
 * Custom metric: Time to Interactive
 */
export function measureTimeToInteractive(callback: MetricCallback) {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    
    callback({
      name: 'TTI',
      value: lastEntry.startTime,
      rating: lastEntry.startTime < 3800 ? 'good' : lastEntry.startTime < 7300 ? 'needs-improvement' : 'poor',
      timestamp: Date.now()
    })
  })

  observer.observe({ type: 'longtask', buffered: true })
}

/**
 * Log metrics to console (development)
 */
export function logMetric(metric: PerformanceMetric) {
  const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
  console.log(`${emoji} ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`)
}

/**
 * Send metrics to analytics endpoint
 */
export async function sendMetricsToAnalytics(metrics: PerformanceMetric[]) {
  try {
    // Store metrics in localStorage for now
    const stored = localStorage.getItem('performance_metrics') || '[]'
    const allMetrics = JSON.parse(stored)
    allMetrics.push(...metrics)
    
    // Keep only last 100 metrics
    const recentMetrics = allMetrics.slice(-100)
    localStorage.setItem('performance_metrics', JSON.stringify(recentMetrics))
    
    // TODO: Send to external analytics service (Sentry, Google Analytics, etc.)
    console.log('Performance metrics stored:', metrics)
  } catch (error) {
    console.error('Failed to store performance metrics:', error)
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): { 
  averages: Record<string, number>
  ratings: Record<string, { good: number; needsImprovement: number; poor: number }>
} {
  try {
    const stored = localStorage.getItem('performance_metrics') || '[]'
    const metrics = JSON.parse(stored) as PerformanceMetric[]
    
    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = { values: [], ratings: { good: 0, needsImprovement: 0, poor: 0 } }
      }
      acc[metric.name].values.push(metric.value)
      if (metric.rating === 'needs-improvement') {
        acc[metric.name].ratings.needsImprovement++
      } else {
        acc[metric.name].ratings[metric.rating]++
      }
      return acc
    }, {} as Record<string, { values: number[]; ratings: Record<string, number> }>)
    
    const averages: Record<string, number> = {}
    const ratings: Record<string, { good: number; needsImprovement: number; poor: number }> = {}
    
  Object.entries(grouped).forEach(([name, data]) => {
    averages[name] = Math.round(data.values.reduce((a, b) => a + b, 0) / data.values.length)
    ratings[name] = {
      good: data.ratings.good || 0,
      needsImprovement: data.ratings.needsImprovement || 0,
      poor: data.ratings.poor || 0
    }
  })
    
    return { averages, ratings }
  } catch (error) {
    console.error('Failed to get performance summary:', error)
    return { averages: {}, ratings: {} }
  }
}

/**
 * Initialize Web Vitals tracking
 */
export const initWebVitals = () => {
  if (import.meta.env.PROD) {
    const metrics: PerformanceMetric[] = []
    
    reportWebVitals((metric) => {
      logMetric(metric)
      metrics.push(metric)
    })
    
    measurePageLoadTime((metric) => {
      logMetric(metric)
      metrics.push(metric)
    })
    
    measureTimeToInteractive((metric) => {
      logMetric(metric)
      metrics.push(metric)
    })
    
    // Send metrics after all are collected
    setTimeout(() => {
      sendMetricsToAnalytics(metrics)
    }, 10000) // 10 seconds after page load
  }
}
