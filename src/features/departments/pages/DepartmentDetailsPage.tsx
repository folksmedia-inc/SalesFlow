import { EntityDetailsPage } from '@/components/entity/EntityDetailsPage'
import { departmentConfig } from '../config/departmentConfig'
import { DepartmentStats } from '../components/DepartmentStats'

export default function DepartmentDetailsPage() {
  return <EntityDetailsPage config={departmentConfig} overviewPrefix={<DepartmentStats />} />
}
