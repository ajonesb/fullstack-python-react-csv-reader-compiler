# Frontend Architecture

Simple React components that handle CSV upload, product display, and filtering.

## How It Works

**User opens app**
```
App (page.tsx)
├─ FileUpload component - handles CSV upload
├─ Filters component - handles search/filter inputs
└─ ProductTable component - displays products
```

## Components

### FileUpload.tsx
- Input to select CSV file
- Button to upload
- Shows a progress bar with percentage while uploading (uses axios `onUploadProgress`)
- Displays success/error messages
- Calls `/api/upload` endpoint

### Filters.tsx
- Text input for product name search
- Number inputs for price range (min/max)
- Date inputs for expiration range
- Dropdown to select sort column (name, price, expiration)
- Dropdown to select sort direction (asc/desc)
- Button to reset all filters

When user changes any filter, it sends GET request to `/api/products` with query parameters.

### ProductTable.tsx
- Shows products in a table
- Displays all currencies: USD (original), EUR, GBP, JPY, CAD, AUD
- Shows expiration date
- Shows loading state while fetching
- Shows error message if API call fails
- Shows "No products found" if empty

## Data Flow

```
User uploads CSV
    ↓
FileUpload → POST /api/upload
    ↓
Success → Reload products from API
    ↓
ProductTable shows updated products
```

```
User changes a filter
    ↓
Filters component → onFilterChange callback
    ↓
App state updates → GET /api/products?...
    ↓
ProductTable re-renders with new data
```

## API Calls

**Upload CSV:**
```typescript
POST /api/upload
Body: FormData with 'file'
Response: { message: "Upload processed successfully" }
```

**Get Products:**
```typescript
GET /api/products?name=apple&minPrice=0.50&sortBy=price&sortOrder=asc
Response: Array of products with currency conversions
```

## Styling

Uses Tailwind CSS for all styling:
- `.card` - white box with shadow
- `.btn-primary` - blue button
- `.input-field` - text/number inputs
- `.error-message` - red error box
- `.success-message` - green success box

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Axios** - HTTP requests
- **Tailwind CSS** - Styling
- **React Hooks** - State management (useState, useEffect, useCallback)
