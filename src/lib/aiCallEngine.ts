// AI Health Call Engine - Phase 2: Data-aware responses
// Uses existing demo data for medicine, hospital, and diagnostics lookups

import {
  demoMedicines,
  searchMedicines,
  getMedicineAvailability,
  calculateDistance as calcMedDist,
} from "@/data/medicines";

import {
  demoHospitals,
  calculateDistance as calcHospDist,
} from "@/data/hospitals";

import {
  demoDiagnosticTests,
  searchDiagnosticTests,
  getTestAvailability,
} from "@/data/diagnostics";

export type ConversationContext = {
  awaitingMedicineName: boolean;
  pendingTopic: string | null;
  lastTopic: string | null;
};

export type ConversationIntent = {
  intent: "greet" | "medicine" | "hospital" | "diagnostic" | "insurance" | "help" | "unknown";
  extractedValue?: string;
  confidence: number;
};

// Default user location (Bhagalpur)
const DEFAULT_LAT = 25.2445;
const DEFAULT_LNG = 86.9718;

// Normalize text for matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:।"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Detect greeting
function isGreeting(text: string): boolean {
  const normalized = normalizeText(text);
  const greetings = [
    "hello", "hi", "hey", "namaste", "namaskar", "namaskaram",
    "good morning", "good evening", "good afternoon",
    "hola", "bonjour", "konnichiwa", "नमस्ते", "नमस्कार"
  ];
  return greetings.some(g => normalized === g || normalized.includes(g));
}

// Extract medicine name from query
export function extractMedicineName(text: string): string | null {
  const normalized = normalizeText(text);
  
  // Check for medicine-related keywords
  const medicineKeywords = [
    "medicine", "medicines", "drug", "tablet", "capsule",
    "दवाई", "दवाइयाँ", "दवाओं", "दवा", "medicine", "medicines"
  ];
  
  const hasKeyword = medicineKeywords.some(k => normalized.includes(k));
  
  // Try to extract a medicine name from the text
  const words = normalized.split(" ");
  
  // Remove medicine keywords and find the remaining medicine name
  const filteredWords = words.filter(w => !medicineKeywords.some(k => w.includes(k)));
  
  if (filteredWords.length > 0) {
    // Check if any known medicine matches
    const knownMeds = demoMedicines.map(m => m.name.toLowerCase());
    for (const word of filteredWords) {
      for (const med of knownMeds) {
        if (med.includes(word) || word.includes(med.split(" ")[0])) {
          return demoMedicines.find(m => m.name.toLowerCase() === med)?.name || null;
        }
      }
    }
    // Return first significant word as potential medicine name
    return filteredWords[0] ? filteredWords.join(" ") : null;
  }
  
  // If just a medicine keyword without name, flag for more info
  if (hasKeyword) {
    return "";
  }
  
  return null;
}

// Extract test name from query
export function extractTestName(text: string): string | null {
  const normalized = normalizeText(text);
  
  const testKeywords = [
    "test", "cbc", "blood test", "xray", "x-ray", "mri", "ct scan", "ecg",
    "ultrasound", "मुझे", "चाहिए", "कराना", "test"
  ];
  
  // Search in demo tests
  const tests = searchDiagnosticTests(normalized);
  if (tests.length > 0) {
    return tests[0].name;
  }
  
  // Check for test-related keywords
  const hasKeyword = testKeywords.some(k => normalized.includes(k));
  if (hasKeyword) {
    // Extract significant words
    const words = normalized.split(" ").filter(w => w.length > 3);
    if (words.length > 0) {
      return words.join(" ");
    }
  }
  
  return null;
}

