<div align="center">

<img src="https://raw.githubusercontent.com/marcoXmartins25/Sprint_Base/main/frontend/public/favicon.svg" alt="SprintBase Logo" width="72" height="72" />

# SprintBase

**Sprint management for developers and small teams.**  
Plan sprints · Track tasks · Export PDF reports

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)](LICENSE)

</div>

---

## What is SprintBase?

SprintBase is a full-stack web application for managing development sprints. Built for developers and small teams who want a simple, fast and distraction-free tool — no bloat, no complexity.

Create sprints, manage tasks with priorities and time estimates, assign team members, track progress in real time, and export branded PDF reports, all from a clean and minimal interface.

---

## Features

| | Feature | Description |
|---|---|---|
| 🗂️ | **Sprint Planning** | Create and manage sprints with start/end dates. Active sprint always surfaces first. |
| ✅ | **Task Management** | Full CRUD with priority, status, due dates, hours and assignee. |
| ✏️ | **Inline Editing** | Edit any task field directly in the table — no modals, no friction. |
| 📊 | **Progress Tracking** | Weighted progress bar: Done (100%) · In Progress (50%) · To Do (0%). |
| 👥 | **Team Assignment** | Assign tasks to team members with avatar support. |
| 📄 | **PDF Reports** | Server-side generated reports with full task details, badges and progress bar. |
| 🔒 | **JWT Auth** | Secure authentication with 7-day tokens. Protected file uploads. |
| 🖼️ | **User Profiles** | Display name, email and avatar upload (max 2MB). |

---

## Tech Stack

```
Frontend          Backend           Database
─────────────     ─────────────     ─────────────
React 18          Node.js           PostgreSQL 14+
React Router 6    Express
Tailwind CSS 3    JWT Auth
Vite 5            PDFKit
                  Multer
```

---

## License

MIT © Marco
