import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useRouter } from 'next/router';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Head from 'next/head';

const drawerWidth = 280;

// Create a custom theme
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  palette: {
    primary: {
      main: '#2563eb', // Modern blue
      dark: '#1d4ed8',
      light: '#60a5fa',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          padding: '10px 16px',
        },
      },
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const menuItems = [
    {
      text: 'Intake Form',
      icon: <AssignmentIcon />,
      path: '/intake-form'
    },
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/'
    }
  ];

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex' }}>
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              },
            }}
          >
            <Box sx={{ 
              p: 3, 
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: 'background.paper',
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: 'primary.main',
                  letterSpacing: '-0.02em',
                }}
              >
                Job Assistant
              </Typography>
            </Box>
            <List sx={{ p: 2 }}>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => router.push(item.path)}
                  selected={router.pathname === item.path}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: router.pathname === item.path ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: router.pathname === item.path ? 600 : 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Drawer>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 4,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
              backgroundColor: 'background.default',
              minHeight: '100vh',
            }}
          >
            <Component {...pageProps} />
          </Box>
        </Box>
      </ThemeProvider>
    </>
  );
}

export default MyApp; 