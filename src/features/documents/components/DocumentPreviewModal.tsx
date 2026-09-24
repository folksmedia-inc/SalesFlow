import { Button, Descriptions, Modal } from 'antd'
import { Download } from 'lucide-react'
import { RelatedLink } from '@/components/common/RelatedLink'
import type { DocumentFile } from '@/types/models'
import { formatDateTime, formatFileSize } from '@/utils/format'
import { canPreview, downloadDocument, getFileKind } from '../utils/documentFiles'
import { FileName } from './FileName'

interface DocumentPreviewModalProps {
  document: DocumentFile | null
  onClose: () => void
}

/** Inline preview for images, PDFs and text; metadata for everything else. */
export function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  if (!document) return null
  const previewable = canPreview(document)

  let body = null
  if (previewable && document.dataUrl) {
    if (document.mimeType.startsWith('image/')) {
      body = <img src={document.dataUrl} alt={document.name} style={{ maxWidth: '100%', maxHeight: '60vh', display: 'block', margin: '0 auto', borderRadius: 8 }} />
    } else {
      body = <iframe src={document.dataUrl} title={document.name} style={{ width: '100%', height: '60vh', border: '1px solid var(--app-border-secondary)', borderRadius: 8, background: '#fff' }} />
    }
  }

  return (
    <Modal
      open
      onCancel={onClose}
      width={previewable ? 900 : 560}
      title={<FileName name={document.name} mimeType={document.mimeType} />}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button key="download" type="primary" icon={<Download size={16} />} onClick={() => void downloadDocument(document)}>
          Download
        </Button>,
      ]}
    >
      {body ?? (
        <p style={{ color: 'var(--app-text-secondary)' }}>
          A preview isn't available for this file type{document.dataUrl ? '' : ' (demo file without stored content)'}. You can still download it.
        </p>
      )}
      <Descriptions
        size="small"
        column={2}
        style={{ marginTop: 16 }}
        items={[
          { key: 'type', label: 'Type', children: getFileKind(document.mimeType, document.name).label },
          { key: 'size', label: 'Size', children: formatFileSize(document.size) },
          { key: 'by', label: 'Uploaded by', children: document.uploadedBy },
          { key: 'date', label: 'Uploaded', children: formatDateTime(document.createdAt) },
          { key: 'related', label: 'Related to', children: <RelatedLink related={document.related} />, span: 2 },
        ]}
      />
    </Modal>
  )
}
