# 📖 MUFG Pension Insights Platform
## Technical Documentation

[![GitHub Repository](https://img.shields.io/badge/GitHub-MUFG%20Platform-blue?logo=github)](https://github.com/sahilgoyal7214/MUFG)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://github.com/sahilgoyal7214/MUFG)

---

## 🌟 Overview

The **MUFG Pension Insights Platform** is a sophisticated role-based pension analytics system that seamlessly integrates financial data, AI services, and comprehensive document export capabilities. This platform serves as a complete solution for pension management, offering tailored experiences for different user roles while maintaining the highest standards of security and compliance.

### 🎯 Key Features

- **🔐 Multi-Role Authentication System** - Secure role-based access control
- **📊 Advanced Analytics Dashboard** - Real-time pension data visualization
- **🤖 AI-Powered Insights** - Intelligent chatbot and graph analysis
- **📄 Comprehensive Export Options** - PDF, Excel, PowerPoint, and image exports
- **🛡️ Enterprise-Grade Security** - JWT authentication with audit logging
- **📱 Responsive Design** - Modern, mobile-friendly interface

### 👥 Supported Roles

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **👤 Member** | Personal Data | View pension data, charts, AI insights, personal projections |
| **💼 Advisor** | Client Portfolio | Manage portfolios, risk analysis, client recommendations |
| **🏛️ Regulator** | System-Wide | Compliance monitoring, audit logs, system analytics |

### 🛠️ Technology Stack

**Frontend:**
- ⚛️ **Next.js 14** (App Router)
- 🔄 **React 18** with modern hooks
- 🎨 **TailwindCSS** for styling
- 📈 **Plotly.js & Recharts** for visualizations
- 🔑 **NextAuth.js** for authentication

**Backend:**
- 🚀 **Express.js** with MVC architecture
- 🐘 **PostgreSQL** (production) / SQLite (development)
- 🔒 **JWT** token-based security
- 🤖 **Ollama** for local LLM integration
- 👁️ **LLaVA Vision Model** for graph analysis

---

## 🏗️ Architecture

### 🎨 Frontend Architecture

The frontend leverages **Next.js App Router** architecture with a component-based design pattern, ensuring maintainability and scalability.

#### 📁 Project Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── page.js                 # Root page with role selection
│   │   ├── layout.js               # Global providers and styles
│   │   └── api/
│   │       └── proxy/              # API proxy routes
│   ├── components/
│   │   ├── Dashboard.js            # Main dashboard component
│   │   ├── LoginForm.js            # Authentication form
│   │   └── roles/                  # Role-specific dashboards
│   └── lib/
│       ├── auth.js                 # NextAuth configuration
│       └── utils.js                # Utility functions
```

#### 🔄 Authentication Flow
1. **Role Selection** → User chooses their role via `RoleSelection.js`
2. **Credential Input** → Secure form submission through `LoginForm.js`
3. **Backend Validation** → NextAuth validates against PostgreSQL
4. **Session Creation** → JWT token generated and stored
5. **Dashboard Load** → Role-specific interface rendered

#### 🎯 State Management Strategy
- **Local State**: React `useState` for UI components and forms
- **Session Management**: NextAuth `useSession()` hook for authentication
- **Global Providers**: Context providers wrap the entire application
- **Data Fetching**: Server-side rendering with Next.js App Router

#### 📊 Visualization & Export System
- **📈 Chart Libraries**: 
  - Plotly.js for interactive financial charts
  - Recharts for responsive dashboard widgets
- **📄 Export Capabilities**:
  - **PDF**: jsPDF with custom templates
  - **Excel**: xlsx library with formatted sheets
  - **PowerPoint**: pptxgenjs for presentation generation
  - **Images**: html2canvas for chart exports

### 🖥️ Backend Architecture

The backend follows a **layered MVC architecture** with Express.js, providing clear separation of concerns and maintainable code structure.

#### 📁 Directory Structure
```
backend/
├── app.js                          # Application entry point
├── src/
│   ├── routes/                     # API route definitions
│   │   ├── members.js
│   │   ├── advisors.js
│   │   └── regulators.js
│   ├── controllers/                # Request handlers
│   │   ├── MemberDataController.js
│   │   ├── AdvisorController.js
│   │   └── RegulatorController.js
│   ├── services/                   # Business logic layer
│   │   ├── ChatbotService.js
│   │   ├── GraphInsightsService.js
│   │   ├── KpiService.js
│   │   └── AuditService.js
│   ├── middleware/                 # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── rateLimiting.js
│   ├── models/                     # Database models
│   └── config/                     # Configuration files
│       ├── roles.js
│       ├── database.js
│       └── nextauth.js
├── database/
│   ├── migrations/                 # Database migrations
│   └── seeders/                    # Sample data
```

#### 🔄 API Flow Example
```mermaid
graph TD
    A[Frontend Request] --> B[POST /api/proxy/members]
    B --> C[Proxy attaches JWT]
    C --> D[/api/members Express route]
    D --> E[MemberDataController.js]
    E --> F[KpiService.js]
    F --> G[PostgreSQL Query]
    G --> H[Pension Data Response]
```

#### 🔧 Core Services

**💬 ChatbotService**
- Natural Language Processing with local LLM
- Intent recognition and contextual responses
- Role-aware data access and recommendations

**📊 GraphInsightsService**
- Chart analysis using LLaVA Vision Model
- Automated insight generation from pension data
- Trend detection and anomaly identification

**📈 KpiService**
- Retirement projection calculations
- Contribution optimization algorithms
- Risk assessment and readiness scoring

**📋 AuditService**
- Comprehensive logging for compliance
- Security event tracking
- Regulatory reporting capabilities

### 🔐 Authentication & Authorization

#### 🎫 Token Management
- **Frontend**: NextAuth.js with JWT session strategy
- **Backend**: JWT validation middleware with role-based access control
- **Security**: NEXTAUTH_SECRET for token signing and validation
- **Lifecycle**: 24-hour token expiration with automatic refresh

#### 👥 Role-Based Permissions

| Endpoint Pattern | Member | Advisor | Regulator |
|------------------|--------|---------|-----------|
| `/api/members/{id}` | ✅ (own data) | ✅ (assigned clients) | ✅ (all data) |
| `/api/advisor/*` | ❌ | ✅ | ✅ |
| `/api/logs` | ❌ | ❌ | ✅ |
| `/api/analytics` | ❌ | ❌ | ✅ |

#### 🛡️ Security Flow
```javascript
// Token Creation (Proxy Layer)
const session = await getServerSession();
const token = jwt.sign(session.user, process.env.NEXTAUTH_SECRET);

// Token Validation (Backend)
const decoded = verifyNextAuthToken(token);
const hasPermission = checkRolePermissions(decoded.role, endpoint);
```

### 🔗 API Proxy System

The API proxy layer provides secure communication between frontend and backend, handling authentication and request forwarding.

#### 📝 Proxy Implementation
```javascript
// frontend/src/app/api/proxy/members/route.js
export async function POST(request) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = jwt.sign(session.user, process.env.NEXTAUTH_SECRET);
  
  const response = await fetch(`${BACKEND_URL}/api/members`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(await request.json())
  });

  return NextResponse.json(await response.json());
}
```

---

## 🖼️ User Interface

### 🔑 Authentication Flow

The authentication system provides a seamless user experience while maintaining security standards.

#### 📱 Login Process
1. **🎯 Role Selection** - User selects their role (Member/Advisor/Regulator)
2. **📝 Credential Entry** - Secure form with validation
3. **🔐 Authentication** - NextAuth validates credentials
4. **📊 Dashboard Loading** - Role-specific interface loads
5. **💾 Session Persistence** - User state maintained across browser sessions

```javascript
// Authentication state management
const { data: session, status } = useSession();

useEffect(() => {
  if (session?.user) {
    setUserRole(session.user.role);
    setIsAuthenticated(true);
  }
}, [session]);
```

### 📊 Dashboard System

The dashboard system provides a unified interface that adapts based on user roles and preferences.

#### 🎨 Layout Components
- **🔝 Top Navigation Bar**
  - Company branding and logo
  - Role selector dropdown
  - Theme toggle (dark/light mode)
  - User profile and logout options

- **📋 Sidebar Navigation**
  - Role-specific menu items
  - Collapsible sections
  - Active route highlighting
  - Quick access shortcuts

- **📄 Content Area**
  - Dynamic component rendering
  - Responsive grid layout
  - Interactive charts and widgets
  - Real-time data updates

#### 🎭 Theme System
```javascript
// Theme management
const [theme, setTheme] = useState('light');

const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
};
```

### 👤 Member Dashboard

The Member Dashboard provides a personalized view of individual pension data and insights.

#### 📈 Key Features
- **💰 Pension Balance Overview**
  - Current balance with trend indicators
  - Month-over-month growth visualization
  - Historical balance chart

- **📊 Contribution History**
  - Interactive timeline of contributions
  - Employer vs. employee contribution breakdown
  - Annual contribution summaries

- **🎯 Retirement Readiness**
  - Personalized readiness score
  - Goal tracking and progress indicators
  - Projection scenarios and recommendations

- **📄 Export Options**
  - Personal pension statement (PDF)
  - Contribution history (Excel)
  - Portfolio summary (PowerPoint)

#### 💡 AI-Powered Insights
- Personalized retirement recommendations
- Contribution optimization suggestions
- Market trend impact analysis
- Risk assessment and mitigation strategies

### 💼 Advisor Dashboard

The Advisor Dashboard offers comprehensive tools for managing client portfolios and providing expert guidance.

#### 🛠️ Portfolio Management Tools
- **📊 Portfolio Optimization**
  - Asset allocation recommendations
  - Risk-return analysis
  - Rebalancing suggestions
  - Performance benchmarking

- **🚨 Risk Alert System**
  - Real-time risk monitoring
  - Automated alert notifications
  - Risk threshold customization
  - Historical risk analysis

- **💡 Contribution Recommendations**
  - Client-specific contribution strategies
  - Tax optimization suggestions
  - Catch-up contribution analysis
  - Automated recommendation engine

- **🔮 Simulation Engine**
  - What-if scenario analysis
  - Retirement projection modeling
  - Market volatility simulations
  - Custom scenario builder

#### 👥 Client Management
```javascript
// Client portfolio overview
const clientPortfolio = {
  totalAssets: 1250000,
  riskScore: 7.2,
  projectedRetirement: '2045-06-15',
  recommendedActions: [
    'Increase equity allocation by 5%',
    'Consider additional contributions',
    'Review beneficiary information'
  ]
};
```

### 🏛️ Regulator Dashboard

The Regulator Dashboard provides comprehensive oversight and compliance monitoring capabilities.

#### 📋 Compliance Monitoring
- **📊 System-Wide Analytics**
  - Platform usage statistics
  - Transaction monitoring
  - Risk exposure analysis
  - Compliance trend reporting

- **📝 Audit Log Management**
  - Comprehensive activity logging
  - Search and filter capabilities
  - Export and reporting tools
  - Compliance violation tracking

- **🚨 System Risk Alerts**
  - Automated risk detection
  - Threshold breach notifications
  - Regulatory compliance monitoring
  - System health indicators

#### 📈 Reporting Capabilities
- Regulatory compliance reports
- System performance metrics
- User activity summaries
- Risk assessment reports

---

## ⚙️ Backend Services

### 💼 Advisor Services

The Advisor Services provide specialized functionality for financial advisors to manage their clients effectively.

#### 👥 Member Segmentation Service
**Endpoint**: `/api/advisor/member-segmentation`

```javascript
// Member segmentation logic
const segmentMembers = async (advisorId) => {
  const clients = await getAdvisorClients(advisorId);
  
  return {
    highRisk: clients.filter(c => c.riskScore > 8),
    needsAttention: clients.filter(c => c.contributionGap > 0.2),
    onTrack: clients.filter(c => c.retirementReadiness > 0.8),
    nearRetirement: clients.filter(c => c.yearsToRetirement < 5)
  };
};
```

#### 🚨 Risk Alert Service
**Endpoint**: `/api/advisor/risk-alerts`

- Real-time portfolio risk monitoring
- Automated threshold breach detection
- Customizable alert preferences
- Historical risk trend analysis

#### 📊 Portfolio Optimization Service
**Endpoint**: `/api/advisor/portfolio-optimization`

- Modern Portfolio Theory implementation
- Risk-return optimization algorithms
- Asset allocation recommendations
- Rebalancing frequency suggestions

#### 💰 Contribution Recommendation Service
**Endpoint**: `/api/advisor/contribution-recommendations`

- Personalized contribution strategies
- Tax-advantaged contribution planning
- Catch-up contribution eligibility
- Automated optimization engine

### 👤 Member Services

Member Services focus on individual pension data and personalized insights.

#### 📊 Personal Data Service
**Endpoint**: `/api/members/{id}`

```javascript
// Member data retrieval
const getMemberData = async (memberId) => {
  return {
    personalInfo: await getPersonalInfo(memberId),
    currentBalance: await getCurrentBalance(memberId),
    contributionHistory: await getContributionHistory(memberId),
    investmentPerformance: await getInvestmentPerformance(memberId),
    retirementProjections: await getRetirementProjections(memberId)
  };
};
```

#### 💳 Contribution Tracking
**Endpoint**: `/api/members/{id}/contributions`

- Historical contribution data
- Employer matching calculations
- Vesting schedule tracking
- Contribution limit monitoring

#### 🔮 Projection Service
**Endpoint**: `/api/members/{id}/projections`

- Retirement readiness calculations
- Multiple scenario projections
- Monte Carlo simulations
- Goal-based planning tools

### 👥 User Management Services

#### 👤 User Profile Service
**Endpoint**: `/api/users`

- User listing with role-based filtering
- Profile management capabilities
- Permission and access control
- Activity tracking and audit trails

#### 📝 Profile Update Service
**Endpoint**: `/api/users/{id}`

```javascript
// Profile update with validation
const updateUserProfile = async (userId, updateData) => {
  const validation = await validateProfileData(updateData);
  if (!validation.isValid) {
    throw new ValidationError(validation.errors);
  }
  
  const updatedUser = await updateUser(userId, updateData);
  await logAuditEvent('PROFILE_UPDATE', userId, updateData);
  
  return updatedUser;
};
```

---

## 🤖 AI Integration

### 💬 Chatbot System

The AI-powered chatbot provides intelligent assistance and insights tailored to each user role.

#### 🧠 Local LLM Integration
- **🔧 Technology**: Ollama for local language model deployment
- **🎯 Intent Recognition**: Advanced NLP for user query understanding
- **🔐 Role-Aware Responses**: Contextual answers based on user permissions
- **📊 Data Integration**: Real-time pension data in conversational format

#### 🎭 Intent Categories

**💰 Balance Inquiry**
```javascript
// Example chatbot interaction
const handleBalanceInquiry = async (userId, message) => {
  const balance = await getCurrentBalance(userId);
  const trend = await getBalanceTrend(userId, '3months');
  
  return {
    response: `Your current pension balance is $${balance.toLocaleString()}. 
               Over the last 3 months, your balance has ${trend.direction} 
               by ${trend.percentage}%.`,
    data: { balance, trend },
    actions: ['view_details', 'export_statement', 'schedule_review']
  };
};
```

**🔮 Retirement Projection**
- Personalized retirement timeline calculations
- Goal-based planning recommendations
- Risk assessment and mitigation strategies
- Contribution optimization suggestions

**📈 Investment Performance**
- Portfolio performance analysis
- Benchmark comparisons
- Asset allocation recommendations
- Market trend insights

#### 🎯 Role-Specific Capabilities

| Feature | Member | Advisor | Regulator |
|---------|--------|---------|-----------|
| Personal Data Access | ✅ Own data | ✅ Client data | ✅ Aggregate data |
| Investment Advice | ✅ Basic | ✅ Advanced | ❌ |
| Compliance Queries | ❌ | ✅ Limited | ✅ Full access |
| System Analytics | ❌ | ❌ | ✅ |

### 📊 Graph Analysis System

The Graph Analysis system leverages computer vision AI to provide intelligent insights from pension charts and visualizations.

#### 👁️ Vision Model Integration
- **🔧 Technology**: LLaVA Vision Model for image analysis
- **📈 Chart Recognition**: Automatic detection of chart types and data
- **💡 Insight Generation**: AI-powered analysis and recommendations
- **🔒 Temporary Storage**: Secure image processing with automatic cleanup

#### 🔄 Analysis Workflow
```javascript
// Graph analysis process
const analyzeChart = async (imageFile, userId) => {
  // 1. Image preprocessing
  const base64Image = await encodeImageToBase64(imageFile);
  
  // 2. Temporary storage
  const tempPath = await saveTemporaryImage(base64Image, userId);
  
  // 3. AI analysis
  const analysisResult = await callLLaVAModel(tempPath, {
    context: 'pension_data_analysis',
    userRole: await getUserRole(userId)
  });
  
  // 4. Cleanup
  await deleteTemporaryImage(tempPath);
  
  return {
    insights: analysisResult.insights,
    trends: analysisResult.trends,
    recommendations: analysisResult.recommendations,
    confidence: analysisResult.confidence
  };
};
```

#### 📈 Supported Chart Types
- **📊 Balance Progression Charts**: Historical balance trends
- **🥧 Asset Allocation Pie Charts**: Portfolio composition analysis
- **📈 Performance Comparison Charts**: Benchmark analysis
- **📉 Risk Assessment Charts**: Volatility and risk metrics
- **🎯 Goal Progress Charts**: Retirement readiness tracking

#### 💡 Generated Insights
- Trend identification and analysis
- Anomaly detection and alerts
- Performance benchmarking
- Recommendation generation
- Risk assessment summaries

---

## 💾 Data Management

### 🗄️ Database Setup

The platform supports flexible database configuration for different deployment environments.

#### 🐘 Production Configuration (PostgreSQL)
```javascript
// Database configuration
const productionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mufg_pension',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};
```

#### 💿 Development Configuration (SQLite)
```javascript
// SQLite for local development
const developmentConfig = {
  dialect: 'sqlite',
  storage: './database/development.sqlite',
  logging: console.log
};
```

#### 🔧 Environment Variables
```env
# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/mufg_pension
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mufg_pension
DB_USER=postgres
DB_PASS=your_password

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# AI Services
OLLAMA_URL=http://localhost:11434
GRAPH_LLM_URL=http://localhost:11435
```

### 🛠️ Database Tools

#### 🚀 Setup and Initialization
**setup-db.js** - Complete database initialization
```javascript
// Database setup script
const setupDatabase = async () => {
  try {
    // Create database schema
    await createTables();
    
    // Insert default users for each role
    await seedDefaultUsers();
    
    // Create sample pension data
    await seedSampleData();
    
    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
};
```

#### 🔍 Testing and Verification
**test-db.js** - Connection and functionality testing
```javascript
// Database connectivity test
const testDatabaseConnection = async () => {
  const tests = [
    { name: 'Connection Test', test: testConnection },
    { name: 'Authentication Test', test: testAuth },
    { name: 'Data Retrieval Test', test: testDataRetrieval },
    { name: 'Permission Test', test: testPermissions }
  ];

  for (const { name, test } of tests) {
    try {
      await test();
      console.log(`✅ ${name}: PASSED`);
    } catch (error) {
      console.log(`❌ ${name}: FAILED - ${error.message}`);
    }
  }
};
```

#### 🔍 Schema Introspection
**get-column-names.js** - Database schema exploration
```javascript
// Schema introspection utility
const getTableSchema = async (tableName) => {
  const columns = await db.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);

  return columns.rows.map(col => ({
    name: col.column_name,
    type: col.data_type,
    nullable: col.is_nullable === 'YES',
    default: col.column_default
  }));
};
```

### 📤 Export & Visualization

The platform provides comprehensive export capabilities across multiple formats.

#### 📄 PDF Generation
```javascript
// PDF export with custom styling
const generatePDFReport = async (data, options) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('MUFG Pension Report', 20, 30);
  
  // Member information
  doc.setFontSize(12);
  doc.text(`Member: ${data.memberName}`, 20, 50);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 60);
  
  // Balance information
  doc.text(`Current Balance: $${data.balance.toLocaleString()}`, 20, 80);
  
  // Chart embedding
  if (options.includeCharts) {
    const chartImage = await html2canvas(document.getElementById('balance-chart'));
    doc.addImage(chartImage, 'PNG', 20, 100, 170, 80);
  }
  
  return doc.save(`pension-report-${data.memberId}.pdf`);
};
```

#### 📊 Excel Generation
```javascript
// Excel export with multiple sheets
const generateExcelReport = async (memberData) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Member Information'],
    ['Name', memberData.name],
    ['ID', memberData.id],
    ['Current Balance', memberData.balance],
    ['Last Updated', new Date().toISOString()]
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Contributions sheet
  const contributionsSheet = XLSX.utils.json_to_sheet(memberData.contributions);
  XLSX.utils.book_append_sheet(workbook, contributionsSheet, 'Contributions');
  
  // Performance sheet
  const performanceSheet = XLSX.utils.json_to_sheet(memberData.performance);
  XLSX.utils.book_append_sheet(workbook, performanceSheet, 'Performance');
  
  return XLSX.writeFile(workbook, `pension-data-${memberData.id}.xlsx`);
};
```

#### 🖼️ PowerPoint Generation
```javascript
// PowerPoint presentation generation
const generatePowerPointPresentation = async (data) => {
  const pres = new PptxGenJS();
  
  // Title slide
  const titleSlide = pres.addSlide();
  titleSlide.addText('Pension Portfolio Review', {
    x: 1, y: 1, w: 8, h: 1,
    fontSize: 32, bold: true, color: '363636'
  });
  
  // Summary slide
  const summarySlide = pres.addSlide();
  summarySlide.addText('Portfolio Summary', { x: 0.5, y: 0.5, fontSize: 24 });
  summarySlide.addChart('column', data.chartData, { x: 1, y: 2, w: 8, h: 4 });
  
  return pres.writeFile(`pension-presentation-${data.memberId}.pptx`);
};
```

#### 📊 Interactive Charts
```javascript
// Plotly.js chart configuration
const createInteractiveChart = (data, containerId) => {
  const trace = {
    x: data.dates,
    y: data.balances,
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Pension Balance',
    line: { color: '#1f77b4', width: 3 }
  };

  const layout = {
    title: 'Pension Balance Over Time',
    xaxis: { title: 'Date', type: 'date' },
    yaxis: { title: 'Balance ($)', tickformat: '$,.0f' },
    hovermode: 'closest',
    showlegend: true
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['select2d', 'lasso2d']
  };

  Plotly.newPlot(containerId, [trace], layout, config);
};
```

---

## 🚀 Development & Operations

### ⚡ Project Setup

The MUFG Pension Insights Platform uses a modern monorepo structure managed with pnpm for optimal dependency management and build performance.

#### 🏗️ Installation & Setup
```bash
# Clone the repository
git clone https://github.com/sahilgoyal7214/MUFG.git
cd MUFG

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize database
pnpm run setup-db

# Start development servers
pnpm run dev
```

#### 📦 Package Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"pnpm --filter frontend dev\" \"pnpm --filter backend dev\"",
    "build": "pnpm --filter frontend build && pnpm --filter backend build",
    "start": "pnpm --filter backend start",
    "setup-db": "node backend/scripts/setup-db.js",
    "test": "pnpm --filter backend test && pnpm --filter frontend test",
    "lint": "pnpm --filter frontend lint && pnpm --filter backend lint",
    "lint:fix": "pnpm --filter frontend lint:fix && pnpm --filter backend lint:fix"
  }
}
```

#### 🔧 Development Environment
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mufg_pension_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

volumes:
  postgres_data:
  ollama_data:
```

### 🧪 Testing Strategy

Comprehensive testing ensures reliability and maintainability across all system components.

#### 🔬 Unit Testing
```javascript
// Example service unit test
describe('KpiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateRetirementReadiness', () => {
    it('should return high readiness for well-funded accounts', async () => {
      const mockMemberData = {
        currentBalance: 500000,
        monthlyContribution: 2000,
        yearsToRetirement: 15,
        targetRetirementIncome: 60000
      };

      const result = await KpiService.calculateRetirementReadiness(mockMemberData);
      
      expect(result.readinessScore).toBeGreaterThan(0.8);
      expect(result.projectedIncome).toBeDefined();
      expect(result.recommendations).toHaveLength(0);
    });

    it('should provide recommendations for underfunded accounts', async () => {
      const mockMemberData = {
        currentBalance: 50000,
        monthlyContribution: 200,
        yearsToRetirement: 30,
        targetRetirementIncome: 80000
      };

      const result = await KpiService.calculateRetirementReadiness(mockMemberData);
      
      expect(result.readinessScore).toBeLessThan(0.6);
      expect(result.recommendations).toContain('Increase monthly contributions');
      expect(result.shortfall).toBeGreaterThan(0);
    });
  });
});
```

#### 🔄 Integration Testing
```javascript
// API integration tests
describe('Member API Integration', () => {
  let server;
  let testMemberId;
  let authToken;

  beforeAll(async () => {
    server = await startTestServer();
    const testUser = await createTestUser('member');
    authToken = generateTestToken(testUser);
    testMemberId = testUser.id;
  });

  afterAll(async () => {
    await cleanupTestData();
    await server.close();
  });

  describe('GET /api/members/:id', () => {
    it('should return member data for authenticated user', async () => {
      const response = await request(server)
        .get(`/api/members/${testMemberId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testMemberId,
        personalInfo: expect.any(Object),
        currentBalance: expect.any(Number),
        contributionHistory: expect.any(Array)
      });
    });

    it('should deny access to other member data', async () => {
      const otherMemberId = 'other-member-id';
      
      await request(server)
        .get(`/api/members/${otherMemberId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
});
```

#### ⚡ Performance Testing
```javascript
// Load testing with concurrent requests
describe('Performance Tests', () => {
  it('should handle 100 concurrent member data requests', async () => {
    const startTime = Date.now();
    const promises = Array(100).fill().map(() => 
      request(server)
        .get(`/api/members/${testMemberId}`)
        .set('Authorization', `Bearer ${authToken}`)
    );

    const results = await Promise.all(promises);
    const endTime = Date.now();

    // All requests should succeed
    results.forEach(result => expect(result.status).toBe(200));
    
    // Should complete within reasonable time
    expect(endTime - startTime).toBeLessThan(5000);
  });

  it('should maintain response time under load', async () => {
    const responseTime = await measureAverageResponseTime('/api/members/1', 50);
    expect(responseTime).toBeLessThan(500); // 500ms average
  });
});
```

#### 🔐 Authentication Testing Tools
```javascript
// JWT token generator for testing
const generateTestToken = (user, expiresIn = '1h') => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.NEXTAUTH_SECRET || 'test-secret',
    { expiresIn }
  );
};

// Token validation test utility
const validateTokenStructure = (token) => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    expect(decoded.header).toHaveProperty('alg');
    expect(decoded.payload).toHaveProperty('id');
    expect(decoded.payload).toHaveProperty('role');
    expect(decoded.payload).toHaveProperty('iat');
    return true;
  } catch (error) {
    return false;
  }
};
```

#### 📊 Test Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/config/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.js'],
  testMatch: [
    '**/__tests__/**/*.(js|jsx)',
    '**/*.(test|spec).(js|jsx)'
  ]
};
```

### 🔍 Debugging & Monitoring

#### 📝 Logging Configuration
```javascript
// Enhanced logging system
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mufg-pension-platform' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Structured logging for API requests
const logApiRequest = (req, res, responseTime) => {
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    userRole: req.user?.role,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
};
```

#### 🚨 Error Handling
```javascript
// Global error handler
const errorHandler = (error, req, res, next) => {
  logger.error('Unhandled Error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Send appropriate response
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication Required'
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.id
  });
};
```

#### 📈 Performance Monitoring
```javascript
// Response time monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Log slow requests
    if (responseTime > 1000) {
      logger.warn('Slow Request Detected', {
        url: req.url,
        method: req.method,
        responseTime: `${responseTime}ms`,
        userId: req.user?.id
      });
    }
    
    // Update metrics
    updatePerformanceMetrics(req.route?.path, responseTime);
  });
  
  next();
};
```

---

## 🔧 Configuration & Environment

### 🌍 Environment Variables
```env
# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/mufg_pension
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mufg_pension
DB_USER=postgres
DB_PASS=your_secure_password

