import { Box, Typography } from '@mui/material';

export default function AdminEmptyState({ message = 'Записей пока нет.' }) {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}
