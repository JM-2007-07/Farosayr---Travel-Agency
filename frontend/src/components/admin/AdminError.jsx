import { Alert } from '@mui/material';

export default function AdminError({ message = 'Не удалось загрузить данные. Попробуйте обновить страницу.' }) {
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      {message}
    </Alert>
  );
}
