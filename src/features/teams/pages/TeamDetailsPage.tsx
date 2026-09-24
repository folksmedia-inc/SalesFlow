import { EntityDetailsPage } from '@/components/entity/EntityDetailsPage'
import { teamConfig } from '../config/teamConfig'

export default function TeamDetailsPage() {
  return <EntityDetailsPage config={teamConfig} />
}
