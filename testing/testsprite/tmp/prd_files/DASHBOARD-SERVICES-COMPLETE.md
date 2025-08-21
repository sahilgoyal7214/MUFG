# MUFG Backend Dashboard Services Documentation

## Overview

This document describes the backend API services extracted from Streamlit dashboard files. All dashboard business logic has been successfully converted into RESTful API endpoints for programmatic access.

## Services Created

### 1. PortfolioOptimizationService.js
**Source**: `advisor_portfolio_optimization.py`

**Key Features**:
- Risk-based asset allocation (Low: 40%, Medium: 60%, High: 75% equity)
- Age glide path adjustments (100 - age formula with risk tolerance modifications)
- Pension type considerations (401k, IRA, Roth IRA strategies)
- Rebalancing recommendations with drift tolerance
- Withdrawal impact analysis

**API Endpoints**:
- `GET /api/advisor/portfolio-optimization/:userId` - Individual portfolio optimization
- `GET /api/advisor/portfolio-rebalancing/:userId` - Rebalancing recommendations
- `POST /api/advisor/portfolio-optimization/bulk` - Bulk optimizations with filters

### 2. MemberSegmentationService.js
**Source**: `advisor_segmentation.py`

**Key Features**:
- KMeans clustering on age, income, savings, risk tolerance
- Automatic cluster labeling ("High Capacity Savers", "Aggressive & Underfunded", etc.)
- Statistical profiles for each cluster (mean, median, min, max)
- Advisor recommendations per cluster
- Feature standardization using z-score normalization

**API Endpoints**:
- `POST /api/advisor/member-segmentation` - Perform segmentation with configurable cluster count
- `GET /api/advisor/member-segmentation/:clusterId/members` - Get members in specific cluster

### 3. PersonalizedRiskAlertService.js
**Source**: `personalised_risk_alert.py`

**Key Features**:
- Withdrawal rate analysis (4% rule validation)
- Asset allocation appropriateness checks
- Savings gap calculations vs retirement goals
- Market risk exposure assessment
- Inflation risk for conservative portfolios
- Longevity risk evaluation
- Risk level scoring (CRITICAL, HIGH, MEDIUM, LOW)

**API Endpoints**:
- `GET /api/advisor/risk-alerts/:userId` - Individual risk alerts
- `POST /api/advisor/risk-alerts/bulk` - Bulk risk alerts with filtering

### 4. SmartContributionService.js
**Source**: `smart_contribution_recommendations.py`

**Key Features**:
- Multiple growth scenarios (status quo, 10%, 15%, maximum 401k)
- Contribution gap analysis with required additional amounts
- Age-based recommendations (early career vs catch-up strategies)
- Employer match optimization
- Tax-advantaged account strategies
- Future value calculations with compound interest

**API Endpoints**:
- `GET /api/advisor/contribution-recommendations/:userId` - Individual recommendations
- `POST /api/advisor/contribution-recommendations/:userId/what-if` - What-if scenarios
- `POST /api/advisor/contribution-recommendations/bulk` - Bulk recommendations

### 5. WhatIfSimulatorService.js
**Source**: `what_if_simulator_modified.py`

**Key Features**:
- Comprehensive scenario modeling
- Market stress tests (Bull, Normal, Bear, Recession scenarios)
- Sequence of returns risk analysis
- Inflation impact modeling
- Longevity stress testing
- Monte Carlo simulations with normal distribution
- Comparison analysis with insights generation

**API Endpoints**:
- `POST /api/advisor/what-if-simulation/:userId` - Comprehensive what-if analysis
- `POST /api/advisor/monte-carlo-simulation/:userId` - Monte Carlo probability analysis

## Consolidated Dashboard Endpoint

### Comprehensive Dashboard Data
- `GET /api/advisor/dashboard/:userId` - All advisor services data in single call

This endpoint provides:
- Portfolio optimization results
- Risk alerts and severity levels
- Contribution recommendations and scenarios
- Generated in parallel for optimal performance

## Algorithm Details

### Portfolio Optimization Algorithm
```javascript
// Risk-based equity allocation
const baseEquity = riskTolerance === 'Low' ? 40 : 
                  riskTolerance === 'Medium' ? 60 : 75;

// Age glide path adjustment
const ageAdjustedEquity = Math.min(baseEquity, 
    riskTolerance === 'Low' ? 100 - age :
    riskTolerance === 'Medium' ? 110 - age : 120 - age);

// Pension type adjustments
if (pensionType === 'Traditional 401k') {
    equityAllocation = Math.max(equityAllocation - 5, 20);
}
```

### Member Segmentation Algorithm
```javascript
// KMeans clustering with standardized features
const features = [age, annual_income, current_savings, risk_tolerance_num];
const standardized = standardizeFeatures(features); // Z-score normalization
const clusters = performKMeans(standardized, clusterCount);

// Automated cluster labeling
if (avgSavings >= median && avgIncome >= median) {
    label = 'High Capacity Savers';
} else if (avgRisk >= 2.5 && avgSavings < median) {
    label = 'Aggressive & Underfunded';
}
```

