import { createTheme } from '@mui/material/styles';

/**
 * MUI theme built from the same values as styles/tokens.css, so MUI parts
 * of the site (admin panel, the homepage search selects, dialogs) speak
 * the Farosayr design language instead of MUI's default blue + Roboto.
 * Keep the two in sync when a brand value changes.
 */
const NAVY = '#0b1f3a';
const TURQUOISE = '#2fd9c4';
const TURQUOISE_DIM = '#1fa895';
const GOLD = '#d4af6a';

const theme = createTheme({
  palette: {
    primary: { main: NAVY, light: '#1b5a8c', dark: '#07182d', contrastText: '#ffffff' },
    secondary: { main: TURQUOISE, dark: TURQUOISE_DIM, contrastText: NAVY },
    warning: { main: '#b7791f' },
    success: { main: '#1f9d6b' },
    error: { main: '#d64545' },
    info: { main: '#1b5a8c' },
    text: { primary: '#0f1f33', secondary: '#4a5b72' },
    background: { default: '#f4f7fa', paper: '#ffffff' },
    divider: '#e3e9f0',
    accent: { main: GOLD },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    button: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 20, minHeight: 40 },
        sizeLarge: { minHeight: 52, paddingInline: 28 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: TURQUOISE },
        },
        notchedOutline: { borderColor: '#e3e9f0' },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { '&.Mui-focused': { color: NAVY } } },
    },
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 18 } },
    },
    MuiMenu: {
      styleOverrides: { paper: { borderRadius: 12 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 20 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 700, color: NAVY } },
    },
  },
});

export default theme;
