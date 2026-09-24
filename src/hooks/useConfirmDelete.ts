import { App } from 'antd'
import { useCallback } from 'react'

interface ConfirmDeleteOptions {
  /** e.g. "Employee" or "3 Employees" */
  entityLabel: string
  /** Name of the record, e.g. "John Smith". */
  name?: string
  onConfirm: () => void
}

/** Standard destructive-action confirmation dialog. */
export function useConfirmDelete() {
  const { modal } = App.useApp()

  return useCallback(
    ({ entityLabel, name, onConfirm }: ConfirmDeleteOptions) => {
      modal.confirm({
        title: `Delete ${entityLabel}?`,
        content: `Are you sure you want to delete ${name ?? `these ${entityLabel.toLowerCase()}`}? This action cannot be undone.`,
        okText: 'Delete',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        focusable: { autoFocusButton: 'cancel' },
        onOk: onConfirm,
      })
    },
    [modal],
  )
}
