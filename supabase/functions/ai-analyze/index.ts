import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { action, text, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    const lang = language === "ar" ? "Arabic" : "English";

    switch (action) {
      case "grammar-check":
        systemPrompt = `You are an expert ${lang} grammar and writing teacher. Analyze the following text and return a JSON response with:
{
  "correctedText": "the corrected version",
  "errors": [{"original": "wrong text", "correction": "correct text", "type": "spelling|grammar|style", "explanation": "why"}],
  "scores": {"grammar": 0-100, "clarity": 0-100, "vocabulary": 0-100, "structure": 0-100},
  "suggestions": ["improvement suggestion 1", "suggestion 2"],
  "overallScore": 0-100
}
Only return valid JSON, no markdown.`;
        break;

      case "ocr-analyze":
        systemPrompt = `You are an expert ${lang} teacher reviewing a student's handwritten homework that has been converted to text via OCR. Analyze the text and return a JSON response with:
{
  "extractedText": "cleaned up version of the OCR text",
  "corrections": [{"original": "wrong text", "correction": "correct text", "type": "spelling|grammar|handwriting", "explanation": "why"}],
  "feedback": [{"type": "positive|negative|suggestion", "message": "feedback message"}],
  "overallScore": 0-100,
  "summary": "brief summary of homework quality"
}
Only return valid JSON, no markdown.`;
        break;

      case "lecture-notes":
        systemPrompt = `You are an expert educational content organizer. Take the following lecture transcript and create structured notes. Return a JSON response with:
{
  "title": "detected lecture title",
  "summary": "brief 2-3 sentence summary",
  "sections": [{"heading": "section title", "type": "definition|concept|key_point|question_answer", "content": "section content"}],
  "keyTerms": [{"term": "important term", "definition": "its definition"}],
  "questionsAndAnswers": [{"question": "detected Q", "answer": "detected A"}],
  "highlights": ["key takeaway 1", "key takeaway 2"]
}
Only return valid JSON, no markdown.`;
        break;

      case "tajweed-check":
        systemPrompt = `You are an expert Quran recitation and Tajweed teacher. The student has recited the following Quranic text. Analyze their recitation transcript against the correct text and return a JSON response with:
{
  "accuracyScore": 0-100,
  "tajweedRules": [{"rule": "rule name in Arabic and English", "status": "correct|warning|error", "details": "explanation"}],
  "mistakes": [{"word": "the word", "issue": "what went wrong", "correction": "how to fix it"}],
  "feedback": "encouraging feedback message",
  "improvementTip": "one specific tip to improve"
}
Only return valid JSON, no markdown.`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
        }),
      }
    );

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
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse the JSON from the AI response
    let parsed;
    try {
      // Try to extract JSON from the response (handle possible markdown wrapping)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      parsed = { rawResponse: content, error: "Could not parse AI response as JSON" };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-analyze error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
