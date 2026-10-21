/**
 * Practical 13: AI Service Integration
 * Connects securely to external AI APIs (OpenAI / Gemini) with
 * rate-limiting and graceful degradation fallback handling.
 */

let OpenAI = null;
try {
  OpenAI = require("openai");
} catch (e) {
  // handled gracefully
}

// Simple in-memory rate-limiting store (Supplementary Problem: Max 5 AI requests per minute)
const requestTimestamps = [];
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

const checkRateLimit = () => {
  const now = Date.now();
  // Filter out timestamps older than 60s
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const waitTime = Math.ceil((requestTimestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, waitSeconds: waitTime };
  }

  requestTimestamps.push(now);
  return { allowed: true };
};

/**
 * Intelligent Fallback Description Generator
 * Guarantees graceful degradation if API key is not configured or third-party service fails
 */
const generateContextualFallback = (title) => {
  const lower = title.toLowerCase();

  if (lower.includes("bug") || lower.includes("fix") || lower.includes("error")) {
    return `Investigate and resolve: "${title}". Debug root cause, write a regression test, verify fix in local environment, and commit changes with a descriptive summary.`;
  }
  if (lower.includes("test") || lower.includes("ci") || lower.includes("pipeline")) {
    return `Implement automated test coverage for: "${title}". Validate all assertions, check edge cases, and ensure CI pipeline passes with green status.`;
  }
  if (lower.includes("api") || lower.includes("backend") || lower.includes("endpoint")) {
    return `Develop and optimize REST endpoint for: "${title}". Ensure proper input validation, HTTP status codes, error handling, and in-memory cache invalidation.`;
  }
  if (lower.includes("ui") || lower.includes("frontend") || lower.includes("component") || lower.includes("react")) {
    return `Design and compose reusable React components for: "${title}". Implement responsive styling, reactive state management, and verify accessibility.`;
  }

  return `Work on: "${title}". Break down into actionable milestones, implement required logic, test thoroughly, and document completed deliverables.`;
};

/**
 * Main AI Description Generator
 * Supports OpenAI, Gemini, and graceful fallback
 */
const generateTaskDescription = async (title) => {
  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit();
  if (!rateLimit.allowed) {
    return {
      description: generateContextualFallback(title),
      source: "fallback",
      fallback: true,
      rateLimited: true,
      message: `Rate limit reached. Please wait ${rateLimit.waitSeconds}s before requesting again. (Fallback suggestion provided)`,
      disclaimer: "AI-generated suggestion. Please review and edit before saving.",
    };
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 2. Try OpenAI API if key is present
  if (openAiKey && openAiKey !== "your_openai_api_key_here" && OpenAI) {
    try {
      const client = new OpenAI({ apiKey: openAiKey });
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant helping a software engineer write concise, professional 1-2 sentence descriptions for developer tasks.",
          },
          {
            role: "user",
            content: `Write a concise 1-2 sentence description for this task title: "${title}"`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      const description = completion.choices[0]?.message?.content?.trim();
      if (description) {
        return {
          description,
          source: "openai",
          fallback: false,
          disclaimer: "AI-generated suggestion via OpenAI. Please review and edit before saving.",
        };
      }
    } catch (err) {
      console.warn("[AI Service] OpenAI API error:", err.message);
      // Fall through to Gemini or Contextual Fallback
    }
  }

  // 3. Try Google Gemini API if key is present
  if (geminiKey && geminiKey !== "your_gemini_api_key_here") {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Write a concise 1-2 sentence task description for: "${title}". Respond with only the description text.`,
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return {
            description: text,
            source: "gemini",
            fallback: false,
            disclaimer: "AI-generated suggestion via Google Gemini. Please review and edit before saving.",
          };
        }
      }
    } catch (err) {
      console.warn("[AI Service] Gemini API error:", err.message);
    }
  }

  // 4. Graceful Degradation Fallback (Guaranteed to succeed)
  return {
    description: generateContextualFallback(title),
    source: "fallback",
    fallback: true,
    message: "Using graceful fallback heuristic (AI API key not configured or unavailable).",
    disclaimer: "Contextual suggestion provided via graceful fallback. Please review and edit before saving.",
  };
};

module.exports = {
  generateTaskDescription,
  checkRateLimit,
};
