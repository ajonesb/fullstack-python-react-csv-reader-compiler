# Backend Architecture

NestJS API that receives CSV files, streams the data, converts prices to multiple currencies, stores in PostgreSQL, and serves filtered product queries.

## How It Works

```
Request comes in
    ↓
Controller - validates & extracts data
    ↓
Service - handles business logic
    ↓
Repository - queries database
    ↓
Database (PostgreSQL)
    ↓
Response sent back
```

## API Endpoints

### **POST** `/api/upload`

Receives a CSV file and processes it.

**How it works:**
1. Validates file is CSV
2. Fetches exchange rates from external API (single call for all products)
3. Streams the CSV file line-by-line
4. For each row:
   - Validates required fields: `name`, `price`
   - Skips invalid rows
   - Creates currency conversions for EUR, GBP, JPY, CAD, AUD
5. Saves products in batches of 1000 to database
6. Returns success message

**Request:**
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (CSV file)
```

**Response:**
```json
{ "message": "Upload processed successfully" }
```

### **GET** `/api/products`

Returns filtered/sorted products with currency conversions.

**Query Parameters (all optional):**
- `name` - Search by product name
- `minPrice`, `maxPrice` - Filter by USD price range
- `minExpiration`, `maxExpiration` - Filter by expiration date (YYYY-MM-DD)
- `sortBy` - Column to sort: `name`, `price`, `expirationDate`
- `sortOrder` - Direction: `asc` or `desc`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Apple",
    "price": 0.50,
    "expirationDate": "2025-12-31",
    "currencies": {
      "EUR": 0.46,
      "GBP": 0.39,
      "JPY": 75.15,
      "CAD": 0.67,
      "AUD": 0.76
    }
  }
]
```

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2),
  expirationDate DATE,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### ProductConversions Table
```sql
CREATE TABLE product_conversions (
  id UUID PRIMARY KEY,
  productId UUID NOT NULL → products.id (CASCADE delete),
  currency VARCHAR(3),
  rate DECIMAL(10, 6),
  convertedPrice DECIMAL(10, 2)
);
```

**Relationship:**
- One product has many conversions (one per currency)
- Deleting a product deletes all its conversions

## Key Features

### CSV Streaming
- Multer writes the incoming file to disk (`/tmp`) as it arrives — no in-memory buffering regardless of file size
- A `createReadStream` from the temp file is piped through csv-parser row-by-row (constant memory usage)
- Temp file is deleted after processing (success or error)
- Handles 200,000+ row files without loading the file into memory
- Accumulates rows in memory batches of 1000 before saving

### Delimiter Detection
- Detects CSV delimiter (`,`, `;`, or `\t`) from the first line of each chunk
- Converts non-comma delimiters to commas for every chunk before passing to csv-parser
- Supports large multi-chunk files with any supported delimiter

### Currency Conversion
- Fetches latest exchange rates from API once per upload
- Converts each product price to 5 currencies
- Stores both rate and converted price in database

### Filtering & Sorting
- Partial name matching (case-insensitive ILIKE) with wildcard characters (`%`, `_`, `\`) escaped to prevent incorrect matches
- Price range filtering
- Date range filtering
- Sort by any column ascending or descending

### Validation
- Required fields: `name`, `price`
- Data type validation
- Graceful handling of invalid rows (skipped, logged)

## Technologies

- **NestJS** - Framework for building scalable APIs
- **TypeORM** - Database ORM with strong TypeScript support
- **PostgreSQL** - Relational database
- **Axios** - HTTP client for exchange rate API
- **csv-parser** - Stream CSV files efficiently
- **class-validator** - Validate input data
- **class-transformer** - Transform/translate data

## Modules

**Upload Module**
- Receives CSV files
- Streams and parses data
- Orchestrates saving to database

**Products Module**
- Queries products from database
- Filters and sorts results
- Transforms database data to API response format

**Currency Module**
- Fetches exchange rates from external API
- Calculates converted prices

## Error Handling

Returns proper HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid CSV, missing file)
- `500` - Server error (database, API failure)

Each error includes a message explaining what went wrong.

## Performance

- **Streaming:** CSV parsing uses constant memory
- **Batching:** Saves 1000 rows at a time (100x faster than one-by-one)
- **Single API Call:** Exchange rates fetched once per upload
- **Database Indexes:** Queries optimized for filtering
