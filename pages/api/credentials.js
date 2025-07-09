import fs from 'fs';
import path from 'path';

const credentialsFilePath = path.join(process.cwd(), 'data', 'credentials.json');

const readCredentials = () => {
  if (!fs.existsSync(credentialsFilePath)) {
    return { username: '', password: '' };
  }
  const fileContent = fs.readFileSync(credentialsFilePath, 'utf-8');
  return JSON.parse(fileContent);
};

const writeCredentials = (data) => {
  fs.writeFileSync(credentialsFilePath, JSON.stringify(data, null, 2));
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    const credentials = readCredentials();
    res.status(200).json(credentials);
  } else if (req.method === 'POST') {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Username and password must be strings.' });
    }
    const credentials = { username, password };
    writeCredentials(credentials);
    res.status(200).json({ message: 'Credentials updated successfully.' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
