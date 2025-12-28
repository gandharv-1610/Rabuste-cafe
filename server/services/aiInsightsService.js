const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Cache for working model
let cachedModel = null;
let cachedModelName = null;

/**
 * Get working Gemini model with fallback
 */
async function getWorkingModel() {
  if (!genAI) {
    return null; // Graceful fallback if API key not set
  }

  if (cachedModel && cachedModelName) {
    return { model: cachedModel, modelName: cachedModelName };
  }

  const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      cachedModel = model;
      cachedModelName = modelName;
      return { model, modelName };
    } catch (error) {
      continue;
    }
  }

  return null;
}

/**
 * Generate AI insights from analytics data
 */
async function generateInsights(analyticsData) {
  if (!genAI) {
    // Fallback to rule-based insights
    return generateRuleBasedInsights(analyticsData);
  }

  try {
    const modelInfo = await getWorkingModel();
    if (!modelInfo) {
      return generateRuleBasedInsights(analyticsData);
    }

    const { model } = modelInfo;

    const prompt = `You are an analytics expert for a coffee café. Analyze the following data and generate 5-7 short, actionable insights (each 1-2 sentences max). Focus on patterns, trends, and actionable recommendations.

Analytics Data:
- Total Orders: ${analyticsData.totalOrders}
- Total Revenue: ₹${analyticsData.totalRevenue.total}
- Average Prep Time: ${analyticsData.averagePrepTime} minutes
- Peak Ordering Time: ${analyticsData.peakOrderingTime !== null ? analyticsData.peakOrderingTime + ':00' : 'N/A'}
- Peak Revenue Hour: ${analyticsData.peakRevenueHour !== null ? analyticsData.peakRevenueHour + ':00' : 'N/A'}

Orders Per Hour (Top 3):
${analyticsData.ordersPerHour.slice(0, 3).map(h => `  ${h.hour}:00 - ${h.count} orders, ₹${h.totalRevenue}`).join('\n')}

Top 5 Items:
${analyticsData.mostOrderedItems.slice(0, 5).map((item, idx) => `  ${idx + 1}. ${item.name} - ${item.totalQuantity} orders, ₹${item.totalRevenue}`).join('\n')}

Revenue Breakdown:
- By Source: ${analyticsData.revenueBreakdown.bySource.map(s => `${s._id}: ₹${s.revenue} (${s.count} orders)`).join(', ')}
- By Category: ${analyticsData.revenueBreakdown.byCategory.map(c => `${c._id}: ₹${c.revenue}`).join(', ')}

Customer Behavior:
- New Customers: ${analyticsData.customerBehavior.newCustomers}
- Returning Customers: ${analyticsData.customerBehavior.returningCustomers}
- Average Order Value: ₹${analyticsData.customerBehavior.averageOrderValue}

Prep Time Intelligence:
- Slowest Items: ${analyticsData.prepTimeIntelligence.perItem.slice(0, 3).map(item => `${item.itemName} (${item.avgPrepTime} min avg)`).join(', ')}

Respond with ONLY a JSON array of insight strings, no markdown, no explanations:
["insight 1", "insight 2", "insight 3", ...]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Try to extract JSON from response
    let insights;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      insights = JSON.parse(cleanText);
    } catch (parseError) {
      // If JSON parse fails, fallback to rule-based
      return generateRuleBasedInsights(analyticsData);
    }

    return Array.isArray(insights) ? insights : generateRuleBasedInsights(analyticsData);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return generateRuleBasedInsights(analyticsData);
  }
}

/**
 * Rule-based insights fallback
 */
function generateRuleBasedInsights(analyticsData) {
  const insights = [];

  // Peak hour insight
  if (analyticsData.peakOrderingTime !== null) {
    insights.push(`Peak ordering hour is ${analyticsData.peakOrderingTime}:00 with highest order volume.`);
  }

  // Revenue source insight
  if (analyticsData.revenueBreakdown.bySource.length > 0) {
    const topSource = analyticsData.revenueBreakdown.bySource[0];
    const percentage = ((topSource.revenue / analyticsData.totalRevenue.total) * 100).toFixed(0);
    insights.push(`${percentage}% of revenue comes from ${topSource._id} orders.`);
  }

  // Category insight
  if (analyticsData.revenueBreakdown.byCategory.length > 0) {
    const topCategory = analyticsData.revenueBreakdown.byCategory[0];
    const percentage = ((topCategory.revenue / analyticsData.totalRevenue.total) * 100).toFixed(0);
    insights.push(`${topCategory._id} category contributes ${percentage}% of total revenue.`);
  }

  // Top item insight
  if (analyticsData.mostOrderedItems.length > 0) {
    const topItem = analyticsData.mostOrderedItems[0];
    insights.push(`"${topItem.name}" is the top-selling item with ${topItem.totalQuantity} orders.`);
  }

  // Customer behavior insight
  const totalCustomers = analyticsData.customerBehavior.newCustomers + analyticsData.customerBehavior.returningCustomers;
  if (totalCustomers > 0) {
    const returningPercent = ((analyticsData.customerBehavior.returningCustomers / totalCustomers) * 100).toFixed(0);
    insights.push(`${returningPercent}% of customers are returning customers, indicating strong loyalty.`);
  }

  // Prep time insight
  if (analyticsData.prepTimeIntelligence.perItem.length > 0) {
    const slowestItem = analyticsData.prepTimeIntelligence.perItem[0];
    if (slowestItem.avgPrepTime > 10) {
      insights.push(`"${slowestItem.itemName}" has the longest average prep time (${slowestItem.avgPrepTime} min) - consider pre-preparation.`);
    }
  }

  // Average order value insight
  if (analyticsData.customerBehavior.averageOrderValue > 0) {
    insights.push(`Average order value is ₹${analyticsData.customerBehavior.averageOrderValue}, indicating good customer spending.`);
  }

  return insights.slice(0, 7); // Limit to 7 insights
}

/**
 * Generate demand forecast for tomorrow
 */
async function generateForecast(historicalData, currentDate) {
  // Simple heuristic-based forecast (can be replaced with ML later)
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayOfWeek = tomorrow.getDay(); // 0 = Sunday, 6 = Saturday

  // Get historical data for the same day of week
  const sameDayOrders = historicalData.ordersPerHour || [];
  const avgOrdersPerHour = sameDayOrders.length > 0 
    ? sameDayOrders.reduce((sum, h) => sum + h.count, 0) / sameDayOrders.length 
    : 0;

  // Calculate expected total orders (simple average with slight day-of-week adjustment)
  const dayMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.2 : 1.0; // Weekend boost
  const expectedOrders = Math.round(historicalData.totalOrders * dayMultiplier);

  // Find peak hour from historical data
  const peakHour = historicalData.peakOrderingTime || 10;

  // Top items from historical data
  const topItems = (historicalData.mostOrderedItems || []).slice(0, 5).map(item => ({
    name: item.name,
    expectedQuantity: Math.round(item.totalQuantity * dayMultiplier)
  }));

  return {
    date: tomorrow.toISOString().split('T')[0],
    expectedOrders,
    predictedPeakHour: peakHour,
    topItems
  };
}

/**
 * Answer conversational analytics query
 */
async function answerQuery(query, analyticsData) {
  if (!genAI) {
    return { answer: "AI analytics is not configured. Please check your API key." };
  }

  try {
    const modelInfo = await getWorkingModel();
    if (!modelInfo) {
      return { answer: "AI service is currently unavailable. Please try again later." };
    }

    const { model } = modelInfo;

    // Summarize analytics data for the prompt
    const dataSummary = `
Total Orders: ${analyticsData.totalOrders}
Total Revenue: ₹${analyticsData.totalRevenue.total}
Peak Hour: ${analyticsData.peakOrderingTime !== null ? analyticsData.peakOrderingTime + ':00' : 'N/A'}
Top Items: ${analyticsData.mostOrderedItems.slice(0, 5).map(item => `${item.name} (${item.totalQuantity} orders)`).join(', ')}
Average Order Value: ₹${analyticsData.customerBehavior.averageOrderValue}
Average Prep Time: ${analyticsData.averagePrepTime} minutes
`;

    const prompt = `You are an analytics assistant for a coffee café. Answer this question based on the analytics data provided. Be concise (2-3 sentences max) and actionable.

Question: ${query}

Analytics Data:
${dataSummary}

Provide a direct, helpful answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text().trim();

    return { answer };
  } catch (error) {
    console.error('Error answering query:', error);
    return { answer: "I couldn't process your query. Please try rephrasing or check back later." };
  }
}

