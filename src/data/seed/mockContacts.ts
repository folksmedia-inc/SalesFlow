import type { Contact } from '@/types/models'
import { ACCOUNT_IDS } from './mockAccounts'
import { CUSTOMER_IDS } from './mockCustomers'
import { EMPLOYEE_IDS } from './mockEmployees'
import { timestampAgo, toEmail } from './seedUtils'

type ContactSeed = [firstName: string, lastName: string, jobTitle: string, accountIndex: number, ownerIndex: number, status?: Contact['status']]

const CONTACTS: ContactSeed[] = [
  ['Wile', 'Coyote', 'Director of Procurement', 0, 15],
  ['Roberta', 'Vance', 'Chief Operating Officer', 0, 15],
  ['Hank', 'Scorpio', 'Chief Executive Officer', 1, 16],
  ['Mindy', 'Simmons', 'VP of Operations', 1, 16],
  ['Bill', 'Lumbergh', 'Division Vice President', 2, 15],
  ['Joanna', 'Park', 'IT Manager', 2, 15, 'Inactive'],
  ['Alice', 'Hartley', 'Chief Medical Information Officer', 3, 16],
  ['Pepper', 'Potts', 'Chief Executive Officer', 4, 14],
  ['Happy', 'Hogan', 'Head of Security', 4, 14],
  ['Lucius', 'Fox', 'Chief Technology Officer', 5, 14],
  ['Selina', 'Marsh', 'Procurement Lead', 5, 14],
  ['Margaret', 'Peacock', 'Logistics Director', 6, 19, 'Inactive'],
  ['Diane', 'Nguyen', 'Head of Partnerships', 7, 17],
  ['Gabriel', 'Torres', 'VP of Guest Experience', 8, 16],
  ['Paula', 'Reyes', 'Revenue Manager', 8, 16],
  ['Eleanor', 'Shaw', 'Provost', 9, 15],
  ['Martin', 'Holt', 'Director of IT Services', 9, 15],
  ['Ravi', 'Shankar', 'Founder & CEO', 10, 17],
  ['Harriet', 'Cole', 'Operations Director', 11, 19],
  ['Ian', 'Whitaker', 'Fleet Manager', 11, 19],
  ['Sofia', 'Lindqvist', 'Finance Controller', 1, 16],
  ['Trevor', 'Banks', 'Store Operations Manager', 4, 14, 'Inactive'],
]

/** Customers whose primary contact appears above (account index → customer index). */
const PRIMARY_CONTACT_CUSTOMER: Record<string, number> = {
  'Wile Coyote': 0, 'Hank Scorpio': 1, 'Bill Lumbergh': 2, 'Alice Hartley': 3, 'Pepper Potts': 4, 'Lucius Fox': 5,
  'Margaret Peacock': 6, 'Diane Nguyen': 7, 'Gabriel Torres': 8, 'Eleanor Shaw': 9, 'Ravi Shankar': 10, 'Harriet Cole': 11,
}

export function createSeedContacts(): Contact[] {
  return CONTACTS.map(([firstName, lastName, jobTitle, accountIndex, ownerIndex, status = 'Active'], index) => {
    const customerIndex = PRIMARY_CONTACT_CUSTOMER[`${firstName} ${lastName}`]
    const domain = ['acme.com', 'globex.com', 'initech.io', 'umbrellahealth.com', 'starkretail.com', 'waynefinancial.com', 'northwind.com', 'contoso.media', 'blueharbor.com', 'evergreen.edu', 'pinnacle.ai', 'summitlogistics.co.uk'][accountIndex]
    const createdAt = timestampAgo({ days: 480 - index * 19 })
    return {
      id: `con_${String(index + 1).padStart(3, '0')}`,
      firstName,
      lastName,
      email: toEmail(firstName, lastName, domain),
      phone: `+1 (646) 555-${String(2000 + index * 71).slice(-4)}`,
      accountId: ACCOUNT_IDS[accountIndex],
      customerId: customerIndex === undefined ? null : CUSTOMER_IDS[customerIndex],
      jobTitle,
      ownerId: EMPLOYEE_IDS[ownerIndex],
      status,
      createdAt,
      updatedAt: timestampAgo({ days: index * 2 }),
    }
  })
}