# Authentication & Security
NEXTAUTH_SECRET=your-super-secure-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-key
SESSION_TIMEOUT=86400000

# AI Services
OLLAMA_URL=http://localhost:11434
GRAPH_LLM_URL=http://localhost:11435
CHATBOT_MODEL=llama2
VISION_MODEL=llava

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Monitoring & Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
ENABLE_PERFORMANCE_MONITORING=true
```

### 🚀 Deployment Configuration

#### 🐳 Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build applications
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

# Copy built applications
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000 3001

CMD ["pnpm", "start"]
```

#### ☸️ Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mufg-pension-platform
  labels:
    app: mufg-pension-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mufg-pension-platform
  template:
    metadata:
      labels:
        app: mufg-pension-platform
    spec:
      containers:
      - name: mufg-platform
        image: mufg-pension-platform:latest
        ports:
        - containerPort: 3000
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mufg-secrets
              key: database-url
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: mufg-secrets
              key: nextauth-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: mufg-platform-service
spec:
  selector:
    app: mufg-pension-platform
  ports:
    - name: frontend
      protocol: TCP
      port: 80
      targetPort: 3000
    - name: backend
      protocol: TCP
      port: 3001
      targetPort: 3001
  type: LoadBalancer
```

---

## 📚 API Documentation

### 🔗 API Endpoints Overview

#### 👤 Member Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/members/{id}` | Get member profile and balance | ✅ Member |
| GET | `/api/members/{id}/contributions` | Get contribution history | ✅ Member |
| GET | `/api/members/{id}/projections` | Get retirement projections | ✅ Member |
| POST | `/api/members/{id}/goals` | Set retirement goals | ✅ Member |

