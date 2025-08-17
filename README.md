# MUFG Pension Insights Platform

A comprehensive backend API for pension data analysis and insights, built with Express.js.

## 🏗️ Project Structure

```
mufg-pension-insights/
├── backend/                    # Express.js Backend API
│   ├── routes/                 # API Routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User management
│   │   ├── data.js            # Data processing
│   │   └── charts.js          # Chart data
│   ├── middleware/            # Custom middleware
│   │   └── auth.js           # Authentication middleware
│   ├── index.js              # Main server file
│   ├── package.json          # Backend dependencies
│   ├── .env.example          # Environment variables template
│   └── .env                  # Environment variables (gitignored)
│
├── model training/           # ML Models and Training Scripts
├── code_version_3.html      # Original HTML prototype
├── package.json             # Root project configuration
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahilgoyal7214/MUFG.git
   cd MUFG
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   
   # Edit the .env file with your configuration
   ```

4. **Start the backend server**
   ```bash
   # From backend directory
   pnpm run dev  # Starts backend on http://localhost:4000
   ```

## 📋 Available Scripts

### Root Scripts
```bash
pnpm run dev              # Start backend development server
pnpm run build            # Build backend for production
pnpm run start            # Start backend production server
pnpm run install:backend  # Install backend dependencies
pnpm run clean            # Clean node_modules
pnpm run lint             # Run backend linting
pnpm run test             # Run backend tests
```

### Backend Scripts (from backend/ directory)
```bash
pnpm run dev              # Start development server with nodemon
pnpm run start            # Start production server
pnpm test                 # Run tests
pnpm run lint             # Run ESLint
```

## 🛠️ Tech Stack

**Backend:**
- Express.js - Web framework
- JWT - Authentication
- bcryptjs - Password hashing
- CORS - Cross-origin resource sharing
- Helmet - Security middleware
- Morgan - HTTP request logger
- Compression - Response compression

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=4000
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

## 📡 API Endpoints

### 📚 **Interactive API Documentation**
**🚀 Swagger UI**: http://localhost:4000/api-docs
- Test all endpoints directly in your browser
- Comprehensive schemas and examples
- Authentication testing with JWT tokens

**📋 API Overview**: http://localhost:4000/api
- Complete endpoint listing
- OpenAPI specification download

### Authentication
- `POST /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user info

### Users  
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Members
- `GET /api/members/:id` - Get member data
- `PUT /api/members/:id` - Update member data

### 💰 **KPI Calculations** (Your Financial Functions)
- `POST /api/kpi/retirement-age` - Calculate retirement age projection
- `POST /api/kpi/total-corpus` - Predict total retirement corpus
- `POST /api/kpi/retirement-readiness` - Comprehensive readiness analysis

### Analytics & Logs
- `GET /api/analytics/*` - Business intelligence endpoints
- `GET /api/logs/*` - Audit logs (Regulator access only)

## 🐳 Docker Support

```bash
# Build and run with Docker
docker build -t mufg-backend ./backend
docker run -p 4000:4000 mufg-backend
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email support@mufg.com or create an issue on GitHub.
