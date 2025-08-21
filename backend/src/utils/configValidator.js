/**
 * Configuration Validation
 * Validates environment variables and configuration settings
 */

/**
 * Required environment variables
 */
const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT'
];

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS = {
  FRONTEND_URL: 'http://localhost:3000',
  JWT_SECRET: 'development-only-secret-change-in-production',
  LOG_LEVEL: 'info',
  MAX_FILE_SIZE: '50MB'
};

/**
 * Validate environment configuration
 */
export const validateConfig = () => {
  const errors = [];
  const warnings = [];
  
  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // Check optional variables and set defaults
  for (const [envVar, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[envVar]) {
      process.env[envVar] = defaultValue;
      warnings.push(`Using default value for ${envVar}: ${defaultValue}`);
    }
  }
  
  // Validate specific configurations
  
  // Port validation
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push('PORT must be a valid number between 1 and 65535');
    }
  }
  
  // Node environment validation
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    warnings.push('NODE_ENV should be one of: development, production, test');
  }
  
  // JWT secret validation
  if (process.env.JWT_SECRET === 'development-only-secret-change-in-production' && 
      process.env.NODE_ENV === 'production') {
    errors.push('JWT_SECRET must be changed for production environment');
  }
  
  // Database URL validation
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    warnings.push('DATABASE_URL should be a valid PostgreSQL connection string');
  }
  
  // CORS validation
  if (process.env.FRONTEND_URL && !isValidUrl(process.env.FRONTEND_URL)) {
    warnings.push('FRONTEND_URL should be a valid URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * URL validation helper
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Get configuration summary
 */
export const getConfigSummary = () => {
  return {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 4000,
    database: {
      type: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite',
      url: process.env.DATABASE_URL ? '***configured***' : 'local SQLite'
    },
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    features: {
      localLLM: !!process.env.LOCAL_LLM_URL,
      logging: process.env.LOG_LEVEL || 'info',
      uploads: process.env.MAX_FILE_SIZE || '50MB'
    },
    security: {
      jwt: process.env.JWT_SECRET ? '***configured***' : 'default',
      helmet: true,
      cors: true,
      rateLimit: true
    }
  };
};

/**
 * Initialize and validate configuration
 */
export const initializeConfig = () => {
  console.log('🔧 Validating configuration...');
  
  const validation = validateConfig();
  
  if (validation.errors.length > 0) {
    console.error('❌ Configuration errors:');
    validation.errors.forEach(error => console.error(`   - ${error}`));
    process.exit(1);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Configuration warnings:');
    validation.warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  console.log('✅ Configuration validated successfully');
  
  // Log configuration summary in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📋 Configuration Summary:');
    const summary = getConfigSummary();
    console.log(`   Environment: ${summary.environment}`);
    console.log(`   Port: ${summary.port}`);
    console.log(`   Database: ${summary.database.type}`);
    console.log(`   CORS Origin: ${summary.cors.origin}`);
    console.log(`   Local LLM: ${summary.features.localLLM ? 'Enabled' : 'Disabled'}`);
  }
  
  return validation;
};
