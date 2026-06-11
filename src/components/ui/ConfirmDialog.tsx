import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} fullWidth onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-base leading-relaxed text-cream/80">{message}</p>
    </Modal>
  );
}
