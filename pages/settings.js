import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Settings() {
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState('');
  const [message, setMessage] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [credMessage, setCredMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    fetchHolidays();
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await fetch('/api/credentials');
      if (!res.ok) throw new Error('Failed to fetch credentials');
      const data = await res.json();
      setCredentials(data);
    } catch (error) {
      console.error(error);
      setCredMessage(error.message);
    }
  };

  const fetchHolidays = async () => {
    try {
      const res = await fetch('/api/holidays');
      if (!res.ok) throw new Error('Failed to fetch holidays');
      const data = await res.json();
      setHolidays(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHoliday) return;
    try {
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newHoliday }),
      });
      const result = await res.json();
      setMessage(result.message);
      if (res.ok) {
        setHolidays(result.holidays);
        setNewHoliday('');
      }
    } catch (error) {
      setMessage('Failed to add holiday.');
    }
  };

  const handleRemoveHoliday = async (date) => {
    try {
      const res = await fetch('/api/holidays', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      const result = await res.json();
      setMessage(result.message);
      if (res.ok) {
        setHolidays(result.holidays);
      }
    } catch (error) {
      setMessage('Failed to remove holiday.');
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setCredMessage('Updating...');
    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const result = await res.json();
      setCredMessage(result.message);
    } catch (error) {
      setCredMessage('Failed to update credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">Settings</h1>
          <Link href="/" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
            &larr; Back to Home
          </Link>
        </div>

        {/* Credentials Management */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Manage Credentials</h2>
          <form onSubmit={handleUpdateCredentials} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-400 hover:text-cyan-400 focus:outline-none"
              >
                {passwordVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.303 6.546A10.042 10.042 0 01.458 10c1.274 4.057 5.022 7 9.542 7 .847 0 1.673-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
              Update Credentials
            </button>
          </form>
          {credMessage && <p className="text-sm text-gray-400 mt-4">{credMessage}</p>}
        </div>

        {/* Holiday Management */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Manage Holidays</h2>
          <form onSubmit={handleAddHoliday} className="flex gap-4 mb-4">
            <input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md p-2 flex-grow"
            />
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
              Add Holiday
            </button>
          </form>
          {message && <p className="text-sm text-gray-400 mb-4">{message}</p>}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Custom Holiday List</h3>
          {holidays.length > 0 ? (
            <ul className="space-y-2">
              {holidays.map((holiday) => (
                <li key={holiday} className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
                  <span>{holiday}</span>
                  <button onClick={() => handleRemoveHoliday(holiday)} className="text-red-400 hover:text-red-500 font-semibold">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No custom holidays added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
