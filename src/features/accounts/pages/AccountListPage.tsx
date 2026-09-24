import { EntityListPage } from '@/components/entity/EntityListPage'
import { accountConfig } from '../config/accountConfig'

export default function AccountListPage() {
  return <EntityListPage config={accountConfig} />
}
