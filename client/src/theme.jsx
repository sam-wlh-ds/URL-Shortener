import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200EE', // Deep Purple
    },
    secondary: {
      main: '#03DAC6', // Teal
    },
    background: {
      default: '#f0f2f5', // Light gray background
    },
    error: {
      main: '#FF1744',
    },
    // Custom colors for URL cards
    urlCardColors: [
      '#FFD700', // Gold (for 1)
      '#C0C0C0', // Silver (for 2)
      '#CD7F32', // Bronze (for 3)
      '#6495ED', // Cornflower Blue (for 4)
      '#90EE90', // Light Green (for 5)
      '#FF69B4', // Hot Pink (for 6)
    ],
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h3: {
      fontWeight: 700,
      color: '#333',
    },
    h4: { 
      fontWeight: 600,
      color: '#333',
    },
    h5: {
      fontWeight: 500,
      color: '#555',
      marginBottom: '16px',
    },
    body1: { 
      color: '#555',
    },
    body2: { 
      color: '#666',
      fontSize: '0.875rem',
    },
    button: {
      fontWeight: 600,
      fontSize: '1rem',
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
      },
    },
    MuiTextField: { 
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;