#### 💼 Advisor Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/advisor/clients` | Get assigned client list | ✅ Advisor |
| GET | `/api/advisor/member-segmentation` | Get client segmentation | ✅ Advisor |
| GET | `/api/advisor/risk-alerts` | Get risk alerts for clients | ✅ Advisor |
| POST | `/api/advisor/portfolio-optimization` | Run portfolio optimization | ✅ Advisor |
| POST | `/api/advisor/contribution-recommendations` | Generate recommendations | ✅ Advisor |

#### 🏛️ Regulator Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/regulator/audit-logs` | Get system audit logs | ✅ Regulator |
| GET | `/api/regulator/analytics` | Get system-wide analytics | ✅ Regulator |
| GET | `/api/regulator/compliance-reports` | Get compliance reports | ✅ Regulator |
| POST | `/api/regulator/risk-alerts` | Configure risk thresholds | ✅ Regulator |

#### 🤖 AI & Analytics Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ai/chatbot` | Interact with AI chatbot | ✅ Any Role |
| POST | `/api/ai/graph-analysis` | Analyze uploaded charts | ✅ Any Role |
| GET | `/api/analytics/performance` | Get performance metrics | ✅ Advisor/Regulator |
| POST | `/api/export/pdf` | Generate PDF reports | ✅ Any Role |

