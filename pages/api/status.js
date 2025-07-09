import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'attendance.json');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    let allData = [];
    try {
      const fileContent = await fs.readFile(dataFilePath, 'utf-8');
      allData = JSON.parse(fileContent);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // If file doesn't exist, allData remains an empty array, and the check will correctly fail.
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const isScrapedToday = allData.some(entry => entry.date === today);

    res.status(200).json({ isScrapedToday });

  } catch (error) {
    console.error('API Error (GET /api/status):', error);
    res.status(500).json({ success: false, message: 'Failed to check status.' });
  }
}
