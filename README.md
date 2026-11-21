# Chit Fund Management System

A production-ready **Chit Fund Management System** built with **Next.js (App Router, Tailwind CSS, TypeScript)** on the frontend, **FastAPI** on the backend, and **PostgreSQL** (SQLAlchemy 2.0 & Alembic) as the database.

> [!NOTE]
> **Zero Initial Data**: In accordance with your request, the database schemas, tables, and API models are established with **no mock, dummy, or seed data**. The database starts completely clean and ready for your real records.

---

## Features & Architecture

### 1. WhatsApp Web Integration ([wwebjs.dev](https://wwebjs.dev/)) & Settings
- **Settings Page** (`/settings`):
  - Dedicated WhatsApp Web Client integration powered by [whatsapp-web.js (wwebjs.dev)](https://wwebjs.dev/).
  - **Separate User QR Code**: Allows selecting which specific user account (Foreperson Admin, Branch Manager, or any enrolled Subscriber) to generate and display the WhatsApp QR code for.
  - Interactive QR scanner with auto-refresh timer, device link simulation, session status, and disconnect options.
  - Test Chit Notification sender to dispatch auction announcements, receipts, and dividend alerts via WhatsApp.

### 2. Authentication & User Roles (`login-02`)
- **Login Page** (`/login`): Split-screen layout featuring role-based sign in.
- **Sign Up Page** (`/signup`): Matching split-screen registration page allowing new users to select their initial role (**Chit Organizer** or **Chit Subscriber**).

### 3. Dashboard & Navigation (`sidebar-07` + OrgMenu)
- Built using Shadcn's **sidebar-07** block architecture with collapsible sidebar rails, breadcrumbs, and live backend connection health indicator.
- **OrgMenu** (`TeamSwitcher`): Organization & Branch Switcher (*Apex Chits & Finance*, *Royal Chits Ltd*, *Sri Lakshmi Mutual Chits*).
- **Two User Roles**:
  - **Chit Organizer (Foreperson / Admin)**: Full controls over schemes, subscriber enrollments, auctions, and collections.
  - **Chit Subscriber (Member / Investor)**: Subscriber portal for checking enrolled tickets, participating in live auctions, and viewing dividend returns.
  - **1-Click Role Switcher**: Directly in the sidebar header and user profile menu.

---

## Quick Start Guide

### 1. Backend Setup (FastAPI & PostgreSQL)

1. Open PowerShell and navigate to `backend`:
   ```powershell
   cd D:\chits\backend
   ```
2. Configure your PostgreSQL connection string in [backend/.env](file:///D:/chits/backend/.env):
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/chits_db
   ```
3. Run the FastAPI development server:
   ```powershell
   .\venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - Interactive Swagger API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend Setup (Next.js)

1. Open a second PowerShell window and navigate to `frontend`:
   ```powershell
   cd D:\chits\frontend
   ```
2. Start the Next.js development server:
   ```powershell
   npm run dev
   ```
3. Open in your browser:
   - **Settings & WhatsApp Web (wwebjs.dev)**: [http://localhost:3000/settings](http://localhost:3000/settings)
   - **Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - **Login Page**: [http://localhost:3000/login](http://localhost:3000/login)
   - **Sign Up Page**: [http://localhost:3000/signup](http://localhost:3000/signup)
