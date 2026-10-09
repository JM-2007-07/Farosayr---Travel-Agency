import { ThemeProvider } from '@mui/material/styles';
import muiTheme from '../theme/muiTheme';
import AdminGuard from '../components/admin/AdminGuard';
import AdminLayout from './AdminLayout';

// The whole admin panel (guard + layout + MUI theme) is one lazily loaded
// chunk: visitors of the public site never download it.
export default function AdminShell() {
  return (
    <ThemeProvider theme={muiTheme}>
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    </ThemeProvider>
  );
}