// Detect intent from user input
export function detectIntent(text: string, context: ConversationContext): ConversationIntent {
  const normalized = normalizeText(text);
  
  // Check greeting
  if (isGreeting(normalized)) {
    return { intent: "greet", confidence: 1.0 };
  }
  
  // If awaiting medicine name
  if (context.awaitingMedicineName) {
    const medicineName = extractMedicineName(text);
    if (medicineName !== null) {
      return { intent: "medicine", extractedValue: medicineName, confidence: 0.9 };
    }
  }
  
  // Medicine patterns
  const medicinePatterns = [
    /medicine/i, /medicines/i, /paracetamol/i, /metformin/i, /insulin/i,
    /amoxicillin/i, /omeprazole/i, /cetirizine/i, /azithromycin/i, /diclofenac/i,
    /salbutamol/i, /ranitidine/i, /metronidazole/i, /ibuprofen/i, /lisinopril/i,
    /vitamin/i, /ors/i, /drug/i, /pharmacy/i,
    /दवाई/i, /दवाइयाँ/i, /दवाओं/i, /दवा/i, /गोली/i
  ];
  
  for (const pattern of medicinePatterns) {
    if (pattern.test(normalized)) {
      const extracted = extractMedicineName(text);
      return {
        intent: "medicine",
        extractedValue: extracted || undefined,
        confidence: 0.85
      };
    }
  }
  
  // Hospital patterns
  const hospitalPatterns = [
    /hospital/i, /hospitals/i, /clinic/i, /doctor/i, /physician/i,
    /अस्पताल/i, /हॉस्पिटल/i, /clinic/i, /डॉक्टर/i, /doctor/i
  ];
  
  for (const pattern of hospitalPatterns) {
    if (pattern.test(normalized)) {
      return { intent: "hospital", confidence: 0.85 };
    }
  }
  
  // Diagnostic patterns
  const diagnosticPatterns = [
    /test/i, /cbc/i, /blood/i, /xray/i, /x-ray/i, /mri/i, /ct scan/i,
    /ecg/i, /ultrasound/i, /scan/i, /diagnostic/i, /lab/i,
    /जांच/i, /टेस्ट/i, /एमआरआई/i, /सीटी/i, /इसीजी/i
  ];
  
  for (const pattern of diagnosticPatterns) {
    if (pattern.test(normalized)) {
      const extracted = extractTestName(text);
      return {
        intent: "diagnostic",
        extractedValue: extracted || undefined,
        confidence: 0.8
      };
    }
  }
  
  // Insurance patterns
  const insurancePatterns = [
    /insurance/i, /pmjay/i, /ayushman/i, /bima/i, /policy/i, /coverage/i,
    /बीमा/i, /इंश्योरेंस/i, /पीएमजय/i, /आयुष्मान/i
  ];
  
  for (const pattern of insurancePatterns) {
    if (pattern.test(normalized)) {
      return { intent: "insurance", confidence: 0.85 };
    }
  }
  
  // Help patterns
  const helpPatterns = [
    /help/i, /what can you do/i, /capabilities/i, /features/i,
    /मदद/i, /help/i, /क्या कर सकते हो/i, /कमांड/i
  ];
  
  for (const pattern of helpPatterns) {
    if (pattern.test(normalized)) {
      return { intent: "help", confidence: 0.9 };
    }
  }
  
  return { intent: "unknown", confidence: 0.3 };
}

// Get medicine availability response
export function getMedicineResponse(medicineName: string | undefined, lang: string): string {
  if (!medicineName || medicineName === "") {
    // Ask for medicine name
    return lang === "hi"
      ? "कृपया दवाई का नाम बताएं जिसकी आपको जानकारी चाहिए।"
      : "Please tell me the name of the medicine you are looking for.";
  }
  
  // Search for the medicine
  const searchResults = searchMedicines(medicineName);
  
  if (searchResults.length === 0) {
    return lang === "hi"
      ? `मुझे "${medicineName}" नाम की दवाई नहीं मिली। कृपया दूसरा नाम बताएं।`
      : `I could not find a medicine named "${medicineName}". Please try another name.`;
  }
  
  const medicine = searchResults[0];
  const availability = getMedicineAvailability(medicine.id, DEFAULT_LAT, DEFAULT_LNG);
  
  // Check if any facility has it
  const availableFacilities = availability.filter(a => a.status === "available");
  
  if (availableFacilities.length === 0) {
    return lang === "hi"
      ? `${medicine.name} मिलती है, लेकिन यह फिलहाल उपलब्ध नहीं है।`
      : `${medicine.name} is available, but currently not in stock at the listed facilities.`;
  }
  
  const nearest = availableFacilities[0];
  const distanceText = nearest.distance
    ? lang === "hi"
      ? `यह लगभग ${Math.round(nearest.distance)} किलोमीटर दूर है।`
      : `It is approximately ${Math.round(nearest.distance)} km away.`
    : "";
  
  return lang === "hi"
    ? `${medicine.name} ${nearest.facility.name} में उपलब्ध है। ${distanceText} इसके अलावा ${availableFacilities.length - 1} और स्थानों पर भी उपलब्ध है।`
    : `${medicine.name} is available at ${nearest.facility.name}. ${distanceText} It is also available at ${availableFacilities.length - 1} other location(s).`;
}

// Get hospital response
export function getHospitalResponse(lang: string): string {
  const nearest = demoHospitals
    .map(h => ({ ...h, distance: calcHospDist(DEFAULT_LAT, DEFAULT_LNG, h.latitude, h.longitude) }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))[0];
  
  const departments = nearest.departments.filter(d => d.available).map(d => d.name).slice(0, 4).join(", ");
  
  return lang === "hi"
    ? `सबसे नजदीकी अस्पताल है ${nearest.name}, ${nearest.locality}। यह ${nearest.type} अस्पताल है और ${nearest.emergencyAvailable ? "आपातकालीन सेवा उपलब्ध है" : "आपातकालीन सेवा उपलब्ध नहीं है"}। इसमें ${departments} जैसी सेवाएं उपलब्ध हैं।`
    : `The nearest hospital is ${nearest.name} in ${nearest.locality}. It is a ${nearest.type} hospital with ${nearest.emergencyAvailable ? "emergency services available" : "no emergency services"}. Services include ${departments}.`;
}