### 📋 Request/Response Examples

#### Member Data Request
```javascript
// GET /api/members/123
{
  "id": "123",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "dateOfBirth": "1980-05-15",
    "employeeId": "EMP001"
  },
  "currentBalance": 245000.50,
  "contributionHistory": [
    {
      "date": "2024-01-01",
      "employeeContribution": 500.00,
      "employerMatch": 250.00,
      "totalContribution": 750.00
    }
  ],
  "retirementProjections": {
    "readinessScore": 0.78,
    "projectedRetirementDate": "2045-05-15",
    "estimatedMonthlyIncome": 4200.00,
    "recommendations": [
      "Consider increasing contribution by 2%",
      "Review investment allocation"
    ]
  }
}
```

#### AI Chatbot Interaction
```javascript
// POST /api/ai/chatbot
{
  "message": "What's my current pension balance?",
  "context": {
    "userId": "123",
    "sessionId": "session-abc-123"
  }
}

// Response
{
  "response": "Your current pension balance is $245,000.50. This represents a 5.2% increase from last quarter, showing healthy growth in your retirement savings.",
  "intent": "balance_inquiry",
  "confidence": 0.95,
  "data": {
    "balance": 245000.50,
    "previousBalance": 232000.00,
    "growthRate": 0.052
  },
  "suggestedActions": [
    "view_detailed_breakdown",
    "export_statement",
    "schedule_advisor_meeting"
  ]
}
```

