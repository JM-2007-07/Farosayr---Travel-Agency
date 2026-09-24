import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function AdminError({ message }) {
  const { t } = useTranslation();

  return (
    <Alert severity="error" sx={{ my: 2 }}>
      {message ?? t('state.error')}
    </Alert>
  );
}
