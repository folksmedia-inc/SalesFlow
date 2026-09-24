import { EntityDetailsPage } from '@/components/entity/EntityDetailsPage'
import { customerConfig } from '../config/customerConfig'

export default function CustomerDetailsPage() {
  return <EntityDetailsPage config={customerConfig} />
}
