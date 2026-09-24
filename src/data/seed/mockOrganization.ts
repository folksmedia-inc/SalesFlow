import type { Organization } from '@/types/models'

export function createSeedOrganization(): Organization {
  return {
    name: 'Adcuratio Cloud',
    legalName: 'Adcuratio Cloud Inc.',
    industry: 'Technology',
    timezone: 'America/Los_Angeles',
    website: 'https://www.adminhub.dev',
    phone: '+1 (415) 555-0100',
    email: 'hello@adminhub.dev',
    address: '415 Mission St, Floor 20',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    postalCode: '94105',
    fiscalYearStart: 'January',
  }
}
