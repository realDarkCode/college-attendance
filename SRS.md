# Software Requirements Specification (SRS) - V2

## 1. Introduction

### 1.1 Purpose
This document provides a detailed description of the requirements for the **College Attendance Tracker**. The system is designed to automate the entire lifecycle of attendance tracking for a student: fetching data from a college web portal, storing it persistently, and visualizing it in an intuitive manner. The goal is to eliminate the need for manual, repetitive checks and provide a clear, at-a-glance overview of attendance status.

### 1.2 Scope
The project is a full-stack web application developed using the Next.js framework. Its core functionality involves:
- **Authentication**: Programmatically logging into a college's web portal using stored user credentials.
- **Web Scraping**: Navigating the portal and extracting attendance data using Puppeteer.
- **Data Persistence**: Storing the scraped data in a structured local JSON file.
- **Frontend**: A responsive and interactive user interface built with React and Tailwind CSS for data visualization.

### 1.3 Intended Audience
This document is intended for project developers, testers, and project managers. It establishes a common understanding of the system's capabilities and constraints.

## 2. Overall Description

### 2.1 Product Perspective
The College Attendance Tracker is a standalone, single-user application. It operates on the user's local machine and is not intended for a client-server deployment model with multiple users. It acts as a personal assistant for attendance management.

### 2.2 Product Features
- **Automated Login**: Securely handles user credentials to log into the college portal.
- **Scheduled/Manual Scraping**: Fetches attendance data either on a schedule (future goal) or manually via a user action.
- **Local Data Store**: Maintains a history of attendance in a local JSON file.
- **Calendar Dashboard**: Displays attendance statistics (Present, Absent, Leave) on a monthly calendar view.
- **Data Filtering**: Allows users to filter the calendar view by month, year, and attendance type.
- **Scrape Status**: Clearly indicates if the data for the current day has been successfully fetched.

### 2.3 User Characteristics
The target user is a college student who has access to a personal computer and is comfortable with installing and running a local application. No advanced technical skills are required to operate the application.

### 2.4 Constraints
- **Platform Dependency**: The application is a Node.js project and requires Node.js and npm/yarn to be installed.
- **Scraper Fragility**: The Puppeteer scraper is tightly coupled to the college portal's HTML structure. Any significant changes to the portal's front end will break the scraper and require code maintenance.
- **Local Storage**: The use of a local JSON file means data is not synchronized across devices. The data is only available on the machine where the application is run.
- **Security**: Credentials are to be stored in a `.env.local` file. This is suitable for local use but is not a secure method for a deployed application.

## 3. Specific Requirements

### 3.1 Functional Requirements

#### FR-1: User Authentication
- **FR-1.1**: The system must accept a username and password via environment variables.
- **FR-1.2**: The system must use these credentials to programmatically log into the specified college portal.
- **FR-1.3**: The system must handle login failures gracefully (e.g., incorrect credentials, network issues) and report the error.

#### FR-2: Data Scraping
- **FR-2.1**: The scraping process must be triggerable via a POST request to the `/api/scrape` endpoint.
- **FR-2.2**: The scraper must navigate through the portal to the attendance page.
- **FR-2.3**: It must extract the total working days, present days, absent days, and leave days.
- **FR-2.4**: The scraper must handle session management (e.g., cookies) to stay logged in.

#### FR-3: Data Storage
- **FR-3.1**: Scraped data must be appended to a local file named `attendance.json`.
- **FR-3.2**: The system must create the file if it does not exist.
- **FR-3.3**: Each entry must be a JSON object containing `date`, `name`, and a `data` object with attendance stats, as per the specified format.

#### FR-4: Data Visualization
- **FR-4.1**: The main UI must be a calendar view.
- **FR-4.2**: The system must fetch and display all records from `attendance.json` via the `/api/attendance` endpoint.
- **FR-4.3**: Days on the calendar should be color-coded or marked to distinguish between Present, Absent, and Leave.
- **FR-4.4**: The UI must provide controls to filter the view by month and year.

#### FR-5: Status and Manual Control
- **FR-5.1**: The UI must contain a button to trigger the manual scraping process.
- **FR-5.2**: The UI must display the status of the last scrape (e.g., 'Last updated: ...', 'Scraping now...', 'Error').
- **FR-5.3**: The `/api/status` endpoint (GET) will return a boolean indicating if data for the current date exists.

### 3.2 Non-Functional Requirements

- **NFR-1: Performance**: The front-end interface must load in under 3 seconds. API responses should be returned within 500ms, excluding the scraping process itself.
- **NFR-2: Usability**: The user interface must be intuitive, requiring no documentation for a user to understand its basic functions.
- **NFR-3: Reliability**: The scraper should be robust enough to handle minor, non-structural changes in the portal's HTML. It should include error handling to prevent crashes.
- **NFR-4: Maintainability**: Code must be well-commented, particularly the scraper logic, to facilitate easier updates when the college portal changes.

## 4. System Architecture

- **Fullstack Framework**: Next.js
- **UI Layer**: React with functional components and Hooks. Styled with Tailwind CSS.
- **Backend API**: Next.js API Routes (Serverless Functions).
- **Scraping Engine**: Puppeteer, running in a headless browser instance.
- **Data Store**: A single local `attendance.json` file.

## 5. Assumptions and Dependencies

- **A-1**: The user has a stable internet connection.
- **A-2**: The college portal website is accessible and its structure remains consistent.
- **D-1**: The project depends on Node.js, Next.js, React, Puppeteer, and Tailwind CSS.

## 6. Glossary

- **Puppeteer**: A Node library that provides a high-level API to control headless Chrome or Chromium.
- **API Route**: A server-side endpoint in Next.js for handling backend logic.
- **Scraping**: The process of programmatically extracting data from a website.
