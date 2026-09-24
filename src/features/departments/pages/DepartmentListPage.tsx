import { EntityListPage } from '@/components/entity/EntityListPage'
import { departmentConfig } from '../config/departmentConfig'

export default function DepartmentListPage() {
  return <EntityListPage config={departmentConfig} />
}
