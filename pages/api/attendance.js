import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'attendance.json');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    res.status(200).json(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, return an empty array, which is expected by the frontend.
      return res.status(200).json([]);
    }
    console.error('API Error (GET /api/attendance):', error);
    res.status(500).json({ success: false, message: 'Failed to read attendance data.' });
  }
}
