import { EntityFormPage } from '@/components/entity/EntityFormPage'
import { employeeConfig } from '../config/employeeConfig'

/** Shared by /employees/new and /employees/:id/edit. */
export default function EmployeeFormPage() {
  return <EntityFormPage config={employeeConfig} />
}
