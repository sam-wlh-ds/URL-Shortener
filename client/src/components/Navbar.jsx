import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
// import theme from '../theme';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200EE',
    },
    secondary: {
      main: '#03DAC6',
    },
    text: {
      primary: '#333',
      secondary: '#555',
    },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
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
          borderRadius: 999,
          padding: '12px 24px',
          minWidth: 160,
          transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
        },
      },
    },
  },
});

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/shorten');

  useEffect(() => {
    if (location.pathname === '/analytics') {
      setActiveTab('/analytics');
    } else {
      setActiveTab('/shorten');
    }
  }, [location.pathname]);

  const handleNavigation = (path) => {
    setActiveTab(path);
    navigate(path);
  };

  const buttonActualWidth = 160 + (24 * 2);

  const sliderWidth = buttonActualWidth;

  const sliderLeft = activeTab === '/shorten' ? 4 : 115 + (1||buttonActualWidth);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          padding: 2,
          backgroundColor: theme.palette.background.default,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            borderRadius: 999,
            backgroundColor: '#E0E0E0',
            padding: '4px',
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
            width: 'fit-content',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '4px',
              left: `${sliderLeft}px`,
              width: `${sliderWidth}px`,
              height: 'calc(100% - 8px)',
              backgroundColor: theme.palette.secondary.main,
              borderRadius: 999,
              transition: 'left 0.3s ease-in-out',
              zIndex: 1,
            }}
          />

          <Button
            onClick={() => handleNavigation('/shorten')}
            sx={{
              zIndex: 2,
              color: activeTab === '/shorten' ? 'white' : theme.palette.text.primary,
              fontWeight: activeTab === '/shorten' ? 'bold' : 'normal',
              fontSize: activeTab === '/shorten' ? '17px' : '13px',
              transition: 'color 0.3s ease-in-out',
            }}
          >
            Shorten
          </Button>

          <Button
            onClick={() => handleNavigation('/analytics')}
            sx={{
              zIndex: 2,
              color: activeTab === '/analytics' ? 'white' : theme.palette.text.primary,
              fontWeight: activeTab === '/analytics' ? 'bold' : 'normal',
              fontSize: activeTab === '/shorten' ? '13px' : '17px',
              transition: 'color 0.3s ease-in-out',
            }}
          >
            Analytics
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default NavBar;