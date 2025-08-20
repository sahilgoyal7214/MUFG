/**
 * Simple test for AuditService
 */
import { AuditService } from './src/services/AuditService.js';

console.log('Testing AuditService...');

// Test system event logging
AuditService.logSystemEvent({
  event: 'TEST_REQUEST',
  description: 'Test log entry from audit test',
  severity: 'INFO',
  metadata: {
    testId: 'test-123',
    timestamp: new Date().toISOString()
  }
});

console.log('✅ Test log sent to AuditService');
console.log('Check logs/system_event-2025-08-20.log for the test entry');
