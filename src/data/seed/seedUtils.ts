/** Helpers for generating seed data relative to "now", so the demo always looks current. */

const DAY_MS = 24 * 60 * 60 * 1000

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function daysAgo(days: number): string {
  return isoDate(new Date(Date.now() - days * DAY_MS))
}

export function daysFromNow(days: number): string {
  return daysAgo(-days)
}

export function monthsAgo(months: number, dayOfMonth = 10): string {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() - months)
  date.setDate(Math.min(dayOfMonth, 28))
  return isoDate(date)
}

export function timestampAgo({ days = 0, hours = 0, minutes = 0 }: { days?: number; hours?: number; minutes?: number }): string {
  return new Date(Date.now() - days * DAY_MS - hours * 3_600_000 - minutes * 60_000).toISOString()
}

export function toEmail(firstName: string, lastName: string, domain = 'adminhub.dev'): string {
  const clean = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z]/g, '')
      .toLowerCase()
  return `${clean(firstName)}.${clean(lastName)}@${domain}`
}

export interface OfficeAddress {
  address: string
  city: string
  state: string
  country: string
  postalCode: string
}

export const OFFICE_ADDRESSES: Record<string, OfficeAddress> = {
  'San Francisco, CA': { address: '415 Mission St', city: 'San Francisco', state: 'CA', country: 'United States', postalCode: '94105' },
  'New York, NY': { address: '1095 Avenue of the Americas', city: 'New York', state: 'NY', country: 'United States', postalCode: '10036' },
  'Austin, TX': { address: '500 W 2nd St', city: 'Austin', state: 'TX', country: 'United States', postalCode: '78701' },
  'Chicago, IL': { address: '222 W Merchandise Mart Plaza', city: 'Chicago', state: 'IL', country: 'United States', postalCode: '60654' },
  'Seattle, WA': { address: '929 108th Ave NE', city: 'Bellevue', state: 'WA', country: 'United States', postalCode: '98004' },
  'London, UK': { address: '110 Bishopsgate', city: 'London', state: 'Greater London', country: 'United Kingdom', postalCode: 'EC2N 4AY' },
  'Toronto, CA': { address: '10 Bay St', city: 'Toronto', state: 'ON', country: 'Canada', postalCode: 'M5J 2R8' },
  Remote: { address: '1801 Wewatta St', city: 'Denver', state: 'CO', country: 'United States', postalCode: '80202' },
}
