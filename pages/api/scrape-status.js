import fs from 'fs';
import path from 'path';

const statusFilePath = path.join(process.cwd(), 'data', 'scrape-status.json');

export default async function handler(req, res) {
  try {
    if (fs.existsSync(statusFilePath)) {
      const data = await fs.promises.readFile(statusFilePath, 'utf8');
      res.status(200).json(JSON.parse(data));
    } else {
      res.status(200).json({ message: 'Awaiting start...', progress: 0 });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to get status', error: error.message });
  }
}
