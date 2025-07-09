# College Attendance Tracker

This is a full-stack Next.js application designed to automatically scrape, display, and manage college attendance data. It provides a user-friendly interface to view attendance statistics, manage credentials, and configure holidays, with a backend scraper powered by Puppeteer.

## Key Features

- **Automated Scraping**: A Node.js script uses Puppeteer to log in to the college portal and scrape the latest attendance data.
- **Dashboard View**: The main page displays the student's name and an interactive calendar showing daily attendance status (Present, Absent, Leave).
- **Monthly Statistics**: View a summary of total working days, present days, absent days, and leaves for the selected month.
- **Holiday Management**:
  - Automatically marks weekly holidays (e.g., Friday, Saturday).
  - Add and remove custom holidays via the Settings page.
- **Credential Management**: Securely update and store login credentials through the Settings page, which the scraper uses for authentication.
- **Automation Ready**: Includes a shell script and instructions for setting up a cron job for daily, automated scraping.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Web Scraping**: [Puppeteer](https://pptr.dev/)
- **Language**: JavaScript/Node.js

## Setup and Installation

Follow these steps to get the project running on your local machine.

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

The application uses local JSON files for data persistence.

- Create a `data` directory in the project root.
- Inside `data`, create the following three files:
  - [credentials.json](cci:7://file:///home/darkcode/Codes/Projects/college-attendance/data/credentials.json:0:0-0:0):
    ```json
    {
      "username": "YOUR_USERNAME",
      "password": "YOUR_PASSWORD"
    }
    ```
  - [holidays.json](cci:7://file:///home/darkcode/Codes/Projects/college-attendance/data/holidays.json:0:0-0:0):
    ```json
    {
      "holidays": ["2025-01-01"]
    }
    ```
  - [attendance.json](cci:7://file:///home/darkcode/Codes/Projects/college-attendance/data/attendance.json:0:0-0:0):
    ```json
    []
    ```

**4. Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

- **Home Page**: View the attendance calendar and monthly stats.
- **Settings Page**: Navigate to `/settings` to:
  - Update your college portal username and password.
  - Add or remove custom holiday dates.

## Automation

To run the scraper automatically every day, you can set up a cron job.

**1. Make the script executable:**

```bash
chmod +x scrape.sh
```

**2. Edit your crontab:**

```bash
crontab -e
```

**3. Add the cron job:**

This example runs the scraper script at 8:00 AM every day.

```cron
0 8 * * * /bin/bash /path/to/your/project/scrape.sh
```

> **Note**: Make sure to replace `/path/to/your/project/` with the absolute path to the `college-attendance` directory.