// Get diagnostic response
export function getDiagnosticResponse(testName: string | undefined, lang: string): string {
  if (!testName) {
    return lang === "hi"
      ? "कृपया बताएं आपको कौन सी जांच करवानी है?"
      : "Please tell me which test you need to get done.";
  }
  
  const searchResults = searchDiagnosticTests(testName);
  
  if (searchResults.length === 0) {
    return lang === "hi"
      ? `मुझे "${testName}" नाम की जांच नहीं मिली।`
      : `I could not find a test named "${testName}".`;
  }
  
  const test = searchResults[0];
  const availability = getTestAvailability(test.id, DEFAULT_LAT, DEFAULT_LNG);
  
  const availableFacilities = availability.filter(a => a.status === "available");
  
  if (availableFacilities.length === 0) {
    return lang === "hi"
      ? `${test.name} उपलब्ध है, लेकिन फिलहाल किसी सुविधा पर उपलब्ध नहीं है।`
      : `${test.name} is available, but currently not available at any facility.`;
  }
  
  const nearest = availableFacilities[0];
  const priceText = nearest.approximatePrice
    ? lang === "hi"
      ? `अनुमानित कीमत लगभग ${nearest.approximatePrice} रुपये है।`
      : `The approximate price is around ${nearest.approximatePrice} rupees.`
    : "";
  
  return lang === "hi"
    ? `${test.name} ${nearest.facility.name} में उपलब्ध है। ${priceText}`
    : `${test.name} is available at ${nearest.facility.name}. ${priceText}`;
}

// Get insurance response
export function getInsuranceResponse(lang: string): string {
  return lang === "hi"
    ? "इस एप्लिकेशन में आप PM-JAY (प्रधानमंत्री जन आरोग्य भारत) बीमा योजना की जानकारी देख सकते हैं। आप बीमा सेक्शन में जाकर अपनी पात्रता जांच सकते हैं और कवर की गई सेवाओं की जानकारी प्राप्त कर सकते हैं।"
    : "In this application, you can view information about PM-JAY (Pradhan Mantri Jan Arogya Bharat) insurance scheme. You can visit the Insurance section to check your eligibility and view covered services.";
}

// Get help response
export function getHelpResponse(lang: string): string {
  return lang === "hi"
    ? "मैं आपकी इन क्षेत्रों में मदद कर सकता हूं: दवाइयों की उपलब्धता, अस्पतालों की जानकारी, जांच की जानकारी, बीमा, और स्वास्थ्य रिकॉर्ड। बस पूछें!"
    : "I can help you with: Medicine availability, Hospital information, Diagnostic tests, Insurance, and Health Records. Just ask!";
}

// Get unknown response
export function getUnknownResponse(lang: string): string {
  return lang === "hi"
    ? "मुझे आपका प्रश्न समझ नहीं आया। आप मुझसे दवाइयों, अस्पतालों, जांच, या बीमा के बारे में पूछ सकते हैं।"
    : "I did not understand your question. You can ask me about medicines, hospitals, diagnostics, or insurance.";
}

// Main response generator
export function generateResponse(
  userInput: string,
  context: ConversationContext,
  lang: string
): { response: string; newContext: ConversationContext } {
  const intent = detectIntent(userInput, context);
  
  let response = "";
  let newContext: ConversationContext = { ...context };
  
  switch (intent.intent) {
    case "greet":
      response = lang === "hi"
        ? "नमस्ते! मैं आपका आरोग्य एआई सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?"
        : "Hello! I am your Arogya AI health assistant. How can I help you today?";
      newContext = { awaitingMedicineName: false, pendingTopic: null, lastTopic: null };
      break;
      
    case "medicine":
      response = getMedicineResponse(intent.extractedValue, lang);
      newContext = {
        awaitingMedicineName: !intent.extractedValue || intent.extractedValue === "",
        pendingTopic: null,
        lastTopic: "medicine"
      };
      break;
      
    case "hospital":
      response = getHospitalResponse(lang);
      newContext = { awaitingMedicineName: false, pendingTopic: null, lastTopic: "hospital" };
      break;
      
    case "diagnostic":
      response = getDiagnosticResponse(intent.extractedValue, lang);
      newContext = { awaitingMedicineName: false, pendingTopic: null, lastTopic: "diagnostic" };
      break;
      
    case "insurance":
      response = getInsuranceResponse(lang);
      newContext = { awaitingMedicineName: false, pendingTopic: null, lastTopic: "insurance" };
      break;
      
    case "help":
      response = getHelpResponse(lang);
      newContext = { awaitingMedicineName: false, pendingTopic: null, lastTopic: null };
      break;
      
    case "unknown":
    default:
      response = getUnknownResponse(lang);
      newContext = { awaitingMedicineName: false, pendingTopic: null, lastTopic: context.lastTopic };
      break;
  }
  
  return { response, newContext };
}

// Get greeting based on language
export function getGreeting(lang: string): string {
  return lang === "hi"
    ? "नमस्ते! मैं आपका आरोग्य एआई सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?"
    : "Hello! I am your Arogya AI health assistant. How can I help you today?";
}
