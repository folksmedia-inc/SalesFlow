import { Card, Descriptions } from 'antd'
import type { Lookups } from '@/hooks/useLookups'
import type { DetailSectionConfig } from './types'

interface DetailSectionsProps<T> {
  sections: DetailSectionConfig<T>[]
  record: T
  lookups: Lookups
}

/** Renders detail sections as labelled description cards. */
export function DetailSections<T>({ sections, record, lookups }: DetailSectionsProps<T>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sections.map((section) => (
        <Card key={section.title} title={section.title} size="small">
          <Descriptions
            column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
            layout="vertical"
            size="small"
            colon={false}
            items={section.fields.map((field) => ({
              key: field.label,
              label: field.label,
              span: field.span,
              children: field.render(record, lookups) ?? '—',
            }))}
          />
        </Card>
      ))}
    </div>
  )
}
