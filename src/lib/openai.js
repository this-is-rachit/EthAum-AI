import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
});

export async function generateLaunchAssets(context) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a world-class startup copywriter. Return ONLY a valid JSON object with the keys 'tagline' and 'pitch'. Ensure the pitch is 2-3 sentences max."
        },
        {
          role: "user",
          content: `Convert this rough description into high-converting launch assets: ${context}`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("AI failed to generate assets. Check your OpenAI quota/key.");
  }
}

export async function getEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Embedding Error:", error);
    return null;
  }
}