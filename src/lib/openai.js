import OpenAI from "openai";

// Initialize OpenAI Client (Direct Browser Access)
// NOTE: This uses the key from your .env file
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, 
});

// 1. Generate Launch Assets (Tagline, Offer, Description)
export const generateLaunchAssets = async (description, websiteUrl = "") => {
  if (!description) return null;

  const prompt = `
    Analyze this startup based on the description: "${description}" 
    ${websiteUrl ? `and their website URL: ${websiteUrl}` : ""}
    
    You are an expert venture capital analyst. Generate 3 specific assets for a "Product Hunt style" launch page but for B2B Enterprises.
    
    1. A punchy, 5-7 word tagline (cyberpunk/futuristic tone).
    2. A compelling "Deal Offer" for enterprise pilots (e.g. "3-Month PoC @ 50% Off").
    3. An elaborate, professional description (2-3 sentences) suitable for a Series A/B startup investor memo.

    Return JSON format: { "tagline": "...", "offer": "...", "elaborated_description": "..." }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    try {
        return JSON.parse(content);
    } catch (e) {
        return { 
            tagline: "AI Analysis Failed", 
            offer: "Standard Pilot Access",
            elaborated_description: description 
        };
    }
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw error;
  }
};

// 2. Generate Vector Embeddings (For Search)
export const generateEmbedding = async (text) => {
  if (!text) return null;
  
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // Must match the 1536 dimensions in DB
      input: text.replace(/\n/g, ' '),
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Embedding Error:", error);
    return null;
  }
};