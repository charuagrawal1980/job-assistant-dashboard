import { google } from 'googleapis';

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    // Your service account credentials
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { sheetId, range } = req.query;
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
      });

      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { sheetId, range, value } = req.body;
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: {
          values: [[value]],
        },
      });

      res.status(200).json({ message: 'Updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
} 