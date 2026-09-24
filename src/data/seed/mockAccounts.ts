import type { Account, AccountStatus, Industry } from '@/types/models'
import { EMPLOYEE_IDS } from './mockEmployees'
import { timestampAgo } from './seedUtils'

type AccountSeed = [name: string, industry: Industry, domain: string, ownerIndex: number, employees: number, revenue: number, status: AccountStatus, city: string, country: string]

const ACCOUNTS: AccountSeed[] = [
  ['Acme Corporation', 'Manufacturing', 'acme.com', 15, 5200, 840_000_000, 'Active', 'Detroit', 'United States'],
  ['Globex Industries', 'Energy', 'globex.com', 16, 12_400, 2_300_000_000, 'Active', 'Houston', 'United States'],
  ['Initech', 'Technology', 'initech.io', 15, 860, 96_000_000, 'Active', 'Austin', 'United States'],
  ['Umbrella Health', 'Healthcare', 'umbrellahealth.com', 16, 3400, 510_000_000, 'Prospect', 'Boston', 'United States'],
  ['Stark Retail Group', 'Retail', 'starkretail.com', 14, 18_000, 3_100_000_000, 'Active', 'New York', 'United States'],
  ['Wayne Financial', 'Finance', 'waynefinancial.com', 14, 7600, 1_450_000_000, 'Active', 'Chicago', 'United States'],
  ['Northwind Traders', 'Logistics', 'northwind.com', 19, 1150, 180_000_000, 'Inactive', 'Seattle', 'United States'],
  ['Contoso Media', 'Media', 'contoso.media', 17, 640, 72_000_000, 'Prospect', 'Los Angeles', 'United States'],
  ['Blue Harbor Hotels', 'Hospitality', 'blueharbor.com', 16, 2900, 390_000_000, 'Active', 'Miami', 'United States'],
  ['Evergreen University', 'Education', 'evergreen.edu', 15, 4100, 620_000_000, 'Active', 'Portland', 'United States'],
  ['Pinnacle Analytics', 'Technology', 'pinnacle.ai', 17, 310, 41_000_000, 'Prospect', 'Toronto', 'Canada'],
  ['Summit Logistics', 'Logistics', 'summitlogistics.co.uk', 19, 2200, 265_000_000, 'Active', 'London', 'United Kingdom'],
]

export const ACCOUNT_IDS: readonly string[] = ACCOUNTS.map((_, index) => `acc_${String(index + 1).padStart(3, '0')}`)

export function createSeedAccounts(): Account[] {
  return ACCOUNTS.map(([name, industry, domain, ownerIndex, employeeCount, annualRevenue, status, city, country], index) => {
    const createdAt = timestampAgo({ days: 700 - index * 50 })
    return {
      id: ACCOUNT_IDS[index],
      name,
      industry,
      website: `https://www.${domain}`,
      phone: `+1 (800) 555-${String(3100 + index * 41).slice(-4)}`,
      ownerId: EMPLOYEE_IDS[ownerIndex],
      employeeCount,
      annualRevenue,
      status,
      city,
      country,
      createdAt,
      updatedAt: timestampAgo({ days: index * 4 }),
    }
  })
}
