import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { DEFAULT_REPORT, isReportKey, type ReportKey } from '../config/reportTypes'

const FILTER_PREFIX = 'f.'

export type ReportFilterValues = Record<string, string[]>

export interface ReportParams {
  report: ReportKey
  filters: ReportFilterValues
  setReport: (report: ReportKey) => void
  setFilter: (key: string, values: string[]) => void
  clearFilters: () => void
}

/**
 * Report selection and report-specific filters live in the URL so a report
 * can be bookmarked or shared:  ?report=tasks&f.status=In%20Progress,Not%20Started
 */
export function useReportParams(): ReportParams {
  const [params, setParams] = useSearchParams()
  const rawReport = params.get('report')
  const report = isReportKey(rawReport) ? rawReport : DEFAULT_REPORT

  const filters = useMemo(() => {
    const values: ReportFilterValues = {}
    params.forEach((value, key) => {
      if (key.startsWith(FILTER_PREFIX) && value) values[key.slice(FILTER_PREFIX.length)] = value.split(',')
    })
    return values
  }, [params])

  const setReport = useCallback((next: ReportKey) => setParams({ report: next }), [setParams])

  const setFilter = useCallback(
    (key: string, values: string[]) =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (values.length) next.set(`${FILTER_PREFIX}${key}`, values.join(','))
          else next.delete(`${FILTER_PREFIX}${key}`)
          return next
        },
        { replace: true },
      ),
    [setParams],
  )

  const clearFilters = useCallback(
    () =>
      setParams(
        (current) => {
          const next = new URLSearchParams()
          const reportParam = current.get('report')
          if (reportParam) next.set('report', reportParam)
          return next
        },
        { replace: true },
      ),
    [setParams],
  )

  return { report, filters, setReport, setFilter, clearFilters }
}
