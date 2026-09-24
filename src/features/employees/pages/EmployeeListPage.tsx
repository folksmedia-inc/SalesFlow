import { EntityListPage } from '@/components/entity/EntityListPage'
import { employeeConfig } from '../config/employeeConfig'

export default function EmployeeListPage() {
  return <EntityListPage config={employeeConfig} />
}
