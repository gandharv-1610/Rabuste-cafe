const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('Warning: GOOGLE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// AI Coffee Discovery
router.post('/coffee-discovery', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ 
        message: 'Gemini API is not configured. Please set GOOGLE_GEMINI_API_KEY in environment variables.',
        error: 'API key missing'
      });
    }

    const { mood, timeOfDay, energyLevel } = req.body;

    if (!mood || !timeOfDay || !energyLevel) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Use gemini-1.5-flash for faster responses (fallback: gemini-pro)
    const modelName = 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are a Robusta coffee expert at Rabuste Coffee, a specialty café that serves ONLY Robusta coffee. 

Based on the following user inputs, recommend the best Robusta coffee brew from our menu:

User Mood: ${mood}
Time of Day: ${timeOfDay}
Energy Level: ${energyLevel}

Available Robusta coffee types we serve:
- Espresso (Strong, bold, full-bodied)
- Americano (Medium-strong, smooth, versatile)
- Cappuccino (Medium, creamy, balanced)
- Latte (Mild-Medium, smooth, milky)
- Cold Brew (Strong, smooth, less acidic)
- French Press (Extra Strong, rich, full-bodied)
- Pour Over (Medium-Strong, clean, nuanced)

Provide your recommendation in this JSON format:
{
  "recommendation": "coffee name",
  "strength": "Mild/Medium/Strong/Extra Strong",
  "explanation": "brief 2-3 sentence explanation of why this Robusta brew matches their mood, time of day, and energy level. Focus only on coffee, brewing method, and flavor. Be specific about Robusta characteristics."
}

Remember: We ONLY serve Robusta coffee, so emphasize Robusta's bold, full-bodied nature and higher caffeine content.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from response
    let recommendation;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (error) {
      // Fallback if parsing fails
      recommendation = {
        recommendation: 'Robusta Espresso',
        strength: 'Strong',
        explanation: text.substring(0, 200) || 'A bold Robusta brew perfect for your current mood and energy level.'
      };
    }

    res.json(recommendation);
  } catch (error) {
    console.error('AI Coffee Discovery Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Provide more helpful error messages
    let errorMessage = 'Error generating recommendation';
    if (error.message.includes('API key')) {
      errorMessage = 'Invalid API key. Please check your GOOGLE_GEMINI_API_KEY.';
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      errorMessage = 'API quota exceeded. Please check your Gemini API limits.';
    } else if (error.message.includes('model') || error.message.includes('not found')) {
      errorMessage = 'Model not available. Please check if gemini-1.5-flash is available in your API plan.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: error.message 
    });
  }
});

// Fallback responses for common queries
const getFallbackResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
    return "We're open Monday to Sunday, 7 AM to 9 PM. Come visit us for a bold Robusta experience!";
  }
  
  if (lowerMessage.includes('menu') || lowerMessage.includes('coffee') || lowerMessage.includes('drink')) {
    return "We serve exclusively Robusta coffee! Check out our Coffee Menu page to see our curated selection of bold brews.";
  }
  
  if (lowerMessage.includes('workshop') || lowerMessage.includes('class') || lowerMessage.includes('event')) {
    return "We offer coffee workshops, art & creativity sessions, and community events. Visit our Workshops page to see upcoming sessions and register!";
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return "Our coffee prices vary by brew type. Please visit our Coffee Menu page for detailed pricing. Workshop prices are listed on the Workshops page.";
  }
  
  if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
    return "Visit our website to find our location details. We'd love to welcome you to Rabuste Coffee!";
  }
  
  return null; // No fallback, use AI
};

// Smart Café Chatbot
router.post('/chatbot', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Check for fallback first
    const fallback = getFallbackResponse(message);
    if (fallback) {
      return res.json({
        response: fallback,
        isRelevant: true
      });
    }

    if (!genAI) {
      return res.json({ 
        response: "I'm here to help you learn about Rabuste Coffee, our Robusta brews, art gallery, workshops, and franchise opportunities. How can I help with that?",
        isRelevant: true
      });
    }

    // Use gemini-1.5-flash for faster responses (fallback: gemini-pro)
    const modelName = 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = `You are a friendly and knowledgeable assistant for Rabuste Coffee, a specialty café that serves ONLY Robusta coffee. 

Your role is to help customers learn about:
- Robusta coffee (what it is, flavor profile, why we serve only Robusta)
- Our coffee menu and brewing methods
- Art gallery and featured artists
- Workshops and community experiences
- Franchise opportunities

IMPORTANT RULES:
1. You MUST only answer questions related to coffee, art, workshops, or the café
2. If asked about topics outside these areas, politely redirect: "I'm here to help you learn about Rabuste Coffee, our Robusta brews, art gallery, workshops, and franchise opportunities. How can I help with that?"
3. Be conversational, warm, and coffee-focused
4. Keep responses concise (2-3 sentences max)
5. For workshop details, encourage them to visit the Workshops page
6. For art inquiries, direct them to the Art Gallery
7. For franchise info, suggest the Franchise page

Conversation history: ${JSON.stringify(conversationHistory.slice(-3))}

User question: ${message}

Provide a helpful, on-topic response:`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      response: text.trim(),
      isRelevant: true
    });
  } catch (error) {
    console.error('Chatbot Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Try fallback on error
    const fallback = getFallbackResponse(message);
    if (fallback) {
      return res.json({
        response: fallback,
        isRelevant: true
      });
    }
    
    // Provide more helpful error messages
    let errorMessage = 'Error processing message';
    if (error.message.includes('API key')) {
      errorMessage = 'Invalid API key. Please check your GOOGLE_GEMINI_API_KEY.';
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      errorMessage = 'API quota exceeded. Please check your Gemini API limits.';
    } else if (error.message.includes('model') || error.message.includes('not found')) {
      errorMessage = 'Model not available. Please check if gemini-1.5-flash is available in your API plan.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: error.message 
    });
  }
});

module.exports = router;

