# Chit Fund Management API (FastAPI + PostgreSQL)

A high-performance async RESTful backend built with **FastAPI**, **PostgreSQL**, and **SQLAlchemy 2.0** for managing Chit Fund operations (Chit Groups, Member Enrollment, Monthly Auctions, and Installment Payments).

## Architecture & Features

- **Framework**: FastAPI (Python 3.10+) with async support & automated Swagger UI (`/docs`)
- **Database**: PostgreSQL with SQLAlchemy 2.0 ORM and connection pooling
- **Migrations**: Alembic migrations included
- **Data Policy**: **Zero sample data seeded** by default. Clean schema ready for production data.
- **CORS**: Configured for Next.js frontend (`http://localhost:3000`)

---

## Chit Fund Modules

1. **Members** (`/api/v1/members`)
   - Add, list, search, and manage chit subscribers
   - Uniqueness check on phone and email
2. **Chit Groups** (`/api/v1/groups`)
   - Create chit schemes with pool value, duration, max members, commission %
   - Enforce ticket allocation & max member capacity per group
3. **Auctions** (`/api/v1/auctions`)
   - Conduct chit auctions and record discount bids
   - Automatically computes:
     - Foreman Commission ($Value \times \%Rate$)
     - Member Dividend ($Total\ Discount - Commission$)
     - Net Monthly Installment due per subscriber
     - Prize amount released to the winning subscriber
4. **Payments** (`/api/v1/payments`)
   - Track monthly installment collections with UPI, cash, bank transfer, or cheque
5. **Dashboard** (`/api/v1/dashboard/stats`)
   - Aggregated metrics across active groups, collections, and distributions

---

## Setup & Running

### 1. Prerequisites
Ensure you have Python 3.10+ installed and a running PostgreSQL instance (local PostgreSQL, Supabase, Neon, or Docker).

### 2. Configuration
Copy `.env.example` to `.env` and set your PostgreSQL connection string:
```bash
cp .env.example .env
```
Edit `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/chits_db
```

### 3. Activate Virtual Environment & Install Dependencies
```bash
# Windows
.\venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Run Migrations (Optional, Tables also auto-create on startup)
```bash
alembic upgrade head
```

### 5. Start the Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Open your browser at:
- **API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative Redoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
