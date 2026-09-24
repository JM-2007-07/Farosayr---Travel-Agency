import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

/**
 * Every destructive admin action (delete tour/destination/deal/review/
 * message) goes through this — no table row's delete button ever fires
 * immediately. Purely a UX safeguard; the backend still enforces its own
 * relational constraints (e.g. a destination with tours) regardless of
 * what the user confirms here.
 */
export default function ConfirmDialog({ open, title, resourceName, onConfirm, onCancel, loading }) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {resourceName ? (
            <Trans
              i18nKey="admin.common.confirmDeleteNamed"
              values={{ name: resourceName }}
              components={{ strong: <strong /> }}
            />
          ) : (
            t('admin.common.confirmDeleteGeneric')
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? t('common.deleting') : t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
