# Python React CSV Product Catalog

A full-stack application for uploading CSV files, converting product prices to multiple currencies, and browsing with filters.

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL running locally

### Setup Database

```bash
# Set PostgreSQL password
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# Create database
PGPASSWORD=postgres psql -U postgres -h localhost -c "CREATE DATABASE products;"
```

### Install & Run

```bash
# Install dependencies
npm install
npm run install:all

# Configure environment
# Backend: backend/.env
NODE_ENV=development
BACKEND_PORT=3001
DATABASE_URL=postgres://postgres:postgres@localhost:5432/products
FRONTEND_URL=http://localhost:3000

# Frontend: frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:3001

# Start both (backend + frontend)
npm run dev

# Or separately:
# npm run dev:backend
# npm run dev:frontend
```

Visit: `http://localhost:3000`

## How It Works

### Upload CSV
1. Click "Choose File" and select a CSV with: `name`, `price`, `expirationDate`
2. Click "Upload CSV"
3. A progress bar tracks the upload; backend streams the file from disk, converts prices to EUR/GBP/JPY/CAD/AUD
4. Products appear in the table

Supports comma, semicolon, and tab-delimited CSVs. Invalid rows are skipped; the upload still succeeds. Re-uploading a file appends new rows (no de-duplication).

### Browse & Filter
- Search by product name
- Filter by price range and expiration dates
- Sort by name, price, or expiration date

## API Endpoints

**POST** `/api/upload`
- Upload CSV file
- Returns: `{ message: "Upload processed successfully" }`

**GET** `/api/products`
- Query parameters (all optional):
  - `name` - Search by product name
  - `minPrice`, `maxPrice` - Price range (USD)
  - `minExpiration`, `maxExpiration` - Date range (YYYY-MM-DD)
  - `sortBy` - `name`, `price`, or `expirationDate`
  - `sortOrder` - `asc` or `desc`

## Example CSV

```csv
name,price,expirationDate
Apple,0.50,2025-12-31
Banana,0.30,2025-11-15
```

## Troubleshooting

**Database connection error?**
- Ensure PostgreSQL is running: `psql -U postgres -h localhost -c "SELECT 1;"`
- Check DATABASE_URL in backend/.env

**Products not showing after upload?**
- Check backend logs for errors
- Refresh the browser

**Port already in use?**
- Backend default: 3001
- Frontend default: 3000
- Change in .env files if needed


**Note on duplicates:** Re-uploading the same CSV appends new rows (no automatic de-duplication). In production this could use unique constraints or upsert logic.

## Demo
view presentation demo here : https://share.vidyard.com/watch/sq3uTwhpbvhfDJbxk4PkBp

<img width="1891" height="1007" alt="image" src="https://github.com/user-attachments/assets/c18d5232-c08a-4b28-bf56-9bf3e79b1b91" />

<img width="1891" height="1007" alt="image" src="https://github.com/user-attachments/assets/5a035924-8027-45b2-bb93-59b3af1bc6eb" />

<img width="1891" height="1007" alt="image" src="https://github.com/user-attachments/assets/3aa3dcf6-77b4-4587-9f92-a92fbed60fbb" />