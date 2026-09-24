import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

/** Formatting helpers shared across the UI. */

export function getFullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`.trim()
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function formatDate(value: string | null | undefined, format = 'MMM D, YYYY'): string {
  return value ? dayjs(value).format(format) : '—'
}

export function formatDateTime(value: string | null | undefined): string {
  return value ? dayjs(value).format('MMM D, YYYY h:mm A') : '—'
}

export function formatRelativeTime(value: string | null | undefined): string {
  return value ? dayjs(value).fromNow() : '—'
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const numberFormatter = new Intl.NumberFormat('en-US')

export function formatCurrency(value: number | null | undefined, compact = false): string {
  if (value === null || value === undefined) return '—'
  return compact ? compactCurrencyFormatter.format(value) : currencyFormatter.format(value)
}

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : numberFormatter.format(value)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`
}
