import { getFileKind } from '../utils/documentFiles'

export function FileName({ name, mimeType }: { name: string; mimeType: string }) {
  const { icon: Icon, color } = getFileKind(mimeType, name)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <span
        aria-hidden="true"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: `${color}1a`, color, flexShrink: 0 }}
      >
        <Icon size={16} />
      </span>
      <span style={{ fontWeight: 500, color: 'var(--app-text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
    </span>
  )
}
