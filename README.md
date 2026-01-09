# TTSP Management Review Portal

Enterprise mobile-first web application for Post-Delivery Revisions (PDR) management and analytics. Built with React, Vite, TypeScript, and Supabase.

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18 or later)
- Visual Studio Code

### 2. Installation
Open your terminal in this folder and run:

```bash
npm install
```

### 3. Environment Setup
Create a file named `.env` in the root directory (next to `package.json`).
Add your Supabase credentials (found in Supabase Settings > API):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

## 🗄️ Database Setup (Supabase)

1.  Log in to the app using "Admin Access" (Password: **DAN2026**).
2.  Click the **Lock Icon** beside the Sign Out button.
3.  Copy the SQL Script provided in the modal.
4.  Go to your Supabase Dashboard > SQL Editor.
5.  Paste and run the script to create the `pdr_records` table and enable Row Level Security (RLS).

## 🛠️ Tech Stack
-   **Framework**: React 18 + Vite
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS + Lucid Icons
-   **Charts**: Recharts
-   **Data Processing**: Papaparse (CSV), XLSX (Excel)
-   **Backend**: Supabase (PostgreSQL + Auth)

## 📱 Features
-   **Bulk Import**: Drag & Drop Excel/CSV files to populate the database.
-   **Offline Mode**: Falls back to Local Storage if Supabase is unreachable.
-   **PDR Management**: CRUD operations for revision logs.
-   **Analytics**: Real-time charts for cost and manhour trends.
-   **Theming**: 4 premium themes with Dark Mode support.
