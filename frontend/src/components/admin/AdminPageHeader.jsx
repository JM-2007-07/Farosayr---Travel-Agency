import { Box, Typography, Stack } from '@mui/material';

export default function AdminPageHeader({ title, action }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
      <Typography variant="h5" component="h1" fontWeight={700}>
        {title}
      </Typography>
      {action && <Box>{action}</Box>}
    </Stack>
  );
}
