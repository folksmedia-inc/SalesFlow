import { EntityListPage } from '@/components/entity/EntityListPage'
import { customerConfig } from '../config/customerConfig'

export default function CustomerListPage() {
  return <EntityListPage config={customerConfig} />
}
