import type { DocumentFile, RelatedEntityType } from '@/types/models'
import { ACCOUNT_IDS } from './mockAccounts'
import { CUSTOMER_IDS } from './mockCustomers'
import { DEPARTMENT_IDS } from './mockDepartments'
import { EMPLOYEE_IDS } from './mockEmployees'
import { timestampAgo } from './seedUtils'

type DocumentSeed = [name: string, mimeType: string, sizeKb: number, uploadedBy: string, related: [RelatedEntityType, number] | null, daysAgo: number]

const PDF = 'application/pdf'
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'

const DOCUMENTS: DocumentSeed[] = [
  ['Employment Agreement - John Smith.pdf', PDF, 248, 'Priya Raman', ['employee', 1], 900],
  ['Offer Letter - Noah Fischer.pdf', PDF, 132, 'Laura Sánchez', ['employee', 7], 40],
  ['Performance Review H1 - John Smith.docx', DOCX, 86, 'Daniel Kim', ['employee', 1], 60],
  ['Leave Request - Mei Tanaka.pdf', PDF, 64, 'Priya Raman', ['employee', 4], 14],
  ['Acme Renewal Proposal.pptx', PPTX, 4210, 'Sarah Thompson', ['customer', 0], 6],
  ['Globex Security Questionnaire.xlsx', XLSX, 512, 'Marcus Chen', ['customer', 1], 4],
  ['Initech Master Services Agreement.pdf', PDF, 1830, 'Michael Johnson', ['customer', 2], 210],
  ['Stark Retail QBR Q3.pptx', PPTX, 6120, 'Michael Johnson', ['account', 4], 22],
  ['Wayne Financial Contract Redlines.docx', DOCX, 344, 'Michael Johnson', ['account', 5], 26],
  ['Evergreen Pricing Sheet.xlsx', XLSX, 96, 'Sarah Thompson', ['account', 9], 12],
  ['Engineering Hiring Plan.xlsx', XLSX, 158, 'Daniel Kim', ['department', 0], 35],
  ['Employee Handbook 2026.pdf', PDF, 2940, 'Priya Raman', ['department', 6], 120],
  ['FY Budget Draft.xlsx', XLSX, 720, 'Andrew Clarke', ['department', 7], 9],
  ['Brand Guidelines.pdf', PDF, 8850, 'Rachel Green', ['department', 4], 300],
]

const REF_IDS: Record<string, readonly string[]> = {
  employee: EMPLOYEE_IDS,
  customer: CUSTOMER_IDS,
  account: ACCOUNT_IDS,
  department: DEPARTMENT_IDS,
}

export function createSeedDocuments(): DocumentFile[] {
  return DOCUMENTS.map(([name, mimeType, sizeKb, uploadedBy, related, days], index) => {
    const createdAt = timestampAgo({ days, hours: index * 2 })
    return {
      id: `doc_${String(index + 1).padStart(3, '0')}`,
      name,
      mimeType,
      size: sizeKb * 1024,
      uploadedBy,
      related: related ? { type: related[0], id: REF_IDS[related[0]][related[1]] } : null,
      dataUrl: null,
      createdAt,
      updatedAt: createdAt,
    }
  })
}
