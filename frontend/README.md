# 📊 MUFG Pension Insights Platform

> **A comprehensive pension data analysis and insights platform built for the modern financial ecosystem**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react&logoColor=white)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Overview

The **MUFG Pension Insights Platform** is a cutting-edge financial analytics dashboard that empowers stakeholders across the pension ecosystem with data-driven insights, interactive visualizations, and AI-powered analytics. Built with modern web technologies, it serves Members, Advisors, and Regulators with role-specific dashboards and comprehensive pension data management capabilities.

## ✨ Key Features

### 🎯 **Multi-Role Dashboard System**
- **Member Portal**: Personal pension analytics, savings tracking, and projection modeling
- **Advisor Dashboard**: Client portfolio management, performance analytics, and planning tools
- **Regulator Interface**: Compliance oversight, audit management, and risk monitoring

### 📈 **Interactive Data Visualization**
- Dynamic chart creation with **Plotly.js** integration
- Customizable color schemes and chart types (scatter, bar, line, histogram)
- Real-time data filtering and user-specific analytics
- Export capabilities (PDF, Excel, PowerPoint)

### 🤖 **AI-Powered Analytics**
- Predictive modeling for pension outcomes
- Risk assessment algorithms
- Portfolio optimization recommendations
- Automated insights generation

### 🎨 **Modern UI/UX**
- Dark/Light mode toggle with system preference detection
- Responsive design optimized for all devices
- Smooth animations and transitions
- Accessibility-first approach

### 🔐 **Data Security & Management**
- Secure user authentication
- Role-based access control
- Real-time data processing
- PostgreSQL database integration

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 15.4.6 (App Router)
- **UI Library**: React 19.1.0
- **Styling**: TailwindCSS 4.0
- **Charts**: Plotly.js 3.1.0, React-Plotly.js 2.6.0
- **Animations**: Framer Motion 12.23.12
- **HTTP Client**: Axios 1.6.0

### **Backend & Database**
- **Runtime**: Node.js (18.0.0+)
- **Database**: PostgreSQL with pg 8.16.3
- **Authentication**: NextAuth.js 4.24.11
- **Security**: bcryptjs 3.0.2

### **Development & Build Tools**
- **Package Manager**: pnpm 8.0.0+
- **Bundler**: Turbopack (Next.js)
- **Linting**: ESLint 9
- **Styling**: PostCSS with TailwindCSS