/**
 * Generate smart alerts based on analytics
 */
function generateAlerts(analyticsData, currentHour) {
  const alerts = [];

  // Check for sudden surge (current hour orders > 2x average)
  const avgOrdersPerHour = analyticsData.ordersPerHour.length > 0
    ? analyticsData.ordersPerHour.reduce((sum, h) => sum + h.count, 0) / analyticsData.ordersPerHour.length
    : 0;
  
  const currentHourData = analyticsData.ordersPerHour.find(h => h.hour === currentHour);
  if (currentHourData && currentHourData.count > avgOrdersPerHour * 2) {
    alerts.push({
      type: 'surge',
      severity: 'high',
      message: `Order surge detected! ${currentHourData.count} orders this hour (avg: ${Math.round(avgOrdersPerHour)})`,
      timestamp: new Date()
    });
  }

  // Check prep time threshold
  if (analyticsData.averagePrepTime > 15) {
    alerts.push({
      type: 'prep_time',
      severity: 'medium',
      message: `Average prep time is ${analyticsData.averagePrepTime} minutes (above 15 min threshold)`,
      timestamp: new Date()
    });
  }

  // Check for low returning customer rate
  const totalCustomers = analyticsData.customerBehavior.newCustomers + analyticsData.customerBehavior.returningCustomers;
  if (totalCustomers > 10) {
    const returningRate = (analyticsData.customerBehavior.returningCustomers / totalCustomers) * 100;
    if (returningRate < 30) {
      alerts.push({
        type: 'customer_retention',
        severity: 'low',
        message: `Customer retention rate is ${returningRate.toFixed(0)}% - consider loyalty programs`,
        timestamp: new Date()
      });
    }
  }

  return alerts;
}

module.exports = {
  generateInsights,
  generateForecast,
  answerQuery,
  generateAlerts
};

