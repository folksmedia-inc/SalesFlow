import { Select, Upload } from 'antd'
import { UploadCloud } from 'lucide-react'
import { useId } from 'react'
import { useOptions } from '@/components/entity/useOptions'
import { decodeRelated } from '@/hooks/useRelatedOptions'
import { formatFileSize } from '@/utils/format'
import { useDocumentUpload } from '../hooks/useDocumentUpload'
import { MAX_STORED_FILE_BYTES, MAX_UPLOAD_BYTES } from '../utils/documentFiles'
import styles from './DocumentLibrary.module.scss'

interface DocumentUploadPanelProps {
  /** Encoded related record (`"<type>:<id>"`) new uploads are linked to. */
  relatedValue: string | null
  onRelatedChange: (value: string | null) => void
}

/** Drag-and-drop upload area with an optional "Related to" link for new files. */
export function DocumentUploadPanel({ relatedValue, onRelatedChange }: DocumentUploadPanelProps) {
  const selectId = useId()
  const upload = useDocumentUpload()
  const relatedOptions = useOptions('related')

  return (
    <div className={styles.uploadPanel}>
      <Upload.Dragger
        multiple
        showUploadList={false}
        className={styles.dragger}
        beforeUpload={(file) => {
          void upload(file, decodeRelated(relatedValue))
          return false
        }}
      >
        <div className={styles.dropContent}>
          <span className={styles.dropIcon} aria-hidden="true">
            <UploadCloud size={22} />
          </span>
          <span className={styles.dropText}>
            <span className={styles.dropTitle}>
              Drag files here or <span className={styles.dropLink}>browse</span>
            </span>
            <span className={styles.dropHint}>
              Up to {formatFileSize(MAX_UPLOAD_BYTES)} per file. Files under {formatFileSize(MAX_STORED_FILE_BYTES)} can be previewed and downloaded.
            </span>
          </span>
        </div>
      </Upload.Dragger>

      <div className={styles.uploadOptions}>
        <label htmlFor={selectId} className={styles.optionLabel}>
          Related to <span className={styles.optional}>(optional)</span>
        </label>
        <Select
          id={selectId}
          value={relatedValue ?? undefined}
          onChange={(value?: string) => onRelatedChange(value ?? null)}
          options={relatedOptions as { label: string; value: string }[]}
          showSearch={{ optionFilterProp: 'label' }}
          allowClear
          placeholder="Link uploads to a record…"
          style={{ width: '100%' }}
        />
        <span className={styles.optionHelp}>New uploads are attached to this customer, account, employee or other record.</span>
      </div>
    </div>
  )
}
