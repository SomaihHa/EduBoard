import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { transcript, targetText, language, level } = body;

    if (!transcript || !targetText || typeof transcript !== "string" || typeof targetText !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing transcript or targetText" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (transcript.length > 5000 || targetText.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Text too long (max 5,000 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ar" ? "Arabic" : "English";
    const levelDesc = level || "word";

    const systemPrompt = `You are an expert ${lang} pronunciation coach specializing in phoneme-level analysis. You are evaluating a student's pronunciation at the "${levelDesc}" level.

The student was asked to pronounce: "${targetText}"
Their speech recognition transcript reads: "${transcript}"

Analyze the pronunciation and return a JSON response with:
{
  "accuracyScore": 0-100,
  "clarityScore": 0-100,
  "articulationScore": 0-100,
  ${language === "en" ? '"stressScore": 0-100,' : ''}
  "overallScore": 0-100,
  "mispronounced": [{"target": "expected sound/word", "heard": "what was detected", "tip": "how to fix"}],
  "feedback": "encouraging feedback in ${lang}",
  "nextStep": "suggestion for next practice"
}

${language === "ar" ? "Pay special attention to: ع غ ق ح خ ص ض ط ظ distinctions, and common confusions like س/ص, ت/ط, د/ض, ذ/ظ." : "Pay special attention to: th/v/p/b sounds, word stress patterns, vowel length, and sentence rhythm."}

Only return valid JSON, no markdown.`;

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
          { role: "user", content: `Target: "${targetText}"\nTranscript: "${transcript}"` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      parsed = { rawResponse: content, error: "Could not parse AI response" };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pronunciation-analyze error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
