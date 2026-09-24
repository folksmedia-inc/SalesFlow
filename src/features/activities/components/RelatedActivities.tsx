import { Button, Card } from 'antd'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useEntityList } from '@/hooks/useEntityData'
import type { RelatedRef } from '@/types/models'
import { ActivityTimeline } from './ActivityTimeline'
import { LogActivityModal } from './LogActivityModal'

/** Activity tab for a record's details page. */
export function RelatedActivities({ related }: { related: RelatedRef }) {
  const activities = useEntityList('activities')
  const [logging, setLogging] = useState(false)
  const items = useMemo(
    () => activities.filter((activity) => activity.related?.type === related.type && activity.related.id === related.id),
    [activities, related.id, related.type],
  )

  return (
    <Card
      title={`Activity (${items.length})`}
      extra={
        <Button icon={<Plus size={16} />} onClick={() => setLogging(true)}>
          Log Activity
        </Button>
      }
    >
      <ActivityTimeline activities={items} hideRelated />
      <LogActivityModal open={logging} onClose={() => setLogging(false)} related={related} />
    </Card>
  )
}
