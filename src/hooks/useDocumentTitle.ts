import { useEffect } from 'react'
import { APP_NAME } from '@/constants/app'

/** Sets `document.title` to "<title> · <app name>". */
export function useDocumentTitle(title: string | undefined): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])
}