---

## 🔐 Security & Compliance

### 🛡️ Security Features

#### 🔒 Authentication & Authorization
- **Multi-factor Authentication**: Optional 2FA via email or SMS
- **Role-based Access Control**: Granular permissions system
- **Session Management**: Secure JWT tokens with automatic refresh
- **Password Security**: Bcrypt hashing with salt rounds

#### 🔍 Data Protection
```javascript
// Data encryption for sensitive information
const encryptSensitiveData = (data) => {
  const cipher = crypto.createCipher('aes-256-gcm', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    authTag: authTag.toString('hex'),
    iv: cipher.iv?.toString('hex')
  };
};

// Secure data retrieval with decryption
const decryptSensitiveData = (encryptedData) => {
  const decipher = crypto.createDecipher('aes-256-gcm', process.env.ENCRYPTION_KEY);
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
};
```

#### 🚫 Rate Limiting & DDoS Protection
```javascript
// Advanced rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path
    });
    res.status(429).json({ error: 'Rate limit exceeded' });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
};
```

### 📊 Audit & Compliance

#### 📝 Comprehensive Audit Logging
```javascript
// Audit log service
class AuditService {
  static async logEvent(eventType, userId, details) {
    const auditEntry = {
      id: generateUniqueId(),
      eventType,
      userId,
      timestamp: new Date().toISOString(),
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      details: JSON.stringify(details.data),
      result: details.result || 'SUCCESS'
    };

    await db.auditLogs.create(auditEntry);
    
    // Real-time compliance monitoring
    await this.checkComplianceViolations(auditEntry);
  }

  static async checkComplianceViolations(auditEntry) {
    const violations = [];
    
    // Check for unusual access patterns
    if (await this.detectUnusualAccess(auditEntry.userId)) {
      violations.push('UNUSUAL_ACCESS_PATTERN');
    }
    
    // Check for data export violations
    if (auditEntry.eventType === 'DATA_EXPORT') {
      const recentExports = await this.getRecentExports(auditEntry.userId);
      if (recentExports.length > 10) {
        violations.push('EXCESSIVE_DATA_EXPORT');
      }
    }
    
    // Alert regulators of violations
    if (violations.length > 0) {
      await this.alertComplianceTeam(auditEntry, violations);
    }
  }
}
```

