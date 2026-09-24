import { App, Avatar, Button, Card, Input, Typography } from 'antd'
import { Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppSelector } from '@/app/hooks'
import { avatarColor } from '@/utils/avatar'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useEntityCrud, useEntityList } from '@/hooks/useEntityData'
import { selectCurrentUserName } from '@/store/authSlice'
import type { RelatedRef } from '@/types/models'
import { formatDateTime, formatRelativeTime, getInitials } from '@/utils/format'
import styles from './RelatedNotes.module.scss'

const MAX_LENGTH = 2000

/** Notes tab: add, read and delete notes attached to a record. */
export function RelatedNotes({ related }: { related: RelatedRef }) {
  const { message } = App.useApp()
  const notes = useEntityList('notes')
  const crud = useEntityCrud('notes')
  const authorName = useAppSelector(selectCurrentUserName)
  const confirmDelete = useConfirmDelete()
  const [draft, setDraft] = useState('')

  const items = useMemo(() => notes.filter((note) => note.related.type === related.type && note.related.id === related.id), [notes, related.id, related.type])

  const addNote = () => {
    const content = draft.trim()
    if (!content) return
    crud.create({ content, authorName, related })
    setDraft('')
    message.success('Note added.')
  }

  return (
    <Card title={`Notes (${items.length})`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        <Input.TextArea
          aria-label="New note"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a note…"
          autoSize={{ minRows: 3, maxRows: 8 }}
          maxLength={MAX_LENGTH}
          showCount
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) addNote()
          }}
        />
        <Button type="primary" onClick={addNote} disabled={!draft.trim()} style={{ alignSelf: 'flex-end' }}>
          Add Note
        </Button>
      </div>
      {items.length === 0 ? (
        <EmptyState title="No notes yet" description="Notes you add will be visible to your team." compact />
      ) : (
        <ul className={styles.list}>
          {items.map((note) => (
            <li key={note.id} className={styles.note}>
              <Avatar style={{ background: avatarColor(note.authorName), flexShrink: 0 }}>{getInitials(note.authorName)}</Avatar>
              <div className={styles.body}>
                <div className={styles.header}>
                  <span className={styles.author}>{note.authorName}</span>
                  <Typography.Text type="secondary" className={styles.time} title={formatDateTime(note.createdAt)}>
                    {formatRelativeTime(note.createdAt)}
                  </Typography.Text>
                  <Button
                    type="text"
                    size="small"
                    danger
                    aria-label="Delete note"
                    icon={<Trash2 size={14} />}
                    className={styles.delete}
                    onClick={() => confirmDelete({ entityLabel: 'Note', name: 'this note', onConfirm: () => crud.remove(note.id) })}
                  />
                </div>
                <p className={styles.content}>{note.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
