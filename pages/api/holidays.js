import fs from 'fs';
import path from 'path';

const holidaysFilePath = path.join(process.cwd(), 'data', 'holidays.json');

const readHolidays = () => {
  if (!fs.existsSync(holidaysFilePath)) {
    return []; // Return an empty array if file doesn't exist
  }
  const fileContent = fs.readFileSync(holidaysFilePath, 'utf-8');
  return JSON.parse(fileContent);
};

const writeHolidays = (data) => {
  fs.writeFileSync(holidaysFilePath, JSON.stringify(data, null, 2));
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    const holidays = readHolidays();
    res.status(200).json(holidays);
  } else if (req.method === 'POST') {
    const { date, name, isRange, rangeId, totalDays } = req.body;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !name) {
      return res.status(400).json({ message: 'Invalid input. Date (YYYY-MM-DD) and name are required.' });
    }
    const holidays = readHolidays();
    if (holidays.some(h => h.date === date)) {
        return res.status(409).json({ message: 'A holiday for this date already exists.' });
    }
    
    // Create holiday object with range metadata if provided
    const holiday = { date, name };
    if (isRange && rangeId) {
      holiday.isRange = isRange;
      holiday.rangeId = rangeId;
      holiday.totalDays = totalDays;
    }
    
    holidays.push(holiday);
    holidays.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
    writeHolidays(holidays);
    res.status(201).json({ message: 'Holiday added successfully.', holidays });
  } else if (req.method === 'DELETE') {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }
    let holidays = readHolidays();
    const initialLength = holidays.length;
    holidays = holidays.filter(h => h.date !== date);
    if (holidays.length < initialLength) {
      writeHolidays(holidays);
      res.status(200).json({ message: 'Holiday removed successfully.', holidays });
    } else {
      res.status(404).json({ message: 'Holiday not found.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
