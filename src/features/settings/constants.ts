export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const ZONES = [
  ['Pacific/Honolulu', 'Hawaii'],
  ['America/Anchorage', 'Alaska'],
  ['America/Los_Angeles', 'Pacific Time (US & Canada)'],
  ['America/Denver', 'Mountain Time (US & Canada)'],
  ['America/Phoenix', 'Arizona'],
  ['America/Chicago', 'Central Time (US & Canada)'],
  ['America/New_York', 'Eastern Time (US & Canada)'],
  ['America/Toronto', 'Toronto'],
  ['America/Mexico_City', 'Mexico City'],
  ['America/Sao_Paulo', 'São Paulo'],
  ['UTC', 'Coordinated Universal Time'],
  ['Europe/London', 'London'],
  ['Europe/Dublin', 'Dublin'],
  ['Europe/Paris', 'Paris'],
  ['Europe/Berlin', 'Berlin'],
  ['Europe/Madrid', 'Madrid'],
  ['Europe/Amsterdam', 'Amsterdam'],
  ['Africa/Johannesburg', 'Johannesburg'],
  ['Europe/Istanbul', 'Istanbul'],
  ['Asia/Dubai', 'Dubai'],
  ['Asia/Kolkata', 'India (Kolkata)'],
  ['Asia/Singapore', 'Singapore'],
  ['Asia/Shanghai', 'China (Shanghai)'],
  ['Asia/Tokyo', 'Tokyo'],
  ['Australia/Sydney', 'Sydney'],
  ['Pacific/Auckland', 'Auckland'],
] as const

function utcOffset(timeZone: string): string {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find((item) => item.type === 'timeZoneName')
    const offset = part?.value.replace('GMT', '') ?? ''
    return `UTC${offset || '+0'}`
  } catch {
    return 'UTC'
  }
}

/** Common IANA time zones with their current UTC offset, e.g. "(UTC-7) Pacific Time — America/Los_Angeles". */
export const TIMEZONES = ZONES.map(([value, name]) => ({ value, label: `(${utcOffset(value)}) ${name} — ${value}` }))
