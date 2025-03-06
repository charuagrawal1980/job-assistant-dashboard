import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Container, Button, Typography, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import WorkIcon from '@mui/icons-material/Work';

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
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8fafc',
            borderBottom: '2px solid #e2e8f0',
          },
          '& .MuiDataGrid-cell': {
            borderColor: '#f1f5f9',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
  },
});

const SHEET_ID = '1JdG_LUsMVa4kFp1IC6U67Xra5vRO2UoPwC4aMbBKR9E';
const SHEET_ID_real = '1QuYmAJ64RNlM2Yv-JnjWlvTYrpbZlYRa';
const sheetname = 'charu.agrawal';
const RANGE = `${sheetname}!A2:I`;

function Dashboard() {
  const [rows, setRows] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  
  // Define columns for the data grid
  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.3, minWidth: 70 },
    {
      field: 'date',
      headerName: 'Date',
      flex: 0.5,
      minWidth: 100,
      editable: false,
    },
    {
      field: "original_resume",
      headerName: "Original Resume",
      flex: 0.8,
      minWidth: 150,
      editable: false
    },
    {
      field: 'company_name',
      headerName: 'Company Name',
      flex: 0.8,
      minWidth: 150,
      editable: false,
    },
    {
      field: 'job_profile',
      headerName: 'Job Profile',
      flex: 0.8,
      minWidth: 150,
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
      flex: 0.4,
      minWidth: 120,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Approved', 'Awaiting approval', 'Rejected', 'Applied'],
      renderCell: (params) => {
        const statusColors = {
          'Approved': '#22c55e',
          'Awaiting approval': '#f59e0b',
          'Rejected': '#ef4444',
          'Applied': '#3b82f6'
        };
        
        return (
          <Box
            sx={{
              backgroundColor: `${statusColors[params.value]}15`,
              color: statusColors[params.value],
              py: 0.5,
              px: 1.5,
              borderRadius: 1,
              fontWeight: 500,
              fontSize: '0.875rem',
              width: 'fit-content'
            }}
          >
            {params.value}
          </Box>
        );
      }
    },
    {
      field: 'apply_using_original_resume',
      headerName: 'Apply using original resume',
      flex: 0.5,
      minWidth: 100,
      type: 'boolean',
      editable: true,
    },
    {
      field: 'job_search_feedback',
      headerName: 'Job Search Feedback',
      flex: 1,
      minWidth: 200,
      editable: true,
      type: 'string',
    },
    {
      field: 'additional_comments',
      headerName: 'Additional Comments',
      flex: 1,
      minWidth: 200,
      editable: true,
      type: 'string',
    },
    {
      field: 'tailored_resume',
      headerName: 'Tailored Resume',
      flex: 0.8,
      minWidth: 150,
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
      
      console.log('Raw data from sheets:', data.values);
      
      // Filter out any empty rows and ensure each row has all required fields
      const formattedRows = data.values
        .filter(row => row && row.length > 0) // Filter out empty rows
        .map((row, index) => {
          // Ensure all fields have at least an empty string if undefined
          return {
            id: row[0] || `row-${index}`, // Fallback ID if none provided
            date: row[1] || '',
            original_resume: row[2] || '',
            job_profile: row[3] || '',
            job_details: row[4] || '',
            company_name: row[5] || '',
            status: row[6] || '',
            job_search_feedback: row[7] || '',
            apply_using_original_resume: row[8] === 'TRUE',
            tailored_resume: row[9] || '',
            additional_feedback: row[10] || ''
          };
        });
      
      console.log('Formatted rows:', formattedRows);
      
      setRows(formattedRows);
    } catch (error) {
      console.error('Error fetching data:', error);
      setRows([]); // Set empty array on error
    }
  };

  const pushToGoogleSheet = async () => {
    const updates = Object.values(editedRows).map(row => {
      const updates = [];
      
      if ('apply_using_original_resume' in row) {
        updates.push({
          range: `${sheetname}!I${parseInt(row.id) + 1}`, 
          value: row.apply_using_original_resume ? 'TRUE' : 'FALSE'
        });
      }
      // Add comments update if it exists
      if ('job_search_feedback' in row) {
        updates.push({
          range: `${sheetname}!H${parseInt(row.id) + 1}`, 
          value: row.job_search_feedback
        });
      }
       
      if ('additional_comments' in row) {
        updates.push({
          range: `${sheetname}!K${parseInt(row.id) + 1}`, 
          value: row.additional_comments
        });
      }

      // Add status update if it exists
      if ('status' in row) {
        updates.push({
          range: `${sheetname}!G${parseInt(row.id) + 1}`, 
          value: row.status
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
    try {
      await pushToGoogleSheet();
      console.log("Save completed, refreshing data...");
      await fetchGoogleSheetsData();  // Add explicit refresh here
    } catch (error) {
      console.error("Error during save:", error);
    }
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
      //useEffect(() => {
       // console.log('editedRows updated:', editedRows);
      //}, [editedRows]);
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
        alignItems: 'left',
        minHeight: '100vh',
        backgroundColor: 'background.default',
       // backgroundColor: 'blue',
        py: 2,
        pl: 0 // Remove left padding
      }}>
        <Container 
          maxWidth={false}
          //backgroundColor= 'red'
          disableGutters // Disable default container padding
          sx={{ 
            height: '100%',
            pl: 0, // Remove all left padding
            pr: 2,
            maxWidth: '1800px',
            ml: 0 // Remove left margin
          }}
        >
          {/* Compact Header */}
          <Box sx={{ 
            //backgroundColor: 'green',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pl: 2
          }}>
            <WorkIcon sx={{ 
              fontSize: 40, 
              color: '#1976d2',
              backgroundColor: '#EBF4FF',
              p: 1,
              borderRadius: '50%'
            }} />
            <Typography 
              variant="h4"
              sx={{ 
                color: '#1a365d',
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
              p: 2,
              borderRadius: 3,
              backgroundColor: 'background.paper',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              m: 0
            }}
          >
            <Box sx={{ 
              flexGrow: 1,
              width: '100%',
              height: 'calc(100% - 60px)',
              overflow: 'hidden',
              m: 0,
              p: 0,
              '& .MuiDataGrid-root': {
                height: '100%',
                backgroundColor: '#ffffff',
                m: 0,
                p: 0,
                '& .MuiDataGrid-main': {
                  overflow: 'hidden',
                  p: 0
                },
                '& .MuiDataGrid-virtualScroller': {
                  overflow: 'auto'
                }
              }
            }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={30}
                rowsPerPageOptions={[30]}
                checkboxSelection={false}
                disableSelectionOnClick
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
                editMode="row"
                experimentalFeatures={{ newEditingApi: true }}
                getRowId={(row) => row.id || `row-${Math.random()}`}
                autoHeight
                sx={{
                  border: 'none',
                  m: 0,
                  p: 0,
                  width: '100%',
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8fafc',
                    borderBottom: '2px solid #e2e8f0'
                  }
                }}
              />
            </Box>
            
            {/* Save Button */}
            <Box sx={{ 
              mt: 1,
              mb: 1,
              display: 'flex', 
              justifyContent: 'flex-start',
              pl: 2
            }}>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={Object.keys(editedRows).length === 0}
                sx={{
                  px: 6,
                  py: 1.5,
                  fontWeight: 500,
                  fontSize: '1rem',
                  borderRadius: '8px',
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: '#1565c0',
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
