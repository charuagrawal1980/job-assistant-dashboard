import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function IntakeForm() {
  return (
    <Box>
      <Typography 
        variant="h3" 
        component="h1" 
        sx={{ 
          color: 'primary.main',
          fontWeight: 600,
          mb: 4,
          textAlign: 'center'
        }}
      >
        Intake Form
      </Typography>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          backgroundColor: 'white'
        }}
      >
        <Typography>
          Intake form content will go here
        </Typography>
      </Paper>
    </Box>
  );
} 