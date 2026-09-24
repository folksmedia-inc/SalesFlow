import { Button, Upload } from 'antd'
import { UploadCloud } from 'lucide-react'
import type { RelatedRef } from '@/types/models'
import { useDocumentUpload } from '../hooks/useDocumentUpload'

interface DocumentUploadButtonProps {
  related: RelatedRef | null
  type?: 'primary' | 'default'
}

export function DocumentUploadButton({ related, type = 'default' }: DocumentUploadButtonProps) {
  const upload = useDocumentUpload()
  return (
    <Upload
      multiple
      showUploadList={false}
      beforeUpload={(file) => {
        void upload(file, related)
        return false
      }}
    >
      <Button type={type} icon={<UploadCloud size={16} />}>
        Upload
      </Button>
    </Upload>
  )
}
