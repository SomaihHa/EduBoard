import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, gradeLevel, subject, duration, language } = await req.json();

    if (!topic || topic.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid topic" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isArabic = language === "ar";

    const systemPrompt = `You are an expert educational content creator. Generate a structured presentation for teachers.
Return a valid JSON object with this exact structure:
{
  "title": "Presentation title",
  "slides": [
    {
      "title": "Slide title",
      "bullets": ["bullet 1", "bullet 2", ...],
      "notes": "Speaker notes for the teacher",
      "type": "title|content|examples|discussion|summary|quran"
    }
  ]
}

Rules:
- Generate 8-15 slides depending on duration
- First slide should be type "title" with topic overview
- Include content slides with key explanations
- Include at least one "examples" slide with practical examples
- Include a "discussion" slide with discussion questions
- Last slide should be type "summary" with key takeaways
- If the subject is Islamic Studies or Quran, include a "quran" slide with relevant verses
- ${isArabic ? "All text MUST be in Arabic" : "All text should be in English"}
- Tailor content to grade level: ${gradeLevel}
- Keep bullets concise (max 2 sentences each)
- Speaker notes should be 2-3 sentences of guidance for the teacher
- Return ONLY valid JSON, no markdown fences`;

    const userPrompt = `Create a ${duration} presentation about "${topic}" for ${gradeLevel} students studying ${subject}.${isArabic ? " Write everything in Arabic." : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // Strip markdown fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-presentation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