### Risk Alert Calculations
```javascript
// 4% withdrawal rule check
const safeWithdrawalAmount = currentSavings * 0.04;
const incomeReplacementRatio = safeWithdrawalAmount / annualIncome;

if (incomeReplacementRatio < 0.7) {
    return HIGH_SEVERITY_ALERT;
}

// Asset allocation check
const recommendedEquity = riskTolerance === 'Low' ? 
    Math.max(20, 100 - age) : Math.max(30, 110 - age);
```

### Contribution Gap Analysis
```javascript
// Future value calculation
const futureValue = currentSavings * Math.pow(1 + return, years) +
    contributions * ((Math.pow(1 + return, years) - 1) / return);

// Gap calculation
const retirementGoal = annualIncome * 10;
const gap = retirementGoal - futureValue;

// Additional contribution needed
const additionalContribution = (gap * return) / 
    (Math.pow(1 + return, years) - 1);
```

### Monte Carlo Simulation
```javascript
// Generate random returns with normal distribution
for (let simulation = 0; simulation < count; simulation++) {
    const returns = generateNormalReturns(mean: 0.07, stdDev: 0.12, years);
    const finalValue = calculateCompoundGrowth(returns);
    results.push(finalValue);
}

// Calculate percentiles and success rates
const p50 = results[Math.floor(count * 0.5)]; // Median outcome
const successRate = results.filter(r => r >= goal).length / count;
```

## Database Integration

All services integrate with the existing `pension_data` table:

**Key Fields Used**:
- `user_id` - Member identification
- `age`, `annual_income`, `current_savings` - Core demographics
- `risk_tolerance` - Investment preference
- `expected_retirement_age` - Planning horizon
- `yearly_contributions` - Current savings rate
- `equity_allocation` - Current portfolio allocation
- `employer_match_rate` - Benefit optimization

## Security & Authentication

- All endpoints require authentication via JWT token
- Role-based access control (advisor roles)
- Input validation using express-validator
- SQL injection protection via parameterized queries

## Performance Optimizations

1. **Parallel Processing**: Dashboard endpoint executes all services concurrently
2. **Database Connection Pooling**: Efficient database resource management
3. **Input Validation**: Early rejection of invalid requests
4. **Caching Opportunities**: Results can be cached for frequently accessed data
5. **Bulk Operations**: Efficient processing of multiple members

## Error Handling

- Comprehensive try-catch blocks in all services
- Meaningful error messages returned to client
- Logging integration for debugging and monitoring
- Graceful degradation when data is incomplete

## Testing

Use the provided test script:
```bash
./test-dashboard-services.sh
```

This script tests:
- Individual member analysis across all services
- Bulk operations with filtering
- Stress test scenarios
- Performance with larger datasets
- Error handling for edge cases

## Migration from Streamlit

### Original Dashboard Files Processed:
1. `advisor_portfolio_optimization.py` (244 lines) → `PortfolioOptimizationService.js`
2. `advisor_segmentation.py` (227 lines) → `MemberSegmentationService.js`  
3. `personalised_risk_alert.py` (106 lines) → `PersonalizedRiskAlertService.js`
4. `smart_contribution_recommendations.py` (110 lines) → `SmartContributionService.js`
5. `what_if_simulator_modified.py` (129 lines) → `WhatIfSimulatorService.js`

### Key Benefits of Migration:
- **Scalability**: Backend APIs can handle multiple concurrent users
- **Integration**: Easy integration with any frontend framework
- **Performance**: Direct database access without Python/Streamlit overhead
- **Security**: Proper authentication and authorization
- **Flexibility**: Services can be called individually or in combination
- **Monitoring**: Full request/response logging and metrics

## Future Enhancements

1. **Caching Layer**: Redis for frequently accessed calculations
2. **Background Jobs**: Async processing for bulk operations
3. **Real-time Updates**: WebSocket integration for live dashboard updates
4. **Advanced Analytics**: Machine learning model integration
5. **Export Functions**: PDF report generation from service data
6. **Notification System**: Automated alerts based on risk thresholds

## API Usage Examples

### Portfolio Optimization
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/advisor/portfolio-optimization/1
```

### Member Segmentation
```bash
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"clusterCount": 4, "filters": {"ageMin": 30, "ageMax": 55}}' \
  http://localhost:4000/api/advisor/member-segmentation
```

### Risk Alerts
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/advisor/risk-alerts/1
```

### What-If Simulation
```bash
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"scenarioParameters": {"contributionChanges": [1000, 2000]}}' \
  http://localhost:4000/api/advisor/what-if-simulation/1
```

All services are now ready for production use and frontend integration.
