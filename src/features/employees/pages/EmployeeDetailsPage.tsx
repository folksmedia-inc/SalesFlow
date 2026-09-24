import { EntityDetailsPage } from '@/components/entity/EntityDetailsPage'
import { employeeConfig } from '../config/employeeConfig'

export default function EmployeeDetailsPage() {
  return <EntityDetailsPage config={employeeConfig} />
}