#### 🔍 GDPR Compliance
```javascript
// GDPR data handling
class GDPRService {
  static async handleDataRequest(userId, requestType) {
    switch (requestType) {
      case 'ACCESS':
        return await this.exportUserData(userId);
      
      case 'RECTIFICATION':
        return await this.updateUserData(userId);
      
      case 'ERASURE':
        return await this.deleteUserData(userId);
      
      case 'PORTABILITY':
        return await this.exportPortableData(userId);
      
      default:
        throw new Error('Invalid GDPR request type');
    }
  }

  static async exportUserData(userId) {
    const userData = {
      personalInfo: await db.users.findById(userId),
      pensionData: await db.members.findById(userId),
      contributions: await db.contributions.findByUserId(userId),
      interactions: await db.auditLogs.findByUserId(userId)
    };
    
    // Remove sensitive internal data
    return this.sanitizeExportData(userData);
  }
}
```

---

## 🚀 Deployment & Scaling

### ☁️ Cloud Deployment Options

#### 🌊 AWS Deployment
```yaml
# aws-deployment.yml
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
      - REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME
  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - docker build -t $IMAGE_REPO_NAME .
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $REPOSITORY_URI:$IMAGE_TAG
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker image...
      - docker push $REPOSITORY_URI:$IMAGE_TAG
```

