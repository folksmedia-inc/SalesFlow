import { EntityListPage } from '@/components/entity/EntityListPage'
import { teamConfig } from '../config/teamConfig'

export default function TeamListPage() {
  return <EntityListPage config={teamConfig} />
}
