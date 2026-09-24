import { App } from 'antd'
import { useCallback } from 'react'
import { useAppSelector } from '@/app/hooks'
import { useEntityCrud } from '@/hooks/useEntityData'
import { selectCurrentUserName } from '@/store/authSlice'
import type { RelatedRef } from '@/types/models'
import { formatFileSize } from '@/utils/format'
import { MAX_STORED_FILE_BYTES, MAX_UPLOAD_BYTES, readFileAsDataUrl } from '../utils/documentFiles'

/**
 * Stores an uploaded file as a document record. Small files keep their
 * content (as a data URL) so they can be previewed and downloaded; larger
 * files are stored as metadata only. A real backend would upload to storage.
 */
export function useDocumentUpload() {
  const { message } = App.useApp()
  const crud = useEntityCrud('documents')
  const uploadedBy = useAppSelector(selectCurrentUserName)

  return useCallback(
    async (file: File, related: RelatedRef | null) => {
      if (file.size > MAX_UPLOAD_BYTES) {
        message.error(`${file.name} is larger than ${formatFileSize(MAX_UPLOAD_BYTES)}.`)
        return
      }
      const keepContent = file.size <= MAX_STORED_FILE_BYTES
      const dataUrl = keepContent ? await readFileAsDataUrl(file) : null
      crud.create({ name: file.name, mimeType: file.type || 'application/octet-stream', size: file.size, uploadedBy, related, dataUrl })
      if (keepContent) message.success(`${file.name} uploaded.`)
      else message.info(`${file.name} uploaded. Files over ${formatFileSize(MAX_STORED_FILE_BYTES)} are stored as metadata only in this demo.`)
    },
    [crud, message, uploadedBy],
  )
}
