const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Coffee = require('../models/Coffee');
const Art = require('../models/Art');
const Workshop = require('../models/Workshop');

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
const getFallbackResponse = async (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
    return "We're open Monday to Sunday, 7 AM to 9 PM. Come visit us for a bold Robusta experience!";
  }
  
  if (lowerMessage.includes('menu') || lowerMessage.includes('coffee') || lowerMessage.includes('drink') || lowerMessage.includes('what do you have')) {
    try {
      const menuItems = await Coffee.find().sort({ order: 1 });
      const coffeeItems = menuItems.filter(item => item.category === 'Coffee').slice(0, 5);
      const otherItems = menuItems.filter(item => item.category !== 'Coffee').slice(0, 3);
      
      let response = "We serve exclusively Robusta coffee! Here are some items from our menu:\n\n";
      
      if (coffeeItems.length > 0) {
        response += "Coffee:\n";
        coffeeItems.forEach(item => {
          response += `- ${item.name} (${item.strength}) - ₹${item.price}\n`;
        });
      }
      
      if (otherItems.length > 0) {
        response += "\nOther items:\n";
        otherItems.forEach(item => {
          response += `- ${item.name} (${item.category}) - ₹${item.price}\n`;
        });
      }
      
      response += "\nVisit our Coffee Menu page to see all items with full descriptions!";
      return response;
    } catch (error) {
      return "We serve exclusively Robusta coffee! Check out our Coffee Menu page to see our curated selection of bold brews.";
    }
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
  
  if (lowerMessage.includes('robusta') || lowerMessage.includes('why robusta')) {
    return "Robusta coffee is known for its bold, full-bodied flavor and higher caffeine content compared to Arabica. It has a stronger, more intense taste with earthy and nutty notes. Visit our 'Why Robusta?' page to learn more about why we exclusively serve Robusta coffee!";
  }
  
  if (lowerMessage.includes('art') || lowerMessage.includes('gallery')) {
    return "We have a micro art gallery featuring works from talented artists. Each piece tells a story and creates an immersive cultural experience. Visit our Art Gallery page to explore the collection!";
  }
  
  if (lowerMessage.includes('franchise') || lowerMessage.includes('business opportunity')) {
    return "We offer franchise opportunities for those interested in bringing the Rabuste Coffee experience to their community. Visit our Franchise page to learn more and submit an enquiry!";
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

    const lowerMessage = message.toLowerCase().trim();

    // Check for navigation requests
    const navigationPatterns = {
      'art': '/art',
      'gallery': '/art',
      'art gallery': '/art',
      'artwork': '/art',
      'coffee': '/coffee',
      'menu': '/coffee',
      'coffee menu': '/coffee',
      'workshop': '/workshops',
      'workshops': '/workshops',
      'class': '/workshops',
      'event': '/workshops',
      'franchise': '/franchise',
      'about': '/about',
      'why robusta': '/why-robusta',
      'why robusta?': '/why-robusta',
      'home': '/',
      'main': '/',
    };

    // Check if user wants to navigate
    for (const [keyword, path] of Object.entries(navigationPatterns)) {
      if (lowerMessage.includes(keyword) && (
        lowerMessage.includes('take me') || 
        lowerMessage.includes('go to') || 
        lowerMessage.includes('show me') ||
        lowerMessage.includes('open') ||
        lowerMessage.includes('navigate') ||
        lowerMessage.includes('redirect')
      )) {
        return res.json({
          response: `I'll take you to the ${keyword === 'art' ? 'Art Gallery' : keyword === 'coffee' ? 'Coffee Menu' : keyword} page!`,
          navigateTo: path,
          isRelevant: true
        });
      }
    }

    // Fetch actual menu data
    const menuItems = await Coffee.find().sort({ order: 1, createdAt: -1 });
    const artPieces = await Art.find({ availability: 'Available' }).limit(10);
    const workshops = await Workshop.find({ isActive: true }).limit(5);

    // Check for fallback first
    const fallback = await getFallbackResponse(message);
    if (fallback) {
      return res.json({
        response: fallback,
        isRelevant: true
      });
    }

    if (!genAI) {
      // Fallback response with menu items
      const coffeeList = menuItems.filter(item => item.category === 'Coffee').map(item => `- ${item.name} (${item.strength}, ₹${item.price})`).join('\n');
      const otherItems = menuItems.filter(item => item.category !== 'Coffee').map(item => `- ${item.name} (${item.category}, ₹${item.price})`).join('\n');
      
      return res.json({ 
        response: `I'm here to help you learn about Rabuste Coffee! We serve exclusively Robusta coffee. Our menu includes:\n\n${coffeeList}\n\n${otherItems ? `Other items:\n${otherItems}\n\n` : ''}Visit our Coffee Menu page to see all items with descriptions. How can I help you?`,
        isRelevant: true
      });
    }

    // Use gemini-1.5-flash for faster responses
    const modelName = 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    // Format menu items for AI
    const coffeeItems = menuItems
      .filter(item => item.category === 'Coffee')
      .map(item => ({
        name: item.name,
        description: item.description,
        strength: item.strength,
        price: item.price,
        flavorNotes: item.flavorNotes || [],
        isBestseller: item.isBestseller
      }));

    const otherItems = menuItems
      .filter(item => item.category !== 'Coffee')
      .map(item => ({
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price
      }));

    const menuData = {
      coffee: coffeeItems,
      otherItems: otherItems,
      art: artPieces.map(art => ({
        title: art.title,
        artistName: art.artistName,
        description: art.description,
        price: art.price,
        availability: art.availability
      })),
      workshops: workshops.map(w => ({
        title: w.title,
        type: w.type,
        description: w.description,
        date: w.date,
        price: w.price
      }))
    };

    const systemPrompt = `You are a friendly and knowledgeable assistant for Rabuste Coffee, a specialty café that serves ONLY Robusta coffee.

CURRENT MENU ITEMS (ONLY SUGGEST FROM THIS LIST):

COFFEE ITEMS (All are Robusta coffee):
${coffeeItems.map(item => `- ${item.name}: ${item.description} (Strength: ${item.strength}, Price: ₹${item.price}${item.flavorNotes.length > 0 ? `, Notes: ${item.flavorNotes.join(', ')}` : ''}${item.isBestseller ? ', BESTSELLER' : ''})`).join('\n')}

OTHER ITEMS:
${otherItems.map(item => `- ${item.name} (${item.category}): ${item.description} (Price: ₹${item.price})`).join('\n')}

CRITICAL RULES:
1. ONLY suggest items from the menu above. NEVER suggest items not in this list.
2. When suggesting coffee, mention it's Robusta coffee and highlight its bold, full-bodied nature.
3. For vague queries like "what do you recommend" or "what's good", suggest 2-3 items from the menu with brief reasons.
4. If user asks about items not in menu, politely say: "I don't see that item in our current menu. Would you like to see our available items?"
5. Be conversational, warm, and helpful (2-3 sentences max).
6. For navigation requests (like "take me to art"), respond with: "NAVIGATE:/art" (but this should be handled before reaching AI).

CAFÉ INFORMATION:
- We serve ONLY Robusta coffee (bold, full-bodied, higher caffeine)
- We have an art gallery with featured artists
- We offer workshops (coffee, art, community sessions)
- We have franchise opportunities

Conversation history: ${JSON.stringify(conversationHistory.slice(-3))}

User question: ${message}

Provide a helpful response based ONLY on the menu items above and café information. If the query is vague, suggest 2-3 items from the menu with brief explanations.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text().trim();

    res.json({
      response: text,
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
    try {
      const fallback = await getFallbackResponse(message);
      if (fallback) {
        return res.json({
          response: fallback,
          isRelevant: true
        });
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
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

