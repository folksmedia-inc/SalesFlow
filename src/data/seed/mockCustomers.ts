import type { Customer, CustomerStatus, Industry } from '@/types/models'
import { ACCOUNT_IDS } from './mockAccounts'
import { EMPLOYEE_IDS } from './mockEmployees'
import { timestampAgo, toEmail } from './seedUtils'

type CustomerSeed = [name: string, company: string, industry: Industry, domain: string, ownerIndex: number, status: CustomerStatus, accountIndex: number | null, value: number, city: string, country: string]

const CUSTOMERS: CustomerSeed[] = [
  ['Wile Coyote', 'Acme Corporation', 'Manufacturing', 'acme.com', 15, 'Active', 0, 420_000, 'Detroit', 'United States'],
  ['Hank Scorpio', 'Globex Industries', 'Energy', 'globex.com', 16, 'Active', 1, 1_250_000, 'Houston', 'United States'],
  ['Bill Lumbergh', 'Initech', 'Technology', 'initech.io', 15, 'Active', 2, 185_000, 'Austin', 'United States'],
  ['Alice Hartley', 'Umbrella Health', 'Healthcare', 'umbrellahealth.com', 16, 'Prospect', 3, 0, 'Boston', 'United States'],
  ['Pepper Potts', 'Stark Retail Group', 'Retail', 'starkretail.com', 14, 'Active', 4, 960_000, 'New York', 'United States'],
  ['Lucius Fox', 'Wayne Financial', 'Finance', 'waynefinancial.com', 14, 'Active', 5, 780_000, 'Chicago', 'United States'],
  ['Margaret Peacock', 'Northwind Traders', 'Logistics', 'northwind.com', 19, 'Churned', 6, 92_000, 'Seattle', 'United States'],
  ['Diane Nguyen', 'Contoso Media', 'Media', 'contoso.media', 17, 'Lead', 7, 0, 'Los Angeles', 'United States'],
  ['Gabriel Torres', 'Blue Harbor Hotels', 'Hospitality', 'blueharbor.com', 16, 'Active', 8, 310_000, 'Miami', 'United States'],
  ['Eleanor Shaw', 'Evergreen University', 'Education', 'evergreen.edu', 15, 'Active', 9, 240_000, 'Portland', 'United States'],
  ['Ravi Shankar', 'Pinnacle Analytics', 'Technology', 'pinnacle.ai', 17, 'Prospect', 10, 0, 'Toronto', 'Canada'],
  ['Harriet Cole', 'Summit Logistics', 'Logistics', 'summitlogistics.co.uk', 19, 'Active', 11, 205_000, 'London', 'United Kingdom'],
  ['Victor Alvarez', 'Brightline Clinics', 'Healthcare', 'brightline.health', 16, 'Lead', null, 0, 'Phoenix', 'United States'],
  ['Naomi Fletcher', 'Copperleaf Energy', 'Energy', 'copperleaf.energy', 17, 'Prospect', null, 0, 'Denver', 'United States'],
  ['Owen Gallagher', 'Harborview Retail', 'Retail', 'harborview.com', 15, 'Lead', null, 0, 'San Diego', 'United States'],
  ['Sienna Brooks', 'Lumen Learning Co.', 'Education', 'lumenlearning.co', 19, 'Churned', null, 58_000, 'Minneapolis', 'United States'],
]

export const CUSTOMER_IDS: readonly string[] = CUSTOMERS.map((_, index) => `cus_${String(index + 1).padStart(3, '0')}`)

export function createSeedCustomers(): Customer[] {
  return CUSTOMERS.map(([name, company, industry, domain, ownerIndex, status, accountIndex, lifetimeValue, city, country], index) => {
    const [firstName = name, lastName = ''] = name.split(' ')
    const createdAt = timestampAgo({ days: Math.max(3, 520 - index * 34), hours: index * 2 })
    return {
      id: CUSTOMER_IDS[index],
      name,
      company,
      email: toEmail(firstName, lastName, domain),
      phone: `+1 (${[313, 713, 512, 617, 212, 312][index % 6]}) 555-${String(4400 + index * 53).slice(-4)}`,
      industry,
      ownerId: EMPLOYEE_IDS[ownerIndex],
      accountId: accountIndex === null ? null : ACCOUNT_IDS[accountIndex],
      status,
      website: `https://www.${domain}`,
      city,
      country,
      lifetimeValue,
      createdAt,
      updatedAt: timestampAgo({ days: index * 3 }),
    }
  })
}
