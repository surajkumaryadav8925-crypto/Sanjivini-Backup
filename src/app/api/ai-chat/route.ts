import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/aiCallEngine";

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
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content || "";

    // Helper for intelligent local fallback response
    const getLocalHealthcareFallback = (query: string, lang: string) => {
      const q = query.toLowerCase();
      if (q.includes("emergency") || q.includes("आपातकालीन") || q.includes("ambulance") || q.includes("108")) {
        return lang === "hi"
          ? "यदि यह आपातकालीन स्थिति है, तो कृपया तुरंत 108 नंबर पर डायल करें या ऐप के 'आपातकालीन' (Emergency) अनुभाग में जाकर नजदीकी आईसीयू अस्पताल खोजें।"
          : "If this is an emergency, please dial 108 immediately for free ambulance services or visit the Emergency section for nearby ICU facilities.";
      }
      if (q.includes("blood") || q.includes("रक्त") || q.includes("खून")) {
        return lang === "hi"
          ? "आप संजीवनी के 'रक्त कोष' (Blood Bank) अनुभाग में जाकर वास्तविक समय में रक्त की उपलब्धता देख सकते हैं और यूनिट आरक्षित करने का अनुरोध भेज सकते हैं।"
          : "You can check real-time blood group availability and submit a reservation request directly in the Blood Bank section of Sanjivini.";
      }
      if (q.includes("hospital") || q.includes("अस्पताल") || q.includes("doctor") || q.includes("डॉक्टर") || q.includes("opd")) {
        return lang === "hi"
          ? "बिहार के 7 जिलों के 24 सरकारी अस्पताल संजीवनी से जुड़े हैं। आप 'अस्पताल खोजें' या 'ओपीडी टोकन' अनुभाग में जाकर ऑनलाइन पर्ची बुक कर सकते हैं।"
          : "24 government healthcare facilities across 7 Bihar districts are connected to Sanjivini. You can locate hospitals and book live OPD queue tokens in the OPD section.";
      }
      if (q.includes("insurance") || q.includes("ayushman") || q.includes("आयुष्मान") || q.includes("pmjay") || q.includes("कार्ड")) {
        return lang === "hi"
          ? "आयुष्मान भारत PM-JAY योजना के तहत प्रति परिवार प्रति वर्ष 5 लाख रुपये तक का मुफ्त इलाज मिलता है। आप 'बीमा' अनुभाग में जाकर अपने आधार या राशन कार्ड से पात्रता जांच सकते हैं।"
          : "Under Ayushman Bharat PM-JAY, eligible families get up to ₹5 Lakh cashless annual health cover. Check your eligibility in the Insurance section using your Aadhaar or Ration Card.";
      }
      if (q.includes("vaccine") || q.includes("टीका") || q.includes("maternal") || q.includes("गर्भवती") || q.includes("anc")) {
        return lang === "hi"
          ? "संजीवनी के 'परिवार स्वास्थ्य' अनुभाग में मातृ देखभाल (ANC 1-4 चेकअप) और बच्चों का संपूर्ण टीकाकरण (UIP शेड्यूल) उपलब्ध है।"
          : "In the Family Health section, you can track maternal ANC checkups, IFA tablets, and the universal child immunization schedule (birth to 5 years).";
      }

      // Default contextual response from aiCallEngine
      const result = generateResponse(query, { awaitingMedicineName: false, pendingTopic: null, lastTopic: null }, lang);
      return result.response;
    };

    if (!apiKey || apiKey === "your-openrouter-api-key-here" || apiKey.trim() === "") {
      const fallbackResponse = getLocalHealthcareFallback(lastUserMessage, language || "en");
      return NextResponse.json({ response: fallbackResponse, source: "sanjivini-local-engine" });
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
        model: "openrouter/free", // Fast and widely available
        messages: openRouterMessages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    console.log("[DEBUG] OpenRouter response status:", response.status);

    if (!response.ok) {
      console.warn("[DEBUG] OpenRouter failed, falling back to local healthcare engine");
      const fallbackResponse = getLocalHealthcareFallback(lastUserMessage, language || "en");
      return NextResponse.json({ response: fallbackResponse, source: "sanjivini-local-engine" });
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      const fallbackResponse = getLocalHealthcareFallback(lastUserMessage, language || "en");
      return NextResponse.json({ response: fallbackResponse, source: "sanjivini-local-engine" });
    }

    const assistantMessage = data.choices[0].message.content;
    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error("[DEBUG] AI chat error, using resilient local fallback:", error);
    try {
      const { messages, language } = await request.clone().json().catch(() => ({ messages: [], language: "en" }));
      const lastUserMessage = [...(messages || [])].reverse().find((m: { role: string; content: string }) => m.role === "user")?.content || "";
      const result = generateResponse(lastUserMessage, { awaitingMedicineName: false, pendingTopic: null, lastTopic: null }, language || "en");
      return NextResponse.json({ response: result.response, source: "sanjivini-local-engine" });
    } catch {
      return NextResponse.json({
        response: "संजीवनी स्वास्थ्य सहायक से संपर्क करने के लिए धन्यवाद। कृपया आपातकालीन सहायता के लिए 108 पर कॉल करें या नजदीकी अस्पताल अनुभाग देखें।",
      });
    }
  }
}
