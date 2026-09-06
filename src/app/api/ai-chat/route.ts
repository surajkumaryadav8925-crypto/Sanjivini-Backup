import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  language: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, language } = body;

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    // Get API key from environment (server-side only)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your-openrouter-api-key-here" || apiKey.trim() === "") {
      console.error("[DEBUG] API key missing or invalid");
      return NextResponse.json(
        { error: "OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env.local" },
        { status: 503 }
      );
    }

    console.log("[DEBUG] API key found, length:", apiKey.length);

    // Set language for the AI
    const systemPrompt = language === "hi"
      ? `You are Arogya AI, a helpful healthcare assistant for an Indian healthcare application. You help users with:
- Finding medicines and checking their availability
- Locating nearby hospitals and healthcare facilities
- Information about diagnostic tests
- PM-JAY insurance scheme information
- General health inquiries

IMPORTANT RULES:
1. Always respond in Hindi (with some English medical terms where appropriate)
2. Be concise and helpful (2-3 sentences max)
3. Do not provide medical diagnosis or prescriptions
4. Direct users to appropriate sections of the app for detailed information
5. Keep responses friendly and professional
6. If you do not know something, say so honestly`
      : `You are Arogya AI, a helpful healthcare assistant for an Indian healthcare application. You help users with:
- Finding medicines and checking their availability
- Locating nearby hospitals and healthcare facilities
- Information about diagnostic tests
- PM-JAY insurance scheme information
- General health inquiries

IMPORTANT RULES:
1. Always respond in English
2. Be concise and helpful (2-3 sentences max)
3. Do not provide medical diagnosis or prescriptions
4. Direct users to appropriate sections of the app for detailed information
5. Keep responses friendly and professional
6. If you do not know something, say so honestly`;

    // Build messages for OpenRouter
    const openRouterMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter(m => m.role !== "system")
    ];

    console.log("[DEBUG] Sending request to OpenRouter with", openRouterMessages.length, "messages");

    // Use a reliable, fast model - google/gemini-2.0-flash is widely available
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://arogyasetu.health",
        "X-Title": "ArogyaSetu Healthcare App",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku", // Fast and widely available
        messages: openRouterMessages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    console.log("[DEBUG] OpenRouter response status:", response.status);

    if (!response.ok) {
      let errorMessage = "AI service temporarily unavailable. Please try again.";
      try {
        const errorData = await response.json();
        console.error("[DEBUG] OpenRouter error response:", errorData);
        // Extract meaningful error message
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.error) {
          errorMessage = String(errorData.error);
        }
      } catch {
        console.error("[DEBUG] Could not parse error response");
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[DEBUG] OpenRouter data keys:", Object.keys(data));

    // Debug: log the full response structure
    console.log("[DEBUG] Full OpenRouter response:", JSON.stringify(data).substring(0, 1000));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("[DEBUG] Invalid response structure:", JSON.stringify(data).substring(0, 500));
      return NextResponse.json(
        { error: "Invalid response from AI service" },
        { status: 500 }
      );
    }

    const assistantMessage = data.choices[0].message.content;
    console.log("[DEBUG] Generated response length:", assistantMessage.length);

    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error("[DEBUG] AI chat error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
