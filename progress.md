# Project Progress & Task List

This document outlines the tasks required to build the College Attendance Tracker. Tasks are organized by milestones.

## Milestone 1: Project Setup & Basic Scraping

- [ ] Initialize Next.js project with Tailwind CSS.
- [ ] Set up project structure (folders for components, pages, api).
- [ ] Install Puppeteer.
- [ ] Create a `.env.local` file for credentials.
- [ ] Implement the basic scraper logic in a standalone script to test login and data fetching.

## Milestone 2: API Endpoints

- [ ] Create the `POST /api/scrape` endpoint to run the Puppeteer script.
- [ ] Create the `GET /api/attendance` endpoint to read and return data from `attendance.json`.
- [ ] Create the `GET /api/status` endpoint to check if today's data exists.
- [ ] Implement data storage logic to write to `attendance.json`.

## Milestone 3: Frontend Development

- [ ] Design the main page layout.
- [ ] Create a reusable Calendar component.
- [ ] Fetch data from `/api/attendance` and display it on the calendar.
- [ ] Add color-coding for different attendance statuses.
- [ ] Create a "Scrape Now" button that calls the `/api/scrape` endpoint.
- [ ] Add a status indicator to show the last scrape time and current status.

## Milestone 4: Polishing and Refinements

- [ ] Add filtering controls for month and year.
- [ ] Implement loading states for API calls.
- [ ] Add comprehensive error handling for both frontend and backend (e.g., scraper fails, API fails).
- [ ] Style the application to be visually appealing and responsive.
- [ ] Write the final `README.md` with setup and usage instructions.

## Future Goals (Optional)

- [ ] Implement an automated daily scraping schedule (e.g., using a cron job).
- [ ] Add data visualization charts (e.g., pie chart for attendance summary).
- [ ] Migrate from a local JSON file to a proper database (e.g., SQLite, Supabase) for better data management.
