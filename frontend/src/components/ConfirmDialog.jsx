import Modal from './Modal'

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-sm text-slate-700">{message}</div>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              'rounded-md px-3 py-2 text-sm font-medium text-white transition active:scale-[0.99]',
              danger ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-900 hover:bg-slate-800',
            ].join(' ')}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

