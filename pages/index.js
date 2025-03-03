import React, { useState, useEffect } from 'react';
import { DataGrid, renderEditInputCell } from '@mui/x-data-grid';
import { Box, Container, Button, Typography, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const SHEET_ID = '1S6Q6kothtqTirze1RpHJinSkoCv5ZMuCMmrcBXVtT2I';
const SHEET_ID_real = '1QuYmAJ64RNlM2Yv-JnjWlvTYrpbZlYRa';
const RANGE = 'Sheet2!A2:I';

function Dashboard() {
  const [rows, setRows] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  
  // Define columns for the data grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'date',
      headerName: 'Date',
      width: 130,
      editable: false,
    },
  
    {
      field:"original_resume",
      headerName:"Original Resume",
      width:200,
      editable:false
    },
    {
      field: 'company_name',
      headerName: 'Company Name',
      width: 200,
      editable: false,
    },
    {
      field: 'job_profile',
      headerName: 'Job Profile',
      width: 200,
      renderCell: (params) => {
        // Check if the URL exists
        if (!params.value) return '-';
        
        return (
          <a 
            href={params.value}
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation(); // Prevent the row selection
            }}
            style={{ 
              color: '#1976d2', 
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            View Job
          </a>
        );
      },
    },
    
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      editable: false,
      type: 'string',
    },
    {
      field: 'approved',  // New checkbox column
      headerName: 'Approved',
      width: 100,
      type: 'boolean',
      editable: true,
    },
    {
      field: 'comments',
      headerName: 'Comments',
      width: 300,
      editable: true,
      type: 'string',
    },
    {
      field: 'tailored_resume',
      headerName: 'Tailored Resume',
      width: 200,
      editable: false,
      renderCell: (params) => {
        // Check if the URL exists
        if (!params.value) return '-';
        
        return (
          <a 
            href={params.value}
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation(); // Prevent the row selection
            }}
            style={{ 
              color: '#1976d2', 
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Tailored resume
          </a>
        );
      },
    },
  
  ];

   useEffect(() => {
     fetchGoogleSheetsData();
   }, []);

  const fetchGoogleSheetsData = async () => {
    try {
     
      
      const response = await fetch(`/api/sheets?sheetId=${SHEET_ID}&range=${RANGE}`);
      const data = await response.json();
      
      // Add console.log to check the data
      console.log('Raw data from sheets:', data.values);
      
      const formattedRows = data.values.map((row, index) => ({
        id: row[0],
        date: row[1],
        original_resume: row[2],
        company_name: row[3],
        job_profile: row[4],
        status: row[5], // Make sure this contains the full URL
        approved: row[6]==='TRUE',
        comments: row[7],
        tailored_resume: row[8]
      }));
      
      // Add console.log to check formatted data
      console.log('Formatted rows:', formattedRows);
      
      setRows(formattedRows);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const pushToGoogleSheet = async () => {

    const updates = Object.values(editedRows).map(row => {
      const updates = [];
      
      if ('approved' in row) {
        updates.push({
          range: `Sheet2!G${parseInt(row.id) + 1}`, 
          value: row.approved ? 'TRUE' : 'FALSE'
        });
      }
      // Add comments update if it exists
      if ('comments' in row) {
        updates.push({
          range: `Sheet2!H${parseInt(row.id) + 1}`, 
          value: row.comments
        });
      }
       
      return updates;
    }).flat();

    
    console.log('Updates to be sent:', updates); // Debug log

    if (updates.length === 0) {
      console.log('No updates to save');
      return;
    }
    // Send all updates to the API
    const response = await fetch('/api/bulk-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheetId: SHEET_ID,
        updates: updates
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update spreadsheet');
    }

    // Clear edited rows after successful update
    setEditedRows({});
    fetchGoogleSheetsData();

  }

  // New function to handle submit
  const handleSubmit = async () => {
    await pushToGoogleSheet();
  };

  const processRowUpdate = async (newRow, oldRow) => {
    console.log('Processing row update:', { newRow, oldRow });
    
    // Find what changed
    const changedFields = Object.keys(newRow).reduce((acc, key) => {
      if (newRow[key] !== oldRow[key]) {
        console.log(`Field ${key} changed:`, {
          old: oldRow[key],
          new: newRow[key]
        });
        acc[key] = newRow[key];
      }
      return acc;
    }, {});

    console.log('Changed fields:', changedFields);

    if (Object.keys(changedFields).length > 0) {
      // Log before update
      console.log('Current editedRows before update:', editedRows);
      
      setEditedRows(prev => {
        const updated = {
          ...prev,
          [newRow.id]: {
            ...(prev[newRow.id] || {}),
            ...changedFields,
            id: newRow.id
          }
        };
        console.log('New editedRows state:', updated);
        return updated;
      });

      // Add a useEffect to monitor editedRows changes
      useEffect(() => {
        console.log('editedRows updated:', editedRows);
      }, [editedRows]);
    }

    return newRow;
  };

  // Add error handling for row updates
  const handleProcessRowUpdateError = (error) => {
    console.error('Error updating row:', error);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4  // padding top and bottom
      }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ 
            mb: 4,
            textAlign: 'center'
          }}>
            <Typography 
              variant="h3" 
              sx={{ 
                color: 'text.primary',
                mb: 4,
                textAlign: 'center',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Job Assistant Dashboard
            </Typography>
          </Box>

          {/* Main Content */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 3,
              backgroundColor: 'background.paper',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            }}
          >
            <Box sx={{ 
              height: 500,
              width: '100%',
              '& .MuiDataGrid-root': {
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderColor: '#f1f5f9',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e2e8f0',
                  '& .MuiDataGrid-columnHeader': {
                    fontWeight: 600,
                  },
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: '#ffffff',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f8fafc',
                },
              }
            }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={7}  // Increased page size
                rowsPerPageOptions={[7, 14, 21]}
                checkboxSelection={false}
                disableSelectionOnClick
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
                editMode="row"
                experimentalFeatures={{ newEditingApi: true }}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                }}
              />
            </Box>
            
            {/* Save Button */}
            <Box sx={{ 
              mt: 3, 
              display: 'flex', 
              justifyContent: 'flex-end'
            }}>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={Object.keys(editedRows).length === 0}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  },
                }}
              >
                Save Changes ({Object.keys(editedRows).length})
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard; 
