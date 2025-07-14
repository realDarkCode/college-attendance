# College Attendance Tracker

A full-stack Next.js application designed to automatically scrape, display, and manage college attendance data. It provides a user-friendly, responsive interface to view attendance statistics, manage credentials, and configure holidays.

## Key Features

- **Responsive UI**: Fully responsive design for seamless viewing on mobile and desktop devices.
- **Automated Scraping**: A Node.js script uses Puppeteer to log in to the college portal and scrape the latest attendance data.
- **Interactive Calendar**: An interactive calendar displays the daily attendance status (Present, Absent, Leave) and holidays.
- **Enhanced Tooltips**: Calendar tooltips show detailed attendance stats and custom holiday names on hover.
- **Accurate Monthly Statistics**: View a summary of present, absent, and leave days for the selected month, accurately excluding all holidays from the count.
- **Intelligent Auto-Fetch**: The application automatically triggers a new scrape if the page is loaded after 10 AM and the latest data is from before 10 AM, ensuring data is fresh.
- **Dynamic Fetch Status**: Displays when data was last fetched with a color-coded, relative timestamp:
  - 🟢 **Green**: Fetched within the last 2 hours.
  - 🟡 **Yellow**: Fetched within the last 8 hours.
  - 🔴 **Red**: Fetched more than 8 hours ago.
- **Holiday Management**: Add and remove custom named holidays via the Settings page.
- **Robust Scraping Logic**: The status logic correctly compares against the previous day's data to handle multiple scrapes on the same day without errors.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Web Scraping**: [Puppeteer](https://pptr.dev/)
- **Language**: JavaScript/Node.js

## Setup and Installation

**1. Clone the repository:**
```bash
git clone <repository-url>
cd college-attendance
```

**2. Install dependencies:**
```bash
npm install
```

**3. Set up data files:**
The application uses local JSON files for data persistence. Create a `data` directory in the project root and add the following files:
- `credentials.json`: Stores login credentials.
  ```json
  { "username": "YOUR_USERNAME", "password": "YOUR_PASSWORD" }
  ```
- `holidays.json`: Stores custom holidays with names.
  ```json
  { "holidays": [{ "date": "2025-01-01", "name": "New Year's Day" }] }
  ```
- `attendance.json`: Stores scraped attendance data (initially empty).
  ```json
  []
  ```

**4. Run the development server:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Automation with Cron

To run the scraper automatically on system startup, you can set up a cron job. The provided `scrape.sh` script includes logic to **only run if the current time is 10 AM or later**, preventing unnecessary scrapes.

**1. Make the script executable:**
```bash
chmod +x scrape.sh
```

**2. Edit your crontab:**
```bash
crontab -e
```

**3. Add the cron job for startup:**
```cron
@reboot /home/darkcode/Codes/Projects/college-attendance/scrape.sh >> /home/darkcode/Codes/Projects/college-attendance/cron.log 2>&1
```
This job will execute the script every time the system reboots. The script itself will then decide whether to proceed based on the current time.
0 8 * * * /bin/bash /path/to/your/project/scrape.sh
```

> **Note**: Make sure to replace `/path/to/your/project/` with the absolute path to the `college-attendance` directory.
