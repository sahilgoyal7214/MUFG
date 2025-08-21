/**
 * Swagger Configuration
 * OpenAPI 3.0 specification for MUFG Pension Insights API
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MUFG Pension Insights API',
      version: '1.0.0',
      description: `
        A comprehensive REST API for pension data management and analytics.
        
        ## Features
        - **Role-based Authentication**: JWT-based authentication with three user roles
        - **Pension Data Management**: Upload, retrieve, and analyze pension data
        - **Interactive Charts**: Generate dynamic visualizations
        - **Audit Logging**: Comprehensive logging for compliance
        - **KPI Calculations**: Advanced financial calculations for retirement planning
        
        ## Authentication
        Most endpoints require a valid JWT token. Include it in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ## User Roles
        - **Member**: Individual pension holders (limited access to own data)
        - **Advisor**: Financial advisors (access to client data and analytics)
        - **Regulator**: Compliance officers (full access to all data and logs)
      `,
      contact: {
        name: 'MUFG API Support',
        email: 'api-support@mufg.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      },
      {
        url: 'https://api.mufg-pension.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique user identifier'
            },
            username: {
              type: 'string',
              description: 'Username for login'
            },
            role: {
              type: 'string',
              enum: ['member', 'advisor', 'regulator'],
              description: 'User role determining access level'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            fullName: {
              type: 'string',
              description: 'Full name of the user'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Username for authentication'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Password for authentication'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            token: {
              type: 'string',
              description: 'JWT authentication token'
            }
          }
        },
        PensionData: {
          type: 'object',
          properties: {
            memberId: {
              type: 'string',
              description: 'Unique member identifier'
            },
            age: {
              type: 'integer',
              minimum: 18,
              maximum: 100,
              description: 'Member age'
            },
            salary: {
              type: 'number',
              minimum: 0,
              description: 'Annual salary'
            },
            contribution: {
              type: 'number',
              minimum: 0,
              description: 'Monthly pension contribution'
            },
            balance: {
              type: 'number',
              minimum: 0,
              description: 'Current pension balance'
            },
            riskLevel: {
              type: 'string',
              enum: ['Low', 'Medium', 'High'],
              description: 'Investment risk level'
            },
            employment: {
              type: 'string',
              enum: ['Full-time', 'Part-time'],
              description: 'Employment status'
            }
          }
        },
        ChartRequest: {
          type: 'object',
          required: ['chartType', 'xAxis'],
          properties: {
            chartType: {
              type: 'string',
              enum: ['bar', 'line', 'scatter', 'histogram'],
              description: 'Type of chart to generate'
            },
            xAxis: {
              type: 'string',
              description: 'Data field for X-axis'
            },
            yAxis: {
              type: 'string',
              description: 'Data field for Y-axis (optional for histogram)'
            },
            filters: {
              type: 'object',
              description: 'Optional data filters'
            }
          }
        },
        KpiCalculation: {
          type: 'object',
          properties: {
            readinessScore: {
              type: 'number',
              description: 'Retirement readiness score (0-100)'
            },
            projectedCorpus: {
              type: 'number',
              description: 'Projected retirement corpus'
            },
            targetCorpus: {
              type: 'number',
              description: 'Target retirement corpus'
            },
            yearsToRetirement: {
              type: 'integer',
              description: 'Years until retirement'
            }
          }
        },
        ChatbotMessage: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Message ID'
            },
            message: {
              type: 'string',
              description: 'Message content'
            },
            response: {
              type: 'string',
              description: 'Chatbot response'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Message timestamp'
            },
            userId: {
              type: 'string',
              description: 'User who sent the message'
            }
          }
        },
        AnalyticsDashboard: {
          type: 'object',
          properties: {
            totalMembers: {
              type: 'integer',
              description: 'Total number of members'
            },
            averageBalance: {
              type: 'number',
              description: 'Average pension balance'
            },
            averageAge: {
              type: 'number',
              description: 'Average member age'
            },
            riskDistribution: {
              type: 'object',
              properties: {
                Low: { type: 'integer' },
                Medium: { type: 'integer' },
                High: { type: 'integer' }
              }
            },
            performanceMetrics: {
              type: 'object',
              description: 'Performance indicators and KPIs'
            }
          }
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Log entry ID'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Log timestamp'
            },
            type: {
              type: 'string',
              enum: ['AUTHENTICATION', 'DATA_ACCESS', 'SYSTEM_EVENT', 'CHATBOT_INTERACTION'],
              description: 'Log entry type'
            },
            userId: {
              type: 'string',
              description: 'User ID associated with the log entry'
            },
            action: {
              type: 'string',
              description: 'Action performed'
            },
            details: {
              type: 'object',
              description: 'Additional log details'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              description: 'Current page number'
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages'
            },
            totalRecords: {
              type: 'integer',
              description: 'Total number of records'
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there is a next page'
            },
            hasPrev: {
              type: 'boolean',
              description: 'Whether there is a previous page'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            status: {
              type: 'integer',
              description: 'HTTP status code'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './app.js'
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
