# College Attendance Tracker

A full-stack Next.js application designed to automatically scrape, display, and manage college attendance data. It provides a user-friendly, responsive interface to view attendance statistics, manage credentials, and configure holidays.

## Project Idea

One of the policies at our college is that if a student is absent for more than two days in a month, their student ID is automatically deactivated. However, a major limitation is that there is no way to view which specific days were marked as absent—only the total number of present, absent, and leave days for the entire academic year is shown on the college website.

This lack of visibility can be problematic. At times, I might forget to punch my ID card, or even question whether it was recorded properly.

This led me to the idea of building a personal project—an application that automatically tracks my daily attendance and visualizes the data in a calendar format. Also, since I hadn’t yet contributed under the “Vibe Coding” initiative, I figured this was a good opportunity to get started—and to test whether our junior co-programmer would really step up to the task.

I quickly drafted a rough concept in about 20–30 minutes and used AI to flesh out the details. Step by step, I started feeding instructions—not to a computer this time, but to an AI assistant. Within just a couple of hours, an alpha version of the app was up and running.

After a months of usage, the outcome has been very promising.

## Screenshots

<div align="center">
  <img src="docs/1.png" alt="College Attendance Tracker - Main Dashboard" width="800"/>
  <p><em>Main Dashboard with Monthly Statistics and Interactive Calendar</em></p>
  
  <img src="docs/2.png" alt="College Attendance Tracker - Calendar View" width="800"/>
  <p><em>Setting page with credential and holiday management</em></p>
</div>

## Key Features

- 🔐 **Automated Login & Data Scraping**: Automatically logs into the college website and fetches daily attendance data without manual intervention
- 🧩 **Auto-Refresh on Startup**: Automatically refreshes data when the computer starts up, eliminating the need for daily manual updates
- 📆 **Interactive Calendar Visualization**: Beautiful calendar interface showing daily status — Present, Absent, Leave, Error, or Holiday with color-coded indicators
- 📊 **Monthly Statistics Dashboard**: Clear overview of total absent, present, and leave counts for each month, excluding holidays and errors
- 🎯 **Customizable Settings**: Set custom holidays and configure college website credentials from the Settings page, making it usable by anyone
- 🗄️ **Local Data Storage**: All data is stored locally for maximum security and privacy
- 🚨 **Comprehensive Error Handling**: Detailed error tracking and reporting when scraping fails (network issues, invalid credentials, etc.)
- ⏰ **Smart Timing Logic**: Intelligent auto-fetch that only runs after 10 AM to ensure fresh daily data
- � **Fully Responsive Design**: Works seamlessly on both mobile and desktop devices
- 🏖️ **Holiday Management**: Add and remove custom named holidays that are excluded from attendance calculations
- 🔄 **Real-time Status Updates**: Live progress tracking during data scraping with detailed status messages

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
@reboot /path/to/your/project/scrape.sh >> /path/to/your/project/cron.log 2>&1
```

This job will execute the script every time the system reboots. The script itself will then decide whether to proceed based on the current time.

**Alternative: Daily scheduled run at 8 AM:**

```cron
0 8 * * * /bin/bash /path/to/your/project/scrape.sh
```

> **Note**: Make sure to replace `/path/to/your/project/` with the absolute path to the `college-attendance` directory.
