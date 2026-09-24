import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function AdminEmptyState({ message }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Typography color="text.secondary">{message ?? t('admin.common.empty')}</Typography>
    </Box>
  );
}