#### 🔵 Azure Deployment
```yaml
# azure-pipelines.yml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  dockerRegistryServiceConnection: 'mufg-acr-connection'
  imageRepository: 'mufg-pension-platform'
  containerRegistry: 'mufgregistry.azurecr.io'
  tag: '$(Build.BuildId)'

stages:
- stage: Build
  displayName: Build and push stage
  jobs:
  - job: Build
    displayName: Build
    steps:
    - task: Docker@2
      displayName: Build and push an image to container registry
      inputs:
        command: buildAndPush
        repository: $(imageRepository)
        dockerfile: $(Build.SourcesDirectory)/Dockerfile
        containerRegistry: $(dockerRegistryServiceConnection)
        tags: |
          $(tag)
          latest
```

### 📈 Performance Optimization

#### ⚡ Database Optimization
```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_members_balance ON members(current_balance);
CREATE INDEX CONCURRENTLY idx_contributions_date ON contributions(contribution_date);
CREATE INDEX CONCURRENTLY idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX CONCURRENTLY idx_users_role ON users(role);

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY idx_members_advisor_balance 
ON members(advisor_id, current_balance DESC);

CREATE INDEX CONCURRENTLY idx_contributions_member_date 
ON contributions(member_id, contribution_date DESC);
```

#### 🗄️ Caching Strategy
```javascript
// Redis caching implementation
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis retry time exhausted');
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Cached data retrieval
const getCachedMemberData = async (memberId) => {
  const cacheKey = `member:${memberId}`;
  
  try {
    const cached = await client.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const memberData = await fetchMemberDataFromDB(memberId);
    
    // Cache for 5 minutes
    await client.setex(cacheKey, 300, JSON.stringify(memberData));
    
    return memberData;
  } catch (error) {
    logger.error('Cache error:', error);
    return await fetchMemberDataFromDB(memberId);
  }
};
```

