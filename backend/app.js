/**
 * MUFG Pension Insights Backend API
 * Professional ExpressJS application with role-based access control
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import memberRoutes from './src/routes/members.js';
import chatbotRoutes from './src/routes/chatbot.js';
import analyticsRoutes from './src/routes/analytics.js';
import logsRoutes from './src/routes/logs.js';
import kpiRoutes from './src/routes/kpi.js';

// Import services
import { AuditService } from './src/services/AuditService.js';

// Import Swagger documentation
import { specs, swaggerUi } from './src/config/swagger.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Request tracking middleware
app.use((req, res, next) => {
  req.requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  req.startTime = Date.now();
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'MUFG Pension Insights Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    api: 'MUFG Pension Insights Backend',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      members: '/api/members',
      chatbot: '/api/chatbot',
      analytics: '/api/analytics',
      logs: '/api/logs',
      kpi: '/api/kpi'
    },
    documentation: {
      swagger: '/api-docs',
      openapi: '/api-docs.json'
    }
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "MUFG Pension Insights API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

// OpenAPI JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/kpi', kpiRoutes);

// Request completion logging
app.use((req, res, next) => {
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    AuditService.logSystemEvent({
      event: 'API_REQUEST',
      description: `${req.method} ${req.originalUrl}`,
      severity: 'INFO',
      metadata: {
        requestId: req.requestId,
        statusCode: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    });
  });
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Log error for audit
  AuditService.logSystemEvent({
    event: 'API_ERROR',
    description: err.message,
    severity: 'ERROR',
    metadata: {
      requestId: req.requestId,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method
    }
  });

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      requestId: req.requestId
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      requestId: req.requestId,
      availableEndpoints: [
        '/api/auth',
        '/api/users', 
        '/api/members',
        '/api/chatbot',
        '/api/analytics'
      ]
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 MUFG Pension Insights Backend API`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
  
  // Log server startup
  AuditService.logSystemEvent({
    event: 'SERVER_START',
    description: 'Backend API server started successfully',
    severity: 'INFO',
    metadata: {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

export default app;
