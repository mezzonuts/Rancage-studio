import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6c5ce7',
      light: '#a29bfe',
      dark: '#5a4bd6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00b894',
      light: '#55efc4',
      dark: '#009974',
    },
    error: {
      main: '#e17055',
      light: '#fab1a0',
      dark: '#d63031',
    },
    warning: {
      main: '#fdcb6e',
      light: '#ffeaa7',
      dark: '#e17055',
    },
    success: {
      main: '#00b894',
      light: '#55efc4',
      dark: '#009974',
    },
    background: {
      default: '#f8f9fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1d2e',
      secondary: '#6b7194',
    },
    divider: '#e2e5f0',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 13,
    fontWeightMedium: 500,
    h1: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#1a1d2e',
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1a1d2e',
    },
    h3: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a1d2e',
    },
    h4: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#1a1d2e',
    },
    body1: {
      fontSize: '0.8125rem',
      lineHeight: 1.6,
      color: '#1a1d2e',
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#6b7194',
    },
    caption: {
      fontSize: '0.6875rem',
      color: '#9498b3',
    },
    button: {
      fontSize: '0.8125rem',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 8px rgba(0,0,0,0.06)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.08)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '6px 16px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 2px 8px rgba(108,92,231,0.3)',
          },
        },
        outlined: {
          borderColor: '#e2e5f0',
          '&:hover': {
            borderColor: '#6c5ce7',
            backgroundColor: '#f0eeff',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: 6,
          '&:hover': {
            backgroundColor: '#f5f6fa',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontSize: '0.8125rem',
            '& fieldset': {
              borderColor: '#e2e5f0',
            },
            '&:hover fieldset': {
              borderColor: '#6c5ce7',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6c5ce7',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.8125rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '0.8125rem',
          fontWeight: 500,
          minHeight: 40,
          '&.Mui-selected': {
            color: '#6c5ce7',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#6c5ce7',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #e2e5f0',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontSize: '0.75rem',
          fontWeight: 500,
          height: 28,
        },
        outlined: {
          borderColor: '#e2e5f0',
          '&:hover': {
            borderColor: '#6c5ce7',
            backgroundColor: '#f0eeff',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.6875rem',
          backgroundColor: '#1a1d2e',
          borderRadius: 6,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e2e5f0',
        },
      },
    },
  },
});

export default theme;