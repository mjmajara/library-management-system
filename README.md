#  MAJARA LIBRARY — Library & Inventory Management System

A full-stack, responsive web application for managing library books, tracking inventory availability, handling stock additions and borrowing deductions, and administering user accounts.

Built with a **React Frontend** (React Hooks, Router, Controlled Forms, Fetch API) and a **Node.js / Express REST API Backend** supporting **PostgreSQL, MySQL, and SQLite**.

---

##  Table of Contents
1. [Key Features & Functional Requirements](#-key-features--functional-requirements)
2. [Technology Stack](#-technology-stack)
3. [Project Structure](#-project-structure)
4. [Component Composition Architecture](#-component-composition-architecture)
5. [Quick Start Guide](#-quick-start-guide)
6. [Database Setup (PostgreSQL)](#-database-setup)
7. [REST API Documentation](#-rest-api-documentation)
8. [GitHub Submission Instructions](#-github-submission-instructions)
9. [Marking Criteria Compliance Matrix](#-marking-criteria-compliance-matrix)

---

##  Key Features & Functional Requirements

### 1. Book Management
- **Add New Books**: Controlled form capturing `Title`, `Author`, `Genre`, `ISBN`, and `Initial Quantity`.
- **Validation**: Client-side validation ensuring valid non-empty fields, positive integers for quantity, and standard ISBN structure. Uniqueness checked on the backend.
- **Editable Book Inventory**: Displays catalogued books with instant inline/modal **Update** and **Delete** actions.
- **Search & Filtering**: Real-time search across titles, authors, and ISBNs, plus category filtering by genre.

### 2. Availability Management & Stock Control
- **Real-Time Stock Tracking**: Maintains live counts of total copies vs. available copies.
- **Stock Deductions (`BORROW`)**: Members can borrow copies; automatically prevents borrowing when stock is 0 or insufficient.
- **Stock Additions (`RESTOCK`)**: Adds stock when shipments or new copies arrive.
- **Returns (`RETURN`)**: Restores borrowed copies back into the active stock pool.
- **Transaction History Log**: Comprehensive audit log recording timestamps, book details, member details, transaction type (`BORROW` / `RESTOCK` / `RETURN`), stock change (`prev to new`), and notes.

### 3. User Management & Authentication
- **User Authentication Portal**: Login by Membership ID (e.g., `ADM-1001` or `MEM-2001`).
- **Quick Demo Switcher**: One-click login for examiners to easily test Admin vs. Member roles.
- **Admin Control**:
  - Add new users (`Name`, `Membership ID`, `Role`: Admin/Member, `Email`).
  - Update user details.
  - Delete user accounts with safe foreign key handling.

### 4. User Interface & Dashboard Design
- **Availability Overview**: View books in either a responsive **Data Table** or **Card Grid** layout.
- **Low Stock Visual Highlighting**: Prominently flags titles with fewer than 2 available copies (`< 2`) using amber alert badges and pulsating status indicators.
- **Interactive Metrics**: Live metric cards displaying Total Titles, Available Copies, Low Stock Alerts, and Active Members.
- **Toast Notifications**: Clean feedback banners for successful operations and validation errors.

---

##  Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, React Hooks (`useState`, `useEffect`, `useContext`), Lucide React Icons, Vite |
| **Styling** | Modern CSS Design System (Custom properties, Flexbox/Grid, Responsive breakpoints) |
| **Communication** | Native Fetch API (`src/services/api.js`) |
| **Backend** | Node.js, Express.js RESTful API, CORS, Express JSON middleware |
| **Database** | Multi-engine support: **PostgreSQL** (`pg`), **MySQL** (`mysql2`), and **SQLite** (`sqlite3` local zero-config fallback) |

---

##  Project Structure

```text
library-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # Unified database adapter (PostgreSQL)
│   ├── controllers/
│   │   ├── bookController.js     # CRUD operations for /books
│   │   ├── transactionController.js # Stock borrow, restock, stats for /transactions
│   │   └── userController.js     # User registration, CRUD, and login for /users
│   ├── database/
│   │   ├── schema-postgres.sql   # PostgreSQL table definitions & indexes
│   │   ├── schema-mysql.sql      # MySQL table definitions & constraints
│   │   └── seed-data.sql         # Initial sample seed dataset
│   ├── middleware/
│   │   └── errorHandler.js       # Centralized 404 & error handlers
│   ├── routes/
│   │   ├── bookRoutes.js         # Express routes for /books
│   │   ├── transactionRoutes.js  # Express routes for /transactions
│   │   └── userRoutes.js        # Express routes for /users
│   ├── .env.example              # Backend environment variable template
│   ├── package.json              # Backend dependencies & scripts
│   ├── server.js                 # Express application entrypoint
│   └── test-api.js               # Automated integration test suite
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddBookForm.jsx   # Controlled form for registering new books
│   │   │   ├── AlertNotification.jsx # Toast and banner notifications
│   │   │   ├── BookCard.jsx      # Card layout item for books
│   │   │   ├── BookList.jsx      # Reusable table and grid component
│   │   │   ├── EditBookModal.jsx # Controlled modal dialog to edit books
│   │   │   ├── Footer.jsx        # Footer component
│   │   │   ├── LowStockBadge.jsx # Dynamic badge (< 2 copies alert)
│   │   │   ├── Navbar.jsx        # Responsive navigation with active route highlights & DB status
│   │   │   ├── StatCard.jsx      # Metric card for dashboard statistics
│   │   │   ├── TransactionForm.jsx # Controlled form to add/deduct stock with live preview
│   │   │   ├── TransactionHistory.jsx # Audit table with filtering & search
│   │   │   ├── UserForm.jsx      # Controlled form to add/update users
│   │   │   └── UserList.jsx      # Table view of users with Update & Delete actions
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication and session state
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Overview, stats, low-stock alerts & availability
│   │   │   ├── BookManagement.jsx# Add book form + editable book inventory
│   │   │   ├── Transactions.jsx  # Stock borrow/restock actions + history log
│   │   │   └── UserManagement.jsx# Login portal + Admin user CRUD
│   │   ├── services/
│   │   │   └── api.js            # Centralized Fetch API wrappers
│   │   ├── App.jsx               # React Router route configuration
│   │   ├── index.css             # Cohesive responsive design system
│   │   └── main.jsx              # Application bootstrap
│   ├── index.html
│   ├── package.json              # Frontend dependencies & scripts
│   └── vite.config.js            # Vite build and proxy configuration
│
├── start.bat                     # Windows double-click runner (opens backend & frontend)
├── start-all.ps1                 # PowerShell double-click runner
├── .gitignore                    # Git ignore file for node_modules, build & env
└── README.md                     # Complete project documentation
```

---

##  Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### Option 1: One-Click Launch (Windows)
Double-click `start.bat` in the project root folder. It opens both the backend and frontend in separate terminal windows automatically.

### Option 2: Running Manually

#### Step 1: Start the Backend (Port 5000)
```bash
cd backend
npm install
npm start
```

#### Step 2: Start the Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser!

---

## Live Demo (GitHub Pages, browser-only version)

The app in the repository root is a browser-only version that stores its data in localStorage, so it can be hosted on GitHub Pages. The full-stack version (React + Express + database) is in `frontend/` and `backend/` and must be run locally as described above.

Live demo: https://mjmajara.github.io/library-management-system/

To run the browser-only version from the repository root:

```bash
npm install
npm run dev       # development server
npm run build     # production build in dist/
npm run deploy    # publish dist/ to GitHub Pages
```
Default logins: `MAPHIKE MAJARA` / `MJ-77` (admin).
