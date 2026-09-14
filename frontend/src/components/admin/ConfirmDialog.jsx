import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

/**
 * Every destructive admin action (delete tour/destination/deal/review/
 * message) goes through this — no table row's delete button ever fires
 * immediately. Purely a UX safeguard; the backend still enforces its own
 * relational constraints (e.g. a destination with tours) regardless of
 * what the user confirms here.
 */
export default function ConfirmDialog({ open, title, resourceName, onConfirm, onCancel, loading }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Удалить {resourceName ? <strong>«{resourceName}»</strong> : 'этот элемент'}? Это действие необратимо.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? 'Удаление…' : 'Удалить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
