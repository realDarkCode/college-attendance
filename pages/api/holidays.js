import fs from 'fs';
import path from 'path';

const holidaysFilePath = path.join(process.cwd(), 'data', 'holidays.json');

const readHolidays = () => {
  if (!fs.existsSync(holidaysFilePath)) {
    return { holidays: [] };
  }
  const fileContent = fs.readFileSync(holidaysFilePath, 'utf-8');
  return JSON.parse(fileContent);
};

const writeHolidays = (data) => {
  fs.writeFileSync(holidaysFilePath, JSON.stringify(data, null, 2));
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    const data = readHolidays();
    res.status(200).json(data.holidays);
  } else if (req.method === 'POST') {
    const { date } = req.body;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    const data = readHolidays();
    if (!data.holidays.includes(date)) {
      data.holidays.push(date);
      data.holidays.sort(); // Keep the list sorted
      writeHolidays(data);
    }
    res.status(201).json({ message: 'Holiday added successfully.', holidays: data.holidays });
  } else if (req.method === 'DELETE') {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }
    const data = readHolidays();
    const initialLength = data.holidays.length;
    data.holidays = data.holidays.filter(h => h !== date);
    if (data.holidays.length < initialLength) {
      writeHolidays(data);
      res.status(200).json({ message: 'Holiday removed successfully.', holidays: data.holidays });
    } else {
      res.status(404).json({ message: 'Holiday not found.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
