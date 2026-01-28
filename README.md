# Operational System for Residential Complex

Sistem manajemen kompleks residensial dengan dashboard premium sesuai desain.

## Tech Stack
- **Backend**: NestJS + TypeORM
- **Frontend**: React (Vite) + Tailwind CSS + Ant Design
- **Database**: MariaDB

## Prerequisites
- Node.js v18+
- MariaDB / MySQL
- Docker & Docker Compose (optional for deployment)

## Setup & Running

### 1. Database Setup
Buat database bernama `residential_complex` di MariaDB lokal Anda.
Atur kredensial di `backend/.env`.

### 2. Backend
```bash
cd backend
npm install
npm run start:dev
```
*Backend akan otomatis melakukan seeding data jika database masih kosong.*

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Akses di `http://localhost:5173`.

### 4. Docker Deployment
```bash
docker-compose up --build
```

## Features
- **Dashboard Admin**: KPI Cards, Open Tickets Table, Billing Summary, Today's Activity.
- **Ticketing**: CRUD operation for maintenance tickets.
- **Billing**: Outstanding balance calculation and invoice summaries.
- **Auth**: JWT based authentication (Structure ready).
- **Seeding**: Demo data auto-population.

## File Structure
- `backend/src/entities`: Database models.
- `backend/src/dashboard`: Aggregation logic for main view.
- `frontend/src/pages/Dashboard.tsx`: UI utama mengikuti desain gambar.
