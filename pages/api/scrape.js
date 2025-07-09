import fs from 'fs/promises';
import path from 'path';
import { scrapeAttendance } from '../../lib/scraper';

// Define the path for the data file
const dataFilePath = path.join(process.cwd(), 'data', 'attendance.json');

// Helper function to ensure the data directory exists
async function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  try {
    await fs.stat(dirname);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(dirname, { recursive: true });
    }
  }
}

export default async function handler(req, res) {
  // Ensure this is a POST request
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('API: Starting scrape process...');
    const scrapedData = await scrapeAttendance();
    console.log('API: Scrape process completed.');

    await ensureDirectoryExists(dataFilePath);

    // Read existing data
    let allData = [];
    try {
      const fileContent = await fs.readFile(dataFilePath, 'utf-8');
      allData = JSON.parse(fileContent);
    } catch (error) {
      // If the file doesn't exist or is empty, start with an empty array
      if (error.code !== 'ENOENT') {
        throw error; // Rethrow other errors
      }
    }

    // Sort data by date to easily find the latest entry
    allData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const previousEntry = allData.length > 0 ? allData[allData.length - 1] : null;

    // Determine the status for the current day by comparing with the previous day
    let dayStatus = 'Unknown';
    if (previousEntry) {
      if (scrapedData.data.present > previousEntry.data.present) {
        dayStatus = 'Present';
      } else if (scrapedData.data.absent > previousEntry.data.absent) {
        dayStatus = 'Absent';
      } else if (scrapedData.data.leave > previousEntry.data.leave) {
        dayStatus = 'Leave';
      } else {
        dayStatus = 'No Change'; // Could be a weekend or holiday
      }
    }

    // Add the calculated status to the scraped data
    scrapedData.dayStatus = dayStatus;

    // Add new data or update if an entry for the same date already exists
    const existingEntryIndex = allData.findIndex(entry => entry.date === scrapedData.date);

    if (existingEntryIndex !== -1) {
      // Update existing entry
      allData[existingEntryIndex] = scrapedData;
      console.log(`API: Updated data for date: ${scrapedData.date} with status: ${dayStatus}`);
    } else {
      // Add new entry
      allData.push(scrapedData);
      console.log(`API: Added new data for date: ${scrapedData.date} with status: ${dayStatus}`);
    }

    // Write the updated data back to the file
    await fs.writeFile(dataFilePath, JSON.stringify(allData, null, 2));
    console.log('API: Data successfully saved to', dataFilePath);

    res.status(200).json({ success: true, message: 'Scraping successful!', data: scrapedData });

  } catch (error) {
    console.error('API: An error occurred in the scrape handler:', error);
    res.status(500).json({ success: false, message: 'Scraping failed.', error: error.message });
  }
}
