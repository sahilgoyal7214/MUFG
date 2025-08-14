# MUFG Pension Insights Platform

A comprehensive full-stack application for pension data analysis and insights, built with Next.js and Express.js.

## 🏗️ Project Structure

```
mufg-pension-insights/
├── frontend/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── globals.css     # Global styles
│   │   │   ├── layout.js       # Root layout
│   │   │   └── page.js         # Home page
│   │   └── components/         # React Components
│   │       ├── Dashboard.js    # Main dashboard
│   │       ├── LoginForm.js    # Login component
│   │       ├── Navigation.js   # Navigation component
│   │       ├── RoleSelection.js # Role selection
│   │       └── roles/          # Role-specific components
│   │           ├── MemberContent.js
│   │           ├── AdvisorContent.js
│   │           └── RegulatorContent.js
│   ├── public/                 # Static assets
│   ├── package.json           # Frontend dependencies
│   ├── next.config.mjs        # Next.js configuration
│   ├── postcss.config.mjs     # PostCSS configuration
│   ├── eslint.config.mjs      # ESLint configuration
│   └── jsconfig.json          # JavaScript configuration
│
├── backend/                    # Express.js Backend API
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User management
│   │   ├── data.js            # Data management
│   │   └── charts.js          # Chart generation
│   ├── middleware/            # Express middleware
│   │   └── auth.js            # Authentication middleware
│   ├── index.js               # Main server file
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
│
├── package.json               # Root package.json (monorepo)
├── .gitignore                # Git ignore file
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+ or pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahilgoyal7214/MUFG.git
   cd MUFG
   ```

2. **Install dependencies for all packages**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../backend && pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment is already configured in backend/.env
   # Update JWT_SECRET and other variables as needed
   ```

4. **Start the development servers**
   ```bash
   # From root directory - starts both frontend and backend
   npm run dev
   
   # Or start individually:
   npm run dev:frontend  # Starts frontend on http://localhost:3000
   npm run dev:backend   # Starts backend on http://localhost:4000
   ```

## 🎯 Features

### Frontend (Next.js)
- **Role-based Authentication**: Member, Advisor, Regulator portals
- **Interactive Dashboard**: Role-specific content and navigation
- **Data Visualization**: Plotly.js charts for pension data analysis
- **Responsive Design**: Tailwind CSS with dark mode support
- **Modern React**: React 19 with Next.js 15 App Router

### Backend (Express.js)
- **RESTful API**: Clean API structure with authentication
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for each role
- **Data Management**: Pension data upload and processing
- **Chart Generation**: Dynamic chart data generation
- **Security**: Helmet, CORS, compression middleware

## 🔐 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Member | `member1` | `password123` |
| Advisor | `advisor1` | `password123` |
| Regulator | `regulator1` | `password123` |

## 📊 Role-Specific Features

### Member Portal
- Upload pension data (CSV, Excel, JSON)
- Interactive chart builder with Plotly.js
- AI assistant for data insights
- Export reports and visualizations

### Advisor Portal
- Client portfolio management
- Performance analytics dashboard
- Client overview and tracking
- Advisor-specific reporting

### Regulator Portal
- Compliance overview and monitoring
- Industry performance trends
- Risk alerts and notifications
- Regulatory reporting tools

## 🛠️ Development

### Available Scripts

```bash
# Root level commands
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run start            # Start both in production mode
npm run clean            # Clean node_modules and reinstall

# Frontend specific
npm run dev:frontend     # Start frontend development server
npm run build:frontend   # Build frontend for production

# Backend specific  
npm run dev:backend      # Start backend development server
npm run start:backend    # Start backend in production mode
```

### Technology Stack

**Frontend:**
- Next.js 15 (React 19)
- Tailwind CSS v4
- Plotly.js for charts
- Axios for API calls

**Backend:**
- Express.js
- JWT for authentication
- bcryptjs for password hashing
- CORS, Helmet for security
- Morgan for logging

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
```

### API Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - User logout

**Data Management:**
- `GET /api/data/pension-data` - Fetch pension data
- `POST /api/data/upload` - Upload pension data
- `GET /api/data/insights` - Get data insights

**Charts:**
- `POST /api/charts/generate` - Generate chart data
- `GET /api/charts/templates/:role` - Get chart templates

## 🚢 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Support (Coming Soon)
```bash
npm run docker:build
npm run docker:up
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ by the MUFG Team**
