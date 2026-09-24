import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Stack,
  Button,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function AdminTable({ columns, rows, getRowId, renderActions, page, totalPages, onPageChange }) {
  const { t } = useTranslation();

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.label}</TableCell>
              ))}
              {renderActions && <TableCell align="right">{t('admin.common.actions')}</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowId(row)} hover>
                {columns.map((col) => (
                  <TableCell key={col.key}>{col.render ? col.render(row) : row[col.key]}</TableCell>
                ))}
                {renderActions && <TableCell align="right">{renderActions(row)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ py: 2 }}>
          <Button size="small" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            {t('common.previous')}
          </Button>
          <Typography variant="body2" color="text.secondary">
            {t('admin.common.pageOf', { page, total: totalPages })}
          </Typography>
          <Button size="small" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            {t('common.next')}
          </Button>
        </Stack>
      )}
    </Paper>
  );
}
