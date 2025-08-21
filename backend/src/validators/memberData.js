/**
 * Member Data Validation
 * Validation schemas for member data operations
 */

export const memberDataValidation = {
  /**
   * Validate member ID
   */
  validateMemberId: (memberId) => {
    if (!memberId || typeof memberId !== 'string') {
      return { isValid: false, error: 'Member ID is required and must be a string' };
    }
    
    if (memberId.length < 3 || memberId.length > 50) {
      return { isValid: false, error: 'Member ID must be between 3 and 50 characters' };
    }
    
    return { isValid: true };
  },

  /**
   * Validate personal information
   */
  validatePersonalInfo: (personalInfo) => {
    const errors = [];
    
    if (personalInfo.age && (personalInfo.age < 18 || personalInfo.age > 100)) {
      errors.push('Age must be between 18 and 100');
    }
    
    if (personalInfo.email && !isValidEmail(personalInfo.email)) {
      errors.push('Invalid email format');
    }
    
    return errors.length === 0 ? { isValid: true } : { isValid: false, errors };
  },

  /**
   * Validate pension details
   */
  validatePensionDetails: (pensionDetails) => {
    const errors = [];
    
    if (pensionDetails.currentBalance && pensionDetails.currentBalance < 0) {
      errors.push('Current balance cannot be negative');
    }
    
    if (pensionDetails.monthlyContribution && pensionDetails.monthlyContribution < 0) {
      errors.push('Monthly contribution cannot be negative');
    }
    
    if (pensionDetails.retirementAge && (pensionDetails.retirementAge < 50 || pensionDetails.retirementAge > 80)) {
      errors.push('Retirement age must be between 50 and 80');
    }
    
    return errors.length === 0 ? { isValid: true } : { isValid: false, errors };
  }
};

/**
 * Email validation helper
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
