import { EntityFormPage } from '@/components/entity/EntityFormPage'
import { customerConfig } from '../config/customerConfig'

/** Shared by /customers/new and /customers/:id/edit. */
export default function CustomerFormPage() {
  return <EntityFormPage config={customerConfig} />
}
