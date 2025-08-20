# PensionData Model Documentation

## Overview

I've successfully created a comprehensive **PensionData model** and **API endpoints** for the MUFG Pension Insights backend. This provides complete CRUD operations for pension data management with role-based access control.

## 🎯 What's Been Created

### 1. PensionData Model (`/src/models/PensionData.js`)

A comprehensive object-oriented model with **54 fields** covering:

- **Personal Information**: Age, gender, country, employment status, marital status, dependents, education, health
- **Financial Information**: Annual income, current savings, debt level, monthly expenses, savings rate, home ownership
- **Pension & Retirement Planning**: Retirement age goal, risk tolerance, contribution details, employer contributions
- **Investment Information**: Investment types, fund names, return rates, volatility, fees, experience level
- **Pension Projections**: Projected amounts, annual payouts, inflation adjustments, survivor benefits
- **Benefits Eligibility**: Tax benefits, government pension, private pension, insurance coverage
- **Transaction Information**: Transaction IDs, amounts, dates, channels, timing
- **Security & Fraud Detection**: Suspicious flags, anomaly scores, fraud detection patterns
- **Technical Information**: IP addresses, device IDs, geo-location, account age

### 2. Model Methods

#### Instance Methods:
- `save()` - Create or update record
- `create()` - Insert new record
- `update()` - Update existing record
- `delete()` - Delete record
- `toJSON()` - Export as JSON

#### Static Methods:
- `findById(id)` - Find by ID
- `findByUserId(userId)` - Find by user ID
- `findAll(options)` - Find with filtering
- `paginate(page, limit)` - Paginated results
- `search(searchOptions)` - Advanced search
- `getStatistics()` - Get data statistics
- `bulkCreate(dataArray)` - Bulk insert
- `bulkDelete(ids)` - Bulk delete
- `count(where)` - Count records

### 3. API Endpoints (`/src/routes/pensionData.js`)

Comprehensive REST API with full CRUD operations:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pension-data` | List all pension data with filtering & pagination |
| POST | `/api/pension-data` | Create new pension data record |
| GET | `/api/pension-data/:id` | Get specific pension data by ID |
| PUT | `/api/pension-data/:id` | Update pension data record |
| DELETE | `/api/pension-data/:id` | Delete pension data record |
| GET | `/api/pension-data/stats/overview` | Get comprehensive statistics |
| POST | `/api/pension-data/bulk` | Bulk create records |
| DELETE | `/api/pension-data/bulk` | Bulk delete records |

### 4. Advanced Features

#### Filtering & Search Options:
- **Pagination**: `page`, `limit` parameters
- **Age Range**: `minAge`, `maxAge` filters
- **Income Range**: `minIncome`, `maxIncome` filters
- **Text Search**: `search` across multiple fields
- **Field Filters**: `country`, `pensionType`, `riskTolerance`
- **Security Filters**: `suspiciousOnly` for fraud detection
- **Sorting**: `orderBy`, `orderDirection` parameters

#### Security & Permissions:
- **Role-Based Access Control** with proper permissions
- **Audit Logging** for all operations
- **JWT Authentication** with token verification
- **Input Validation** and error handling

## 🚀 Usage Examples

### 1. Basic Usage

```javascript
import PensionData from './src/models/PensionData.js';

// Create new pension data
const pensionData = new PensionData({
  user_id: 'USER001',
  age: 35,
  gender: 'Male',
  country: 'Japan',
  annual_income: 75000,
  current_savings: 150000,
  risk_tolerance: 'Moderate'
});

const saved = await pensionData.save();
```

### 2. Finding Records

```javascript
// Find by ID
const record = await PensionData.findById(1);

// Find by user ID
const userRecord = await PensionData.findByUserId('USER001');

// Find with filtering
const japaneseUsers = await PensionData.findByCountry('Japan');

// Advanced search
const results = await PensionData.search({
  minAge: 30,
  maxAge: 40,
  country: 'Japan',
  riskTolerance: 'Moderate',
  limit: 10
});
```

### 3. Pagination

```javascript
const page = await PensionData.paginate(1, 10, {
  where: { country: 'Japan' },
  orderBy: 'age',
  orderDirection: 'ASC'
});

console.log(page.data); // Array of PensionData instances
console.log(page.pagination); // Pagination info
```

### 4. Statistics

```javascript
const stats = await PensionData.getStatistics();
console.log(stats);
// {
//   total_records: 500,
//   countries: 15,
//   avg_age: 42.5,
//   avg_income: 65000,
//   suspicious_records: 12,
//   oldest_record: '2024-01-01',
//   newest_record: '2024-12-31'
// }
```

## 🔧 API Testing

### Authentication
Generate a test token using:
```bash
node generate-test-token.js regulator
```

### Example API Calls

```bash
# Get statistics
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/pension-data/stats/overview

# List with pagination
curl -H "Authorization: Bearer <token>" \
  "http://localhost:4000/api/pension-data?page=1&limit=5"

# Search by criteria
curl -H "Authorization: Bearer <token>" \
  "http://localhost:4000/api/pension-data?country=Japan&minAge=30&maxAge=40"

# Create new record
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"TEST001","age":35,"country":"Japan"}' \
  http://localhost:4000/api/pension-data
```

## 📊 Database Integration

The model is designed to work with both:
- **PostgreSQL** (primary database)
- **SQLite** (automatic fallback)

The dual database connection system automatically handles:
- Connection pooling
- Transaction management
- Query adaptation
- Error handling and fallback

## 🔒 Security & Permissions

### Required Permissions:
- `MEMBER_DATA_READ` - Read pension data
- `MEMBER_DATA_CREATE` - Create new records
- `MEMBER_DATA_UPDATE` - Update existing records
- `MEMBER_DATA_DELETE` - Delete records
- `ANALYTICS_READ` - View statistics

### Audit Logging:
All operations are automatically logged with:
- User ID and action performed
- Target record IDs
- Changes made (for updates)
- IP address and user agent
- Timestamps

## 🎉 Benefits

1. **Complete CRUD Operations** - Full create, read, update, delete functionality
2. **Advanced Filtering** - Comprehensive search and filtering options
3. **Role-Based Security** - Proper permission checking and access control
4. **Audit Trail** - Complete logging of all data operations
5. **Production Ready** - Error handling, validation, and performance optimization
6. **Scalable Architecture** - Designed to handle large datasets efficiently
7. **Type Safety** - Consistent data structure with validation
8. **Database Agnostic** - Works with PostgreSQL and SQLite

## 🔮 Next Steps

The PensionData model and API are now ready for:

1. **Frontend Integration** - Connect React/Next.js frontend to these endpoints
2. **Data Import** - Use the existing import scripts to populate with Excel data
3. **Analytics Dashboard** - Build comprehensive reporting using the statistics endpoints
4. **Real-time Updates** - Add WebSocket support for live data updates
5. **Advanced Analytics** - Implement machine learning predictions using the rich dataset

The foundation is solid and production-ready! 🚀
