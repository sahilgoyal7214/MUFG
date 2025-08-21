/**
 * Audit Service
 * Handles logging and auditing of user actions and system events
 * Logs are saved to files in the logs/ directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AuditService {
  
  /**
   * Get the log file path for a specific date and type
   */
  static getLogFilePath(type, date = new Date()) {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const logDir = path.join(__dirname, '../../logs');
    
    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    return path.join(logDir, `${type.toLowerCase()}-${dateStr}.log`);
  }

  /**
   * Write log entry to file
   */
  static async writeLogToFile(logEntry, type) {
    try {
      const logFilePath = this.getLogFilePath(type, logEntry.timestamp);
      const logLine = JSON.stringify(logEntry) + '\n';
      
      // Append to log file
      fs.appendFileSync(logFilePath, logLine);
      
      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${type}]`, logEntry);
      }
      
    } catch (error) {
      console.error('Error writing to log file:', error);
      // Fallback to console logging
      console.log(`[${type}] (FILE_ERROR)`, logEntry);
    }
  }
  /**
   * Log data access events
   */
  static async logDataAccess({ userId, action, targetMemberId, changes, timestamp, ipAddress, userAgent }) {
    try {
      const auditLog = {
        id: this.generateId(),
        userId,
        action,
        targetMemberId,
        changes: changes || null,
        timestamp: timestamp || new Date(),
        type: 'DATA_ACCESS',
        ipAddress: ipAddress || null,
        userAgent: userAgent || null
      };

      // Write to log file
      await this.writeLogToFile(auditLog, 'DATA_ACCESS');
      
      return auditLog;
    } catch (error) {
      console.error('Error logging data access:', error);
    }
  }

  /**
   * Log chatbot interactions
   */
  static async logChatbotInteraction({ userId, memberId, message, response, intent, timestamp }) {
    try {
      const auditLog = {
        id: this.generateId(),
        userId,
        memberId,
        message: this.sanitizeMessage(message),
        response: this.sanitizeMessage(response),
        intent,
        timestamp: timestamp || new Date(),
        type: 'CHATBOT_INTERACTION'
      };

      // Write to log file
      await this.writeLogToFile(auditLog, 'CHATBOT_INTERACTION');
      
      return auditLog;
    } catch (error) {
      console.error('Error logging chatbot interaction:', error);
    }
  }

  /**
   * Log authentication events
   */
  static async logAuth({ userId, action, success, ipAddress, userAgent, timestamp }) {
    try {
      const auditLog = {
        id: this.generateId(),
        userId,
        action, // LOGIN, LOGOUT, FAILED_LOGIN, etc.
        success,
        ipAddress,
        userAgent,
        timestamp: timestamp || new Date(),
        type: 'AUTHENTICATION'
      };

      // Write to log file
      await this.writeLogToFile(auditLog, 'AUTHENTICATION');
      
      return auditLog;
    } catch (error) {
      console.error('Error logging auth event:', error);
    }
  }

  /**
   * Log system events
   */
  static async logSystemEvent({ event, description, severity, metadata, timestamp }) {
    try {
      const auditLog = {
        id: this.generateId(),
        event,
        description,
        severity: severity || 'INFO', // INFO, WARN, ERROR, CRITICAL
        metadata: metadata || {},
        timestamp: timestamp || new Date(),
        type: 'SYSTEM_EVENT'
      };

      // Write to log file
      await this.writeLogToFile(auditLog, 'SYSTEM_EVENT');
      
      return auditLog;
    } catch (error) {
      console.error('Error logging system event:', error);
    }
  }

  /**
   * Log graph analysis events
   */
  static async logGraphAnalysis({ userId, graphType, analysisType, timestamp, insights }) {
    try {
      const auditLog = {
        id: this.generateId(),
        userId,
        graphType,
        analysisType,
        insights,
        timestamp: timestamp || new Date(),
        type: 'GRAPH_ANALYSIS'
      };

      // Write to log file
      await this.writeLogToFile(auditLog, 'GRAPH_ANALYSIS');
      
      return auditLog;
    } catch (error) {
      console.error('Error logging graph analysis:', error);
    }
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs({ 
    userId, 
    type, 
    action, 
    startDate, 
    endDate, 
    limit = 100, 
    offset = 0 
  }) {
    try {
      // In a real implementation, query database with filters
      return {
        logs: [],
        total: 0,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Generate unique ID for audit logs
   */
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Sanitize message for logging (remove sensitive data)
   */
  static sanitizeMessage(message) {
    if (!message) return message;
    
    // Remove potential sensitive information
    return message
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD_NUMBER]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/password\s*[=:]\s*\S+/gi, 'password=[REDACTED]');
  }

  /**
   * Export audit logs for compliance
   */
  static async exportAuditLogs({ startDate, endDate, format = 'json' }) {
    try {
      const logs = await this.getAuditLogs({ 
        startDate, 
        endDate, 
        limit: 10000 
      });

      if (format === 'csv') {
        return this.convertToCSV(logs.logs);
      }

      return logs.logs;
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }

  /**
   * Convert logs to CSV format
   */
  static convertToCSV(logs) {
    if (!logs.length) return '';

    const headers = Object.keys(logs[0]).join(',');
    const rows = logs.map(log => 
      Object.values(log).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  /**
   * Read logs from file for a specific date and type
   */
  static async readLogsFromFile(type, date = new Date()) {
    try {
      const logFilePath = this.getLogFilePath(type, date);
      
      if (!fs.existsSync(logFilePath)) {
        return [];
      }

      const fileContent = fs.readFileSync(logFilePath, 'utf8');
      const lines = fileContent.trim().split('\n').filter(line => line.trim());
      
      return lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          console.error('Error parsing log line:', error);
          return null;
        }
      }).filter(log => log !== null);

    } catch (error) {
      console.error('Error reading logs from file:', error);
      return [];
    }
  }

  /**
   * Get available log files
   */
  static getAvailableLogFiles() {
    try {
      const logDir = path.join(__dirname, '../../logs');
      
      if (!fs.existsSync(logDir)) {
        return [];
      }

      return fs.readdirSync(logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => {
          const [type, date] = file.replace('.log', '').split('-');
          return { type: type.toUpperCase(), date, filename: file };
        });

    } catch (error) {
      console.error('Error getting available log files:', error);
      return [];
    }
  }

  /**
   * Clean up old log files (older than specified days)
   */
  static cleanupOldLogs(daysToKeep = 90) {
    try {
      const logDir = path.join(__dirname, '../../logs');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const logFiles = this.getAvailableLogFiles();
      let deletedCount = 0;

      logFiles.forEach(({ filename, date }) => {
        const logDate = new Date(date);
        if (logDate < cutoffDate) {
          const filePath = path.join(logDir, filename);
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Deleted old log file: ${filename}`);
        }
      });

      return { deletedCount, totalFiles: logFiles.length };

    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      return { deletedCount: 0, totalFiles: 0 };
    }
  }

  /**
   * Get log statistics
   */
  static async getLogStatistics(type, date = new Date()) {
    try {
      const logs = await this.readLogsFromFile(type, date);
      
      const stats = {
        totalEntries: logs.length,
        type,
        date: date.toISOString().split('T')[0],
        breakdown: {}
      };

      // Count by action/event type
      logs.forEach(log => {
        const key = log.action || log.event || 'unknown';
        stats.breakdown[key] = (stats.breakdown[key] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error('Error getting log statistics:', error);
      return { totalEntries: 0, type, date: date.toISOString().split('T')[0], breakdown: {} };
    }
  }
}
