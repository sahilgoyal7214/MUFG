import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate chart data
router.post('/generate', authenticateToken, (req, res) => {
  try {
    const { chartType, xAxis, yAxis, filters } = req.body;

    // Mock data for chart generation
    const mockData = [
      { age: 25, balance: 15000, salary: 35000, contribution: 280, riskLevel: 'Low' },
      { age: 28, balance: 28900, salary: 52000, contribution: 416, riskLevel: 'High' },
      { age: 32, balance: 42000, salary: 48000, contribution: 384, riskLevel: 'Medium' },
      { age: 34, balance: 45200, salary: 65000, contribution: 520, riskLevel: 'Medium' },
      { age: 38, balance: 67000, salary: 72000, contribution: 576, riskLevel: 'High' },
      { age: 42, balance: 89000, salary: 85000, contribution: 680, riskLevel: 'Low' },
      { age: 45, balance: 127450, salary: 78000, contribution: 624, riskLevel: 'Medium' },
      { age: 48, balance: 156000, salary: 95000, contribution: 760, riskLevel: 'High' },
      { age: 52, balance: 198000, salary: 88000, contribution: 704, riskLevel: 'Medium' },
      { age: 55, balance: 234000, salary: 92000, contribution: 736, riskLevel: 'Low' },
      { age: 58, balance: 267000, salary: 98000, contribution: 784, riskLevel: 'High' },
      { age: 62, balance: 312000, salary: 105000, contribution: 840, riskLevel: 'Medium' }
    ];

    let filteredData = [...mockData];

    // Apply filters
    if (filters) {
      if (filters.ageMin) filteredData = filteredData.filter(d => d.age >= filters.ageMin);
      if (filters.ageMax) filteredData = filteredData.filter(d => d.age <= filters.ageMax);
      if (filters.riskLevel && filters.riskLevel !== 'All Levels') {
        filteredData = filteredData.filter(d => d.riskLevel === filters.riskLevel);
      }
    }

    // Generate chart data based on type
    let chartData = {};

    switch (chartType) {
      case 'scatter':
        chartData = {
          type: 'scatter',
          mode: 'markers',
          x: filteredData.map(d => d[xAxis]),
          y: filteredData.map(d => d[yAxis]),
          marker: {
            size: 10,
            color: 'rgb(59, 130, 246)',
            opacity: 0.7
          },
          name: `${yAxis} vs ${xAxis}`
        };
        break;

      case 'bar':
        const groupedData = {};
        filteredData.forEach(d => {
          const key = d[xAxis];
          if (!groupedData[key]) groupedData[key] = [];
          groupedData[key].push(d[yAxis]);
        });

        const avgData = Object.keys(groupedData).map(key => ({
          x: key,
          y: groupedData[key].reduce((sum, val) => sum + val, 0) / groupedData[key].length
        }));

        chartData = {
          type: 'bar',
          x: avgData.map(d => d.x),
          y: avgData.map(d => d.y),
          marker: {
            color: 'rgb(59, 130, 246)'
          },
          name: `Average ${yAxis} by ${xAxis}`
        };
        break;

      case 'line':
        const sortedData = filteredData.sort((a, b) => a[xAxis] - b[xAxis]);
        chartData = {
          type: 'scatter',
          mode: 'lines+markers',
          x: sortedData.map(d => d[xAxis]),
          y: sortedData.map(d => d[yAxis]),
          line: {
            color: 'rgb(59, 130, 246)',
            width: 2
          },
          marker: {
            color: 'rgb(59, 130, 246)',
            size: 6
          },
          name: `${yAxis} vs ${xAxis}`
        };
        break;

      case 'histogram':
        chartData = {
          type: 'histogram',
          x: filteredData.map(d => d[xAxis]),
          marker: {
            color: 'rgb(59, 130, 246)',
            opacity: 0.7
          },
          name: `Distribution of ${xAxis}`
        };
        break;

      default:
        return res.status(400).json({
          error: 'Unsupported chart type'
        });
    }

    const layout = {
      title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart: ${yAxis || 'Distribution'} ${yAxis ? 'vs' : 'of'} ${xAxis}`,
      xaxis: { title: xAxis },
      yaxis: { title: yAxis || 'Count' },
      showlegend: false,
      margin: { t: 50, r: 30, b: 50, l: 50 }
    };

    res.json({
      data: [chartData],
      layout,
      config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
      }
    });

  } catch (error) {
    console.error('Error generating chart:', error);
    res.status(500).json({
      error: 'Error generating chart data'
    });
  }
});

// Get pre-built chart configurations for different roles
router.get('/templates/:role', authenticateToken, (req, res) => {
  try {
    const { role } = req.params;

    const templates = {
      member: [
        {
          id: 'age-balance',
          title: 'Age vs Balance',
          type: 'scatter',
          xAxis: 'age',
          yAxis: 'balance',
          description: 'See how your pension balance grows with age'
        },
        {
          id: 'contribution-trends',
          title: 'Contribution Trends',
          type: 'line',
          xAxis: 'age',
          yAxis: 'contribution',
          description: 'Track contribution patterns over time'
        },
        {
          id: 'risk-distribution',
          title: 'Risk Level Distribution',
          type: 'histogram',
          xAxis: 'riskLevel',
          description: 'Distribution of risk levels in portfolio'
        }
      ],
      advisor: [
        {
          id: 'client-performance',
          title: 'Client Performance Overview',
          type: 'bar',
          xAxis: 'riskLevel',
          yAxis: 'balance',
          description: 'Average client balances by risk level'
        },
        {
          id: 'age-distribution',
          title: 'Client Age Distribution',
          type: 'histogram',
          xAxis: 'age',
          description: 'Age distribution of your client base'
        }
      ],
      regulator: [
        {
          id: 'industry-overview',
          title: 'Industry Performance Overview',
          type: 'bar',
          xAxis: 'riskLevel',
          yAxis: 'balance',
          description: 'Industry-wide performance by risk level'
        },
        {
          id: 'compliance-trends',
          title: 'Compliance Trends',
          type: 'line',
          xAxis: 'age',
          yAxis: 'contribution',
          description: 'Compliance patterns across age groups'
        }
      ]
    };

    res.json({
      templates: templates[role] || [],
      role
    });

  } catch (error) {
    console.error('Error fetching chart templates:', error);
    res.status(500).json({
      error: 'Error fetching chart templates'
    });
  }
});

export default router;
