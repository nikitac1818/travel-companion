// server.js — Travel Companion backend
//
// Provides:
//  - GET  /health          health check
//  - POST /api/llm         structured LLM calls (replaces Base44's InvokeLLM integration)
//  - POST /api/send-email  email sending (replaces Base44's SendEmail integration)
//
// Keep all secrets in .env — never commit .env to source control.

import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app = express();

// In production, restrict this to your actual frontend origin instead of "*".
const allowedOrigin = process.env.FRONTEND_URL || "*";
app.use(cors({ origin: allowedOrigin }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ---------- Health check ----------
app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// ---------- POST /api/llm ----------
// Body: { prompt: string, add_context_from_internet?: bool, response_json_schema?: object }
// If response_json_schema is provided, asks Claude to return ONLY valid JSON
// matching that shape (mirrors the structured-output pattern the original
// Base44 InvokeLLM integration provided).
app.post("/api/llm", async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error: "Server is not configured with GROQ_API_KEY. Set it in your backend .env.",
    });
  }

  try {
    const { prompt, response_json_schema } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing 'prompt' in request body" });

    let systemPrompt =
      "You are a helpful travel assistant embedded in a travel app. Be concise and practical.";
    let finalPrompt = prompt;

    if (response_json_schema) {
      systemPrompt +=
        " You must respond with ONLY valid JSON matching the schema provided by the user. No prose, no markdown code fences, just the raw JSON object.";
      finalPrompt = `${prompt}\n\nRespond with ONLY JSON matching this schema:\n${JSON.stringify(
        response_json_schema
      )}`;
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: finalPrompt },
        ],
        ...(response_json_schema ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error:", groqRes.status, errText);
      return res.status(502).json({ error: "LLM provider error", details: errText });
    }

    const data = await groqRes.json();
    const rawText = data.choices?.[0]?.message?.content || "";

    if (response_json_schema) {
      try {
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ result: parsed });
      } catch (parseError) {
        console.error("Failed to parse LLM JSON response:", rawText);
        return res.status(502).json({ error: "LLM did not return valid JSON", raw: rawText });
      }
    }

    return res.json({ result: rawText });
  } catch (error) {
    console.error("POST /api/llm error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// ---------- POST /api/send-email ----------
// Body: { to: string, subject: string, body: string }
// Currently just logs — plug in a real provider (Resend, SendGrid, etc.) when ready.
app.post("/api/send-email", async (req, res) => {
  const { to, subject, body } = req.body || {};
  if (!to || !subject) {
    return res.status(400).json({ error: "Missing 'to' or 'subject' in request body" });
  }

  console.log(`[email] To: ${to} | Subject: ${subject} | Body: ${body?.slice(0, 200)}`);
  // TODO: wire a real email provider here before relying on this in production.
  res.json({ success: true, note: "Email logged (no provider configured yet)." });
});

// ---------- Fallback 404 ----------
app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`Travel Companion backend listening on http://localhost:${PORT}`);
  if (!GROQ_API_KEY) {
    console.warn("⚠️  GROQ_API_KEY not set — /api/llm will fail until you add it to .env");
  }
});
