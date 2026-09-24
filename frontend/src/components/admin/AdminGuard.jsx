import { Navigate, Link } from 'react-router';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import AdminLoading from './AdminLoading';

/**
 * Frontend protection is UX only — the real enforcement is
 * requireAuth + requireRole('ADMIN') on every backend /api/admin/* route
 * (see backend/src/middleware/requireAdmin.js). This just avoids showing
 * an authenticated non-admin a flash of admin UI before a request fails.
 */
export default function AdminGuard({ children }) {
  const { t } = useTranslation();
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) return <AdminLoading />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user.role !== 'ADMIN') {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center', py: 10, px: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('admin.common.noAccessTitle')}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t('admin.common.noAccessText')}
        </Typography>
        <Button component={Link} to="/" variant="contained">
          {t('common.backToHome')}
        </Button>
      </Box>
    );
  }

  return children;
}
