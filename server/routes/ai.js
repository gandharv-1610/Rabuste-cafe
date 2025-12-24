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

// Cache for working model (avoid testing multiple times)
let cachedModel = null;
let cachedModelName = null;

// Helper function to get working Gemini model with fallback
async function getWorkingModel(testConnection = false) {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please set GOOGLE_GEMINI_API_KEY in environment variables.');
  }

  // Return cached model if available and not testing
  if (cachedModel && cachedModelName && !testConnection) {
    return { model: cachedModel, modelName: cachedModelName };
  }

  // Try models in order of preference (most available first)
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-pro'
  ];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // If testConnection is true, test with a simple request (for diagnostics)
      if (testConnection) {
        const testResult = await model.generateContent('Say "OK"');
        await testResult.response;
        console.log(`✓ Tested ${modelName} - working`);
      }
      
      // Cache the working model
      cachedModel = model;
      cachedModelName = modelName;
      console.log(`✓ Using Gemini model: ${modelName}`);
      return { model, modelName };
    } catch (error) {
      console.log(`✗ ${modelName} not available: ${error.message}`);
      // Continue to next model
      continue;
    }
  }

  throw new Error('No Gemini models are available. Please check your API key and subscription.');
}

// AI Coffee Discovery
router.post('/coffee-discovery', async (req, res) => {
  try {
    const { mood, timeOfDay, energyLevel } = req.body;

    if (!mood || !timeOfDay || !energyLevel) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch actual menu items from database
    const menuItems = await Coffee.find().sort({ order: 1, createdAt: -1 });
    const coffeeItems = menuItems.filter(item => item.category === 'Coffee');

    if (coffeeItems.length === 0) {
      return res.status(404).json({ 
        message: 'No coffee items found in menu. Please add items to the menu first.' 
      });
    }

    // Smart rule-based recommendation system (works without AI)
    let recommendation = getSmartRecommendation(coffeeItems, mood, timeOfDay, energyLevel);
    
    // Try to enhance with AI if available (optional enhancement)
    if (genAI) {
      try {
        const { model, modelName } = await getWorkingModel();

        const prompt = `Based on these preferences, recommend ONE coffee from this menu:
- Mood: ${mood}
- Time: ${timeOfDay}
- Energy: ${energyLevel}

Menu: ${coffeeItems.map(item => `${item.name} (${item.strength}): ${item.description}`).join('; ')}

Respond with ONLY valid JSON (no markdown):
{
  "itemName": "exact menu item name",
  "explanation": "brief 2-3 sentence explanation"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Try to parse AI response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiRecommendation = JSON.parse(jsonMatch[0]);
          const aiItem = coffeeItems.find(item => 
            item.name.toLowerCase() === aiRecommendation.itemName?.toLowerCase()
          );
          
          if (aiItem) {
            // Use AI recommendation if it found a valid item
            recommendation = {
              itemName: aiItem.name,
              recommendation: aiItem.name,
              strength: aiItem.strength,
              price: aiItem.price,
              description: aiItem.description,
              flavorNotes: aiItem.flavorNotes || [],
              image: aiItem.image || aiItem.cloudinary_url || '',
              isBestseller: aiItem.isBestseller,
              explanation: aiRecommendation.explanation || recommendation.explanation
            };
          }
        }
      } catch (aiError) {
        console.log('AI enhancement failed, using rule-based recommendation:', aiError.message);
        // Continue with rule-based recommendation (already set above)
      }
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
    
    // Provide more helpful error messages based on the actual error
    let errorMessage = 'Error generating recommendation';
    let statusCode = 500;
    
    if (error.message.includes('API key') || error.message.includes('invalid') || error.response?.status === 401) {
      errorMessage = 'Invalid API key. Please check your GOOGLE_GEMINI_API_KEY in the .env file. Get a key at: https://makersuite.google.com/app/apikey';
      statusCode = 401;
    } else if (error.message.includes('quota') || error.message.includes('limit') || error.response?.status === 429) {
      errorMessage = 'API quota exceeded. Please check your Gemini API limits or wait a moment and try again.';
      statusCode = 429;
    } else if (error.message.includes('model') || error.message.includes('not found') || error.response?.status === 404) {
      errorMessage = `Model error: ${error.message}. Please verify your API key has access to Gemini models. Check your key at: https://makersuite.google.com/app/apikey`;
      statusCode = 404;
    } else {
      errorMessage = `Error: ${error.message}. Please check your API key and try again.`;
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Smart rule-based recommendation (works without AI)
function getSmartRecommendation(coffeeItems, mood, timeOfDay, energyLevel) {
  if (!coffeeItems || coffeeItems.length === 0) {
    return null;
  }

  // Scoring system for recommendation
  const scores = coffeeItems.map(item => {
    let score = 0;
    const strength = item.strength?.toLowerCase() || '';
    const description = (item.description || '').toLowerCase();
    const moodLower = mood.toLowerCase();
    const timeLower = timeOfDay.toLowerCase();
    const energyLower = energyLevel.toLowerCase();

    // Mood-based scoring
    if (moodLower.includes('tired') || moodLower.includes('stressed')) {
      if (strength === 'strong' || strength === 'extra strong') score += 3;
      if (description.includes('energ') || description.includes('boost')) score += 2;
    }
    if (moodLower.includes('relaxed') || moodLower.includes('happy')) {
      if (strength === 'mild' || strength === 'medium') score += 3;
    }
    if (moodLower.includes('focused') || moodLower.includes('creative')) {
      if (strength === 'medium' || strength === 'strong') score += 2;
    }
    if (moodLower.includes('energetic')) {
      if (strength === 'strong') score += 2;
    }

    // Time-based scoring
    if (timeLower.includes('morning') || timeLower.includes('early')) {
      if (strength === 'strong' || strength === 'extra strong') score += 2;
    }
    if (timeLower.includes('afternoon')) {
      if (strength === 'medium') score += 2;
    }
    if (timeLower.includes('evening') || timeLower.includes('night')) {
      if (strength === 'mild' || strength === 'medium') score += 2;
      if (description.includes('decaf') || description.includes('relax')) score += 1;
    }

    // Energy level scoring
    if (energyLower.includes('low') || energyLower.includes('need')) {
      if (strength === 'strong' || strength === 'extra strong') score += 3;
    }
    if (energyLower.includes('moderate')) {
      if (strength === 'medium') score += 2;
    }
    if (energyLower.includes('high') || energyLower.includes('already')) {
      if (strength === 'mild') score += 2;
    }

    // Bestseller boost
    if (item.isBestseller) score += 1;

    return { item, score };
  });

  // Sort by score and pick the highest
  scores.sort((a, b) => b.score - a.score);
  const bestMatch = scores[0].item;
  
  // Generate explanation
  let explanation = `Based on your ${mood.toLowerCase()} mood, ${timeOfDay.toLowerCase()}, and ${energyLevel.toLowerCase()} energy level, we recommend ${bestMatch.name}. `;
  explanation += bestMatch.description + ' ';
  explanation += `This ${bestMatch.strength} Robusta brew will perfectly match your current needs.`;

  return {
    itemName: bestMatch.name,
    recommendation: bestMatch.name,
    strength: bestMatch.strength,
    price: bestMatch.price,
    description: bestMatch.description,
    flavorNotes: bestMatch.flavorNotes || [],
    image: bestMatch.image || bestMatch.cloudinary_url || '',
    isBestseller: bestMatch.isBestseller,
    explanation: explanation
  };
}

// Fallback responses for common queries
const getFallbackResponse = async (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
    return "We're open Monday to Sunday, 9:30 AM to 11:00 PM. Come visit us for a bold Robusta experience!";
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
    return "We're located at: RABUSTE, Dimpal Row House, 15, Gymkhana Rd, Piplod, Surat, Gujarat 395007. You can find us on Google Maps or visit our website for directions. We'd love to welcome you!";
  }

  if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('reach')) {
    return "You can reach us through our Instagram @rabuste.coffee or visit our franchise page to submit an enquiry. We're located at: RABUSTE, Dimpal Row House, 15, Gymkhana Rd, Piplod, Surat, Gujarat 395007.";
  }

  if (lowerMessage.includes('instagram') || lowerMessage.includes('social') || lowerMessage.includes('follow')) {
    return "Follow us on Instagram @rabuste.coffee for updates, events, and special offers!";
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

  // Activity suggestions
  if (lowerMessage.includes('what can i do') || lowerMessage.includes('what should i') || 
      lowerMessage.includes('suggestions') || lowerMessage.includes('what do you recommend') ||
      lowerMessage.includes('things to do') || lowerMessage.includes('what to try')) {
    try {
      const menuItems = await Coffee.find().sort({ order: 1 });
      const artPieces = await Art.find({ availability: 'Available' }).limit(5);
      const workshops = await Workshop.find({ isActive: true }).limit(3);
      
      let suggestions = "Here are some great things you can do at Rabuste Coffee:\n\n";
      
      if (menuItems.filter(item => item.category === 'Coffee').length > 0) {
        suggestions += "1. ☕ Explore our coffee menu and discover your perfect Robusta brew\n";
      }
      if (artPieces.length > 0) {
        suggestions += `2. 🎨 Visit our art gallery to see ${artPieces.length} featured artworks\n`;
      }
      if (workshops.length > 0) {
        suggestions += `3. 📚 Join one of our ${workshops.length} upcoming workshops\n`;
      }
      suggestions += "4. 🌟 Learn about why we exclusively serve Robusta coffee\n";
      suggestions += "5. 💼 Explore franchise opportunities\n\n";
      suggestions += "What would you like to explore?";
      
      return suggestions;
    } catch (error) {
      return "You can explore our coffee menu, visit the art gallery, join workshops, learn about Robusta coffee, or check out franchise opportunities. What interests you most?";
    }
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

    // Enhanced navigation detection - more flexible patterns
    const navigationPatterns = {
      'art': { path: '/art', name: 'Art Gallery', keywords: ['art', 'gallery', 'artwork', 'paintings', 'art pieces'] },
      'coffee': { path: '/coffee', name: 'Coffee Menu', keywords: ['coffee', 'menu', 'drink', 'brew', 'order coffee'] },
      'workshops': { path: '/workshops', name: 'Workshops', keywords: ['workshop', 'class', 'event', 'session', 'learn'] },
      'franchise': { path: '/franchise', name: 'Franchise', keywords: ['franchise', 'business opportunity', 'partner', 'open store'] },
      'about': { path: '/about', name: 'About Us', keywords: ['about', 'story', 'who we are', 'our story'] },
      'why-robusta': { path: '/why-robusta', name: 'Why Robusta', keywords: ['why robusta', 'robusta', 'why we use', 'what is robusta'] },
      'home': { path: '/', name: 'Home', keywords: ['home', 'main page', 'start'] },
    };

    // Check for direct navigation requests (flexible matching)
    for (const [key, info] of Object.entries(navigationPatterns)) {
      for (const keyword of info.keywords) {
        if (lowerMessage.includes(keyword)) {
          // Check for navigation intent
          const hasNavIntent = lowerMessage.includes('take me') || 
                               lowerMessage.includes('go to') || 
                               lowerMessage.includes('show me') ||
                               lowerMessage.includes('open') ||
                               lowerMessage.includes('navigate') ||
                               lowerMessage.includes('redirect') ||
                               lowerMessage.includes('visit') ||
                               lowerMessage.includes('see') ||
                               lowerMessage.includes('view') ||
                               lowerMessage.includes('check');
          
          // Also trigger navigation for direct questions about these topics
          const isDirectQuestion = lowerMessage.match(/^(what|where|how|when|tell me about|i want to|i need)/);
          
          if (hasNavIntent || isDirectQuestion) {
            return res.json({
              response: `I'll take you to our ${info.name} page! 🚀`,
              navigateTo: info.path,
              isRelevant: true
            });
          }
        }
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
      // Enhanced fallback response with comprehensive site information
      const coffeeList = menuItems.filter(item => item.category === 'Coffee').slice(0, 5).map(item => `- ${item.name} (${item.strength}, ₹${item.price})`).join('\n');
      const otherItemsList = menuItems.filter(item => item.category !== 'Coffee').slice(0, 3).map(item => `- ${item.name} (${item.category}, ₹${item.price})`).join('\n');
      
      let response = `Welcome to Rabuste Coffee! We're a specialty café serving EXCLUSIVELY Robusta coffee.\n\n`;
      
      // Check what user is asking about
      if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
        response += `📍 We're located at: RABUSTE, Dimpal Row House, 15, Gymkhana Rd, Piplod, Surat, Gujarat 395007\n`;
        response += `🕐 Opening Hours: Monday to Sunday, 9:30 AM to 11:00 PM\n`;
        response += `📸 Follow us on Instagram: @rabuste.coffee\n`;
      } else if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
        response += `🕐 Opening Hours: Monday to Sunday, 9:30 AM to 11:00 PM\n`;
      } else if (lowerMessage.includes('contact') || lowerMessage.includes('reach')) {
        response += `📸 Instagram: @rabuste.coffee\n`;
        response += `📍 Address: RABUSTE, Dimpal Row House, 15, Gymkhana Rd, Piplod, Surat, Gujarat 395007\n`;
        response += `💼 For business enquiries, visit our Franchise page\n`;
      } else {
        response += `☕ Our Coffee Menu:\n${coffeeList}\n`;
        if (otherItemsList) {
          response += `\n🍽️ Other Items:\n${otherItemsList}\n`;
        }
        response += `\n📍 Location: RABUSTE, Dimpal Row House, 15, Gymkhana Rd, Piplod, Surat, Gujarat 395007\n`;
        response += `🕐 Hours: Monday to Sunday, 9:30 AM to 11:00 PM\n`;
        response += `📸 Instagram: @rabuste.coffee\n`;
        response += `\nVisit our Coffee Menu page to see all items with descriptions!`;
      }
      
      return res.json({ 
        response: response,
        isRelevant: true
      });
    }

    // Get working Gemini model with fallback
    const { model, modelName } = await getWorkingModel();

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

    // Format available activities for suggestions
    const availableActivities = [];
    if (coffeeItems.length > 0) {
      availableActivities.push('Browse our coffee menu and discover your perfect Robusta brew');
    }
    if (artPieces.length > 0) {
      availableActivities.push(`Explore our art gallery with ${artPieces.length} featured artworks`);
    }
    if (workshops.length > 0) {
      availableActivities.push(`Join one of our ${workshops.length} upcoming workshops`);
    }
    availableActivities.push('Learn about why we exclusively serve Robusta coffee');
    availableActivities.push('Explore franchise opportunities');

    const systemPrompt = `You are a friendly and knowledgeable assistant for Rabuste Coffee, a specialty café that serves ONLY Robusta coffee. You act as a MIDDLEWARE between users and information - you ONLY provide information that is available on the Rabuste Coffee website. NEVER make up or infer information that is not explicitly provided below.

=== RABUSTE COFFEE WEBSITE INFORMATION ===

CONTACT & LOCATION:
- Address: RABUSTE, Dimpal Row House, 15, Gymkhana Rd, Piplod, Surat, Gujarat 395007
- Opening Hours: Monday to Sunday, 9:30 AM to 11:00 PM
- Instagram: @rabuste.coffee (follow us for updates and events)
- Contact: Users can submit enquiries through the Franchise page

CAFÉ IDENTITY:
- We serve EXCLUSIVELY Robusta coffee (not Arabica)
- Robusta coffee is known for: bold, full-bodied flavor, higher caffeine content, stronger and more intense taste, earthy and nutty notes
- Our mission: Celebrate Robusta coffee as a premium choice, showcase its bold character and authentic strength

OUR VALUES (from About page):
1. Grab-and-Go Excellence: Premium coffee without long waits, barista-quality coffee in minutes
2. Cozy & Bold: Warm and inviting space that contrasts with bold coffee, modern minimalism meets cozy warmth
3. Community First: Building a community of bold thinkers, creative souls, and coffee enthusiasts
4. Art & Culture: Integrating fine art into café experience, rotating exhibitions, cultural hub

OUR STORY (brief timeline):
- 2020: The Vision - Celebrating Robusta coffee's untapped potential
- 2021: The Mission - Focusing exclusively on Robusta's unmatched potential
- 2022: The Selection - Sourcing finest Robusta beans from sustainable farms in Africa and Asia
- 2023: The Craft - Mastering Robusta brewing techniques
- 2024: The Community - Building a community of coffee enthusiasts who appreciate strength and authenticity

CURRENT MENU ITEMS (ONLY SUGGEST FROM THIS EXACT LIST - DO NOT INVENT ITEMS):

COFFEE ITEMS (All are Robusta coffee):
${coffeeItems.map(item => `- ${item.name}: ${item.description} (Strength: ${item.strength}, Price: ₹${item.price}${item.flavorNotes.length > 0 ? `, Notes: ${item.flavorNotes.join(', ')}` : ''}${item.isBestseller ? ', ⭐ BESTSELLER' : ''})`).join('\n')}

OTHER ITEMS (Sides, Pizza, etc.):
${otherItems.map(item => `- ${item.name} (${item.category}): ${item.description} (Price: ₹${item.price})`).join('\n')}

ART GALLERY:
${artPieces.length > 0 ? artPieces.map(art => `- "${art.title}" by ${art.artistName}: ${art.description}${art.price ? ` (Price: ₹${art.price})` : ''}${art.availability === 'Available' ? ' - Available' : ''}`).join('\n') : 'Currently no art pieces listed.'}

WORKSHOPS:
${workshops.length > 0 ? workshops.map(w => `- "${w.title}" (${w.type}): ${w.description}. Date: ${new Date(w.date).toLocaleDateString()}, Price: ₹${w.price}`).join('\n') : 'Currently no workshops scheduled.'}

AVAILABLE ACTIVITIES:
${availableActivities.map((activity, idx) => `${idx + 1}. ${activity}`).join('\n')}

AVAILABLE PAGES TO VISIT:
- Home (/) - Main page with café overview
- About Us (/about) - Our story, values, and mission
- Why Robusta (/why-robusta) - Learn about Robusta coffee benefits
- Coffee Menu (/coffee) - Full menu with descriptions and prices
- Art Gallery (/art) - Browse featured artworks
- Workshops (/workshops) - View and register for workshops
- Franchise (/franchise) - Franchise opportunities and enquiry form

=== CRITICAL FILTERING RULES (YOU ARE A MIDDLEWARE - ENFORCE THESE STRICTLY) ===

1. INFORMATION FILTERING:
   - ONLY use information provided above. NEVER invent, guess, or infer information not explicitly stated.
   - If information is not available above, say: "I don't have that information available on our website. Would you like to [suggest relevant page or alternative]?"
   - DO NOT provide external knowledge about coffee, locations, or general information unless it matches what's on the site.

2. MENU SUGGESTIONS:
   - ONLY suggest items from the menu list above. NEVER suggest items not in this list.
   - When suggesting coffee, mention it's Robusta coffee and highlight its bold, full-bodied nature.
   - For pairing suggestions, suggest coffee items WITH compatible other items from the menu.

3. COFFEE RECOMMENDATIONS:
   - For vague queries like "what do you recommend" or "what's good", suggest 2-3 items from the menu with brief reasons.
   - Base recommendations on: strength preference, time of day, flavor notes, price range.

4. ACTIVITY SUGGESTIONS:
   - If user asks "what can I do", "suggestions", "what should I try", "things to do":
     - Suggest 2-3 activities from AVAILABLE ACTIVITIES
     - Include specific items/workshops/art if available
     - Format: "Here are some great things: 1) [activity], 2) [activity], 3) [activity]"

5. NAVIGATION:
   - For navigation requests ("take me to", "show me", "visit", "go to"), include "NAVIGATE:/page-path" at the end.
   - Example: "I'll take you to our Art Gallery! NAVIGATE:/art"

6. INFORMATION QUERIES:
   - Address/Location: Use the exact address provided above
   - Hours: Use "Monday to Sunday, 9:30 AM to 11:00 PM"
   - Contact: Mention Instagram @rabuste.coffee and Franchise enquiry form
   - About Robusta: Use information from "CAFÉ IDENTITY" section
   - Our Story/Values: Use information from "OUR VALUES" and "OUR STORY" sections

7. RESPONSE STYLE:
   - Be conversational, warm, and helpful (2-4 sentences max)
   - Stay within website information boundaries
   - If you don't know something, admit it and suggest where they can find it

Conversation history: ${JSON.stringify(conversationHistory.slice(-3))}

User question: ${message}

Provide a helpful response using ONLY the information provided above. If the user wants to visit a page, include "NAVIGATE:/page-path" at the end.`;

    let result, response, text;
    try {
      result = await model.generateContent(systemPrompt);
      response = await result.response;
      text = response.text().trim();
    } catch (modelError) {
      // If gemini-pro fails, just throw the error (no fallback needed)
      throw modelError;
    }

    // Check if response contains navigation instruction
    const navMatch = text.match(/NAVIGATE:(.+?)(\n|$)/);
    let navigateTo = null;
    let responseText = text;

    if (navMatch) {
      navigateTo = navMatch[1].trim();
      // Remove the navigation instruction from the response
      responseText = text.replace(/NAVIGATE:.*?(\n|$)/g, '').trim();
      
      // Validate navigation path
      const validPaths = ['/', '/about', '/why-robusta', '/coffee', '/art', '/workshops', '/franchise'];
      if (!validPaths.includes(navigateTo)) {
        navigateTo = null; // Invalid path, don't navigate
      }
    }

    res.json({
      response: responseText,
      navigateTo: navigateTo,
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
    
    // Provide more helpful error messages based on the actual error
    let errorMessage = 'Error processing message';
    let statusCode = 500;
    
    if (error.message.includes('API key') || error.message.includes('invalid') || error.response?.status === 401) {
      errorMessage = 'Invalid API key. Please check your GOOGLE_GEMINI_API_KEY in the .env file. Get a key at: https://makersuite.google.com/app/apikey';
      statusCode = 401;
    } else if (error.message.includes('quota') || error.message.includes('limit') || error.response?.status === 429) {
      errorMessage = 'API quota exceeded. Please check your Gemini API limits or wait a moment and try again.';
      statusCode = 429;
    } else if (error.message.includes('model') || error.message.includes('not found') || error.response?.status === 404) {
      errorMessage = `Model error: ${error.message}. Please verify your API key has access to Gemini models. Check your key at: https://makersuite.google.com/app/apikey`;
      statusCode = 404;
    } else {
      errorMessage = `Error: ${error.message}. Please check your API key and try again.`;
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Diagnostic endpoint to test API key
router.get('/test', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ 
        success: false,
        message: 'Gemini API is not configured. Please set GOOGLE_GEMINI_API_KEY in environment variables.',
        error: 'API key missing'
      });
    }

    // Use getWorkingModel helper with connection test for diagnostics
    const { model, modelName } = await getWorkingModel(true);
    const result = await model.generateContent('Say "Hello, Gemini is working!" in one sentence.');
    const response = await result.response;
    const text = response.text();
    
    res.json({
      success: true,
      message: 'Gemini API is working correctly!',
      model: modelName,
      testResponse: text,
      apiKeyPresent: !!GEMINI_API_KEY,
      apiKeyPrefix: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'Not set',
      workingModel: modelName
    });
  } catch (error) {
    console.error('API Test Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gemini API test failed',
      error: error.message,
      errorDetails: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      },
      troubleshooting: [
        '1. Verify your API key at: https://makersuite.google.com/app/apikey',
        '2. Ensure the key starts with "AIza"',
        '3. Check if billing is enabled for your Google Cloud project',
        '4. Try creating a new API key if the current one is blocked',
        '5. Verify the key is correctly set in server/.env file as GOOGLE_GEMINI_API_KEY=your_key_here',
        '6. Models tried: gemini-1.5-flash, gemini-1.5-pro, gemini-pro'
      ]
    });
  }
});

module.exports = router;

