# Mockomps

A web application for managing and displaying results for a climbing competition series. Practice through competition.

## Table of Contents

- [Mockomps](#mockomps)
  - [Table of Contents](#table-of-contents)
  - [About](#about)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the Application](#running-the-application)
  - [Usage](#usage)
  - [Admin Features](#admin-features)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)

## About

Mockomps is a Progressive Web Application (PWA) designed to streamline the management and display of climbing competition data. It serves as a central hub for climbers to view schedules, check results, track their progress, and register for events. The application also includes an administrative interface for competition organizers to manage boulders, finalists, and judge final rounds. Data is primarily sourced from and submitted to Google Sheets via Google Apps Script.

## Features

- **Competition Schedule:** View upcoming and past competition dates and details.
- **Results & Leaderboards:** Access detailed results for individual competitions and overall circuit leaderboards for both qualification rounds and finals.
- **Climber Profiles:** Search for climbers, view their personal information, competition history, and performance statistics (including grade-specific progress charts).
- **Climber Registration:** Register for upcoming competitions.
- **Quali Results Submission:** Climbers can submit their own qualification round results.
- **Rules & Format:** Comprehensive explanation of the competition rules, scoring, and circuit structure.
- **Progressive Web App (PWA):** Installable on mobile and desktop for an app-like experience.

## Technologies Used

- **Frontend:**
    - HTML5
    - CSS3 (Tailwind CSS for styling)
    - JavaScript (Vanilla JS for application logic and routing)
    - Chart.js (for data visualization in climber profiles)
- **Backend:**
    - Google Apps Script (`doPost.gs`) for handling form submissions and interacting with Google Sheets.
- **Data Storage:**
    - Google Sheets (used as a database, with data published as CSV for frontend consumption).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You only need a modern web browser to run this application. No specific server environment or build tools are required for basic usage, as it's a static site that fetches data directly from published Google Sheets.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mockomps/mockomps.github.io.git
    ```
2.  **Navigate into the project directory:**
    ```bash
    cd mockomps.github.io
    ```

### Running the Application

Open the `index.html` file directly in your web browser.

```bash
# Example:
# On Linux/macOS
open index.html

# On Windows
start index.html
```

## Usage

- **Navigation:** Use the main menu buttons on the home page to navigate to different sections like Calendar, Results, Climbers, Leaderboards, Rules, About, and Sign Up.
- **Viewing Results:** Browse competition results by selecting a competition from the "Results" page. You can then switch between overall qualification standings, individual quali rounds, and finals results.
- **Climber Details:** Click on a climber's name in any list to view their detailed profile, including historical performance and progress charts.
- **Submitting Quali Results:** Use the "Submit Results" button on the home page to log your performance for active qualification rounds.
- **Registration:** Sign up for competitions via the "Sign Up" button.

## Admin Features

Access to admin features requires a PIN. These functionalities are for competition organizers:

- **Manage Qualis Boulders:** Add, edit, or remove boulders for qualification rounds.
- **Manage Finals Rosters:** Select and manage the list of climbers participating in a final round.
- **Judges App:** A dedicated interface for judges to submit real-time results for final boulders, including tops, zones, and attempts.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/YourFeature`).
6.  Open a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE.md) - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

For questions or feedback, please reach out:

- Mockomps Team - [mockomps@gmail.com](mailto:mockomps@gmail.com) (Placeholder - replace with actual contact)
- Project Link: [https://github.com/mockomps/mockomps.github.io](https://github.com/mockomps/mockomps.github.io)