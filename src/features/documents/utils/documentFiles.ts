import type { LucideIcon } from 'lucide-react'
import { File, FileImage, FileSpreadsheet, FileText, Presentation } from 'lucide-react'
import type { DocumentFile } from '@/types/models'
import { downloadBlob } from '@/utils/csv'
import { formatDate, formatFileSize } from '@/utils/format'

/** Files larger than this are stored as metadata only (localStorage is small). */
export const MAX_STORED_FILE_BYTES = 1.5 * 1024 * 1024
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

interface FileKind {
  label: string
  icon: LucideIcon
  color: string
}

export function getFileKind(mimeType: string, name = ''): FileKind {
  const extension = name.split('.').pop()?.toLowerCase() ?? ''
  if (mimeType === 'application/pdf' || extension === 'pdf') return { label: 'PDF', icon: FileText, color: '#ba0517' }
  if (mimeType.startsWith('image/')) return { label: 'Image', icon: FileImage, color: '#8a4fd1' }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || ['xlsx', 'xls', 'csv'].includes(extension)) return { label: 'Spreadsheet', icon: FileSpreadsheet, color: '#2e844a' }
  if (mimeType.includes('presentation') || ['pptx', 'ppt'].includes(extension)) return { label: 'Presentation', icon: Presentation, color: '#dd7a01' }
  if (mimeType.includes('word') || ['docx', 'doc'].includes(extension)) return { label: 'Document', icon: FileText, color: '#0176d3' }
  if (mimeType.startsWith('text/')) return { label: 'Text', icon: FileText, color: '#5c6b80' }
  return { label: extension ? extension.toUpperCase() : 'File', icon: File, color: '#5c6b80' }
}

export function canPreview(document: DocumentFile): boolean {
  if (!document.dataUrl) return false
  return document.mimeType.startsWith('image/') || document.mimeType === 'application/pdf' || document.mimeType.startsWith('text/')
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })
}

/** Downloads the stored file, or a text placeholder for seed/metadata-only files. */
export async function downloadDocument(document: DocumentFile): Promise<void> {
  if (document.dataUrl) {
    const blob = await (await fetch(document.dataUrl)).blob()
    downloadBlob(blob, document.name)
    return
  }
  const summary = [
    `${document.name}`,
    '',
    'This is a demo document. The original file content is not stored in this environment.',
    '',
    `Type: ${getFileKind(document.mimeType, document.name).label}`,
    `Size: ${formatFileSize(document.size)}`,
    `Uploaded by: ${document.uploadedBy}`,
    `Uploaded: ${formatDate(document.createdAt)}`,
  ].join('\n')
  downloadBlob(new Blob([summary], { type: 'text/plain' }), `${document.name}.txt`)
}
