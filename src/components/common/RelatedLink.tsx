import { Link } from 'react-router'
import { useLookups } from '@/hooks/useLookups'
import { relatedTypeLabel } from '@/hooks/useRelatedOptions'
import type { RelatedRef } from '@/types/models'

/** "Customer · Acme" style link to a related record. */
export function RelatedLink({ related, showType = true }: { related: RelatedRef | null; showType?: boolean }) {
  const lookups = useLookups()
  if (!related) return <span style={{ color: 'var(--app-text-tertiary)' }}>—</span>
  const path = lookups.relatedPath(related)
  const name = lookups.relatedName(related)
  return (
    <span>
      {showType && <span style={{ color: 'var(--app-text-secondary)' }}>{relatedTypeLabel(related.type)} · </span>}
      {path ? (
        <Link to={path} onClick={(event) => event.stopPropagation()}>
          {name}
        </Link>
      ) : (
        name
      )}
    </span>
  )
}
