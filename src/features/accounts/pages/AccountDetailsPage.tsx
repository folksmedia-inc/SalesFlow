import { EntityDetailsPage } from '@/components/entity/EntityDetailsPage'
import { accountConfig } from '../config/accountConfig'

export default function AccountDetailsPage() {
  return <EntityDetailsPage config={accountConfig} />
}