### 🔄 CI/CD Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: mufg_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install pnpm
      run: npm install -g pnpm
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Run linting
      run: pnpm run lint
    
    - name: Run tests
      run: pnpm run test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/mufg_test
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Add deployment steps here
```

---

## 📞 Support & Contributing

### 🤝 Contributing Guidelines

We welcome contributions to the MUFG Pension Insights Platform! Please follow these guidelines:

#### 🔄 Development Workflow
1. **Fork** the repository from [GitHub](https://github.com/sahilgoyal7214/MUFG)
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request with detailed description

#### 📝 Code Standards
- Follow ESLint configuration for JavaScript/TypeScript
- Write comprehensive tests for new features
- Maintain test coverage above 80%
- Update documentation for API changes
- Follow semantic commit message format

#### 🧪 Testing Requirements
```bash
# Run full test suite before submitting PR
pnpm run test

# Check code coverage
pnpm run test:coverage

# Run linting
pnpm run lint:fix
```

### 📧 Support Channels

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/sahilgoyal7214/MUFG/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/sahilgoyal7214/MUFG/discussions)
- **📚 Documentation**: This comprehensive guide
- **💬 Community**: Join our development community

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/sahilgoyal7214/MUFG/blob/main/LICENSE) file for details.

### 🙏 Acknowledgments

- **Next.js Team** for the excellent React framework
- **Express.js Community** for the robust backend framework
- **PostgreSQL Team** for the reliable database system
- **Ollama Project** for local LLM capabilities
- **All Contributors** who help improve this platform

---

## 📋 Changelog

### Version 2.0.0 (Latest)
- ✅ **Added**: AI-powered graph analysis with LLaVA Vision Model
- ✅ **Enhanced**: Role-based dashboard system with improved UX
- ✅ **Improved**: Export capabilities with PowerPoint support
- ✅ **Updated**: Security enhancements with advanced audit logging
- ✅ **Fixed**: Performance optimizations for large datasets

### Version 1.5.0
- ✅ **Added**: Comprehensive member segmentation for advisors
- ✅ **Enhanced**: Chatbot with intent recognition
- ✅ **Improved**: Database performance with optimized queries
- ✅ **Updated**: Frontend components with TailwindCSS v3

### Version 1.0.0
- ✅ **Initial**: Core platform with role-based authentication
- ✅ **Added**: Basic pension data visualization
- ✅ **Implemented**: PDF and Excel export functionality
- ✅ **Created**: Foundational API architecture

---

**📈 Built with ❤️ for Modern Pension Management**

*This documentation is maintained and updated regularly. For the latest information, please visit our [GitHub repository](https://github.com/sahilgoyal7214/MUFG).*