### **Export & Reporting**
- **PDF Generation**: jsPDF 3.0.1
- **Excel Export**: xlsx 0.18.5
- **PowerPoint**: pptxgenjs 4.0.1
- **Image Capture**: html2canvas 1.4.1

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher
- **PostgreSQL** database (optional for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahilgoyal7214/MUFG.git
   cd MUFG
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cd frontend
   cp .env.local.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL=postgresql://username:password@localhost:5432/mufg_pension
   ```

4. **Start the development server**
   ```bash
   pnpm run dev
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - Select your role (Member/Advisor/Regulator) to begin

---

## 📁 Project Structure

```
mufg-pension-insights/
├── frontend/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── globals.css     # Global styles & Tailwind imports
│   │   │   ├── layout.js       # Root layout with metadata
│   │   │   ├── page.js         # Home page with role selection
│   │   │   └── api/            # API routes
│   │   │       └── auth/       # NextAuth configuration
│   │   ├── components/         # React Components
│   │   │   ├── Dashboard.js    # Main dashboard with theme management
│   │   │   ├── LoginScreen.js  # Role selection interface
│   │   │   ├── Navigation.js   # Sidebar navigation
│   │   │   ├── providers/      # Context providers
│   │   │   │   └── AuthProvider.js
│   │   │   └── roles/          # Role-specific components
│   │   │       ├── MemberContent.js    # Member dashboard & analytics
│   │   │       ├── AdvisorContent.js   # Advisor portfolio management
│   │   │       └── RegulatorContent.js # Regulatory oversight
│   │   └── lib/                # Utility libraries
│   │       ├── db.js           # Database connection
│   │       ├── initDb.js       # Database initialization
│   │       └── userService.js  # User management services
│   ├── public/                 # Static assets
│   │   ├── data/               # Sample datasets
│   │   │   ├── dataset.json    # Main pension data
│   │   │   └── pension_data.xlsx
│   │   └── *.svg              # Icons and assets
│   ├── package.json           # Frontend dependencies
│   ├── next.config.mjs        # Next.js configuration
│   ├── tailwind.config.js     # TailwindCSS configuration
│   ├── postcss.config.mjs     # PostCSS configuration
│   └── eslint.config.mjs      # ESLint rules
├── package.json               # Root package.json (monorepo)
├── .gitignore                # Git ignore rules
└── README.md                 # This documentation
```

---

## 📊 Core Functionality

### **Member Dashboard**
- **Personal Analytics**: View individual pension projections, savings rates, and contribution history
- **Interactive Charts**: Create custom visualizations from personal data
- **AI Insights**: Get personalized recommendations for optimization
- **Export Reports**: Generate PDF reports and Excel exports

### **Advisor Dashboard** 
- **Client Portfolio**: Manage multiple client accounts with comprehensive overview
- **Performance Analytics**: Track portfolio performance against benchmarks
- **Planning Tools**: Access advanced financial planning calculators
- **Client Reports**: Generate professional client reports and presentations

### **Regulator Dashboard**
- **Compliance Monitoring**: Real-time compliance status across all schemes
- **Risk Assessment**: Identify and track high-risk pension schemes
- **Audit Management**: Schedule and manage regulatory audits
- **Industry Analytics**: Aggregate industry trends and statistics

### **Data Management**
- **Dynamic Loading**: Load data from JSON datasets with user-specific filtering
- **Real-time Processing**: Process and analyze large datasets efficiently
- **Export Capabilities**: Multi-format exports (PDF, Excel, PowerPoint)
- **Data Visualization**: Interactive charts with Plotly.js integration

---

## 🎨 Design System

### **Color Schemes**
- **Primary**: Blue gradient (`from-blue-50 to-indigo-100`)
- **Dark Mode**: Gray palette (`bg-gray-900`, `text-gray-100`)
- **Role Colors**: 
  - Member: Blue (`bg-blue-600`)
  - Advisor: Green (`bg-green-600`) 
  - Regulator: Red (`bg-red-600`)

### **Typography**
- **Font Family**: Geist Sans & Geist Mono
- **Responsive Scale**: Tailwind's default type scale
- **Accessibility**: WCAG compliant contrast ratios

---

## 🔧 Configuration

### **Environment Variables**
```env
# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Database (Optional)
DATABASE_URL=postgresql://user:pass@localhost:5432/mufg

# Development
NODE_ENV=development
```

### **Database Setup** (Optional)
```bash
# Initialize database
pnpm run setup-db

# Test database connection
pnpm run test-db
```

---

## 📈 Usage Examples

### **Creating Custom Charts**
```javascript
// Example: Age vs Projected Pension Amount visualization
const chartConfig = {
  xAxis: 'Age',
  yAxis: 'Projected_Pension_Amount', 
  chartType: 'scatter',
  colorScheme: 'default'
};

// Data automatically filtered by current user
const chartData = getChartData(chartConfig);
```

### **Exporting Reports**
```javascript
// Generate PDF report
const exportToPDF = () => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  // Add charts and data
  pdf.save('pension-report.pdf');
};

// Export to Excel
const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'PensionData');
  XLSX.writeFile(wb, 'pension-data.xlsx');
};
```

---

## 🙏 Acknowledgments

- **Next.js Team** for the incredible React framework
- **Plotly.js** for powerful data visualization capabilities
- **TailwindCSS** for the utility-first CSS framework

---

## 📞 Support & Contact

- **Repository**: [https://github.com/sahilgoyal7214/MUFG](https://github.com/sahilgoyal7214/MUFG)
- **Issues**: [GitHub Issues](https://github.com/sahilgoyal7214/MUFG/issues)
- **Team**: Profit Prophets

---

<div align="center">

**Built with ❤️ for the Future of Pension Management**

[⭐ Star this repo](https://github.com/sahilgoyal7214/MUFG) | [🐛 Report Bug](https://github.com/sahilgoyal7214/MUFG/issues) | [✨ Request Feature](https://github.com/sahilgoyal7214/MUFG/issues)

</div>
