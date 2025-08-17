/**
 * Database Configuration
 * Handles database connection and configuration for different environments
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  development: {
    type: 'sqlite',
    database: join(__dirname, '../../database/pension_insights_dev.db'),
    synchronize: true,
    logging: true,
    entities: [join(__dirname, '../models/*.js')],
    migrations: [join(__dirname, '../../database/migrations/*.js')],
    seeds: [join(__dirname, '../../database/seeders/*.js')]
  },
  
  production: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [join(__dirname, '../models/*.js')],
    migrations: [join(__dirname, '../../database/migrations/*.js')]
  },
  
  test: {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [join(__dirname, '../models/*.js')]
  }
};

export default config[process.env.NODE_ENV || 'development'];
