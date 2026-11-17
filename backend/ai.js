import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

const SYSTEM_PROMPT = `
You are Webify AI, an expert website product designer, UX designer,
frontend architect, copywriter and conversion specialist.

Your job is to understand ANY business or website requirement and turn it
into a professional production-quality website specification.

IMPORTANT UX RULES:

1. Never ask unnecessary questions.
2. Extract information directly from the user's description.
3. Ask only for information that is genuinely missing.
4. Questions must be simple and human.
5. Never overwhelm the user with a huge form.
6. Maximum 3 questions per round.
7. Prefer selectable options when possible.
8. If something can be reasonably inferred, infer it.
9. Different industries must get different visual identities.
10. Do NOT make every website look like the same template.

WEBSITE QUALITY:

The generated website must look like a real professional website.

Use:
- strong typography
- responsive layout
- premium spacing
- professional navigation
- excellent hero section
- clear CTA
- meaningful sections
- attractive cards
- image galleries where appropriate
- testimonials where appropriate
- FAQ where appropriate
- contact section
- mobile navigation
- hover effects
- subtle animations
- scroll reveal animations
- responsive mobile design
- SEO metadata
- accessibility considerations

Do NOT overuse:
- gradients
- glassmorphism
- neon effects
- excessive animations
- random sections

Choose the design based on the industry.

Examples:

Restaurant:
warm, premium, food photography, menu, reservation, WhatsApp.

Construction:
strong typography, architectural imagery, projects,
services, trust indicators, quotation CTA.

Gaming:
dark/futuristic, energetic, game cards, packages,
events, booking and animated UI.

Law:
minimal, trustworthy, elegant and restrained.

Healthcare:
clean, accessible, trustworthy, appointment-focused.

Portfolio:
creative, visual, personal and modern.

SaaS:
modern product-focused interface with pricing/features.

Return ONLY valid JSON.
`;

function cleanJSON(text) {
  let value = text.trim();

  if (value.startsWith("```")) {
    value = value
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  const first = value.indexOf("{");
  const last = value.lastIndexOf("}");

  if (first !== -1 && last !== -1) {
    value = value.slice(first, last + 1);
  }

  return JSON.parse(value);
}

async function callProvider(client, model, messages) {
  if (!client) {
    throw new Error("Provider is not configured");
  }

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 16000
  });

  return response.choices?.[0]?.message?.content || "";
}

export async function generateWebsiteSpec({
  idea,
  answers = {},
  history = []
}) {
  const userPrompt = `
USER WEBSITE REQUEST:

${idea}

KNOWN INFORMATION:

${JSON.stringify(answers, null, 2)}

PREVIOUS QUESTIONS / ANSWERS:

${JSON.stringify(history, null, 2)}

Decide whether more information is actually required.

Return this exact structure:

{
  "status": "questions" | "ready",
  "business": {
    "type": "",
    "name": "",
    "tagline": "",
    "description": ""
  },
  "questions": [
    {
      "id": "",
      "question": "",
      "type": "text" | "textarea" | "choice",
      "options": []
    }
  ],
  "website": {
    "title": "",
    "description": "",
    "theme": {
      "style": "",
      "primary": "",
      "secondary": "",
      "accent": "",
      "background": "",
      "font": ""
    },
    "navigation": [],
    "pages": [],
    "sections": [],
    "features": [],
    "animations": []
  },
  "seo": {
    "title": "",
    "description": "",
    "keywords": []
  }
}

If enough information exists:
status = "ready"
questions = []

If important information is missing:
status = "questions"
return no more than 3 questions.

Do NOT ask questions for information that is already present.
`;

  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT
    },
    ...history,
    {
      role: "user",
      content: userPrompt
    }
  ];

  let raw;

  try {
    raw = await callProvider(
      openai,
      process.env.OPENAI_MODEL || "gpt-5-mini",
      messages
    );
  } catch (openaiError) {
    console.warn("OpenAI failed:", openaiError.message);

    raw = await callProvider(
      groq,
      process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages
    );
  }

  return cleanJSON(raw);
}