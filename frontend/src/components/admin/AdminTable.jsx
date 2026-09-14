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

export default function AdminTable({ columns, rows, getRowId, renderActions, page, totalPages, onPageChange }) {
  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.label}</TableCell>
              ))}
              {renderActions && <TableCell align="right">Действия</TableCell>}
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
            Назад
          </Button>
          <Typography variant="body2" color="text.secondary">
            Стр. {page} из {totalPages}
          </Typography>
          <Button size="small" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Далее
          </Button>
        </Stack>
      )}
    </Paper>
  );
}
