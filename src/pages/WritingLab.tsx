import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { PenTool, CheckCircle, AlertTriangle, Lightbulb, BarChart3, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WritingAnalysis {
  correctedText: string;
  errors: { original: string; correction: string; type: string; explanation: string }[];
  scores: { grammar: number; clarity: number; vocabulary: number; structure: number };
  suggestions: string[];
  overallScore: number;
}

const WritingLab = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
  const [essayLang, setEssayLang] = useState<"ar" | "en">(language === "ar" ? "ar" : "en");

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({ title: isAr ? "لا يوجد نص" : "No text", description: isAr ? "اكتب نصاً أولاً" : "Write some text first", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-analyze", {
        body: { action: "grammar-check", text, language: essayLang },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data);
      toast({ title: isAr ? "تم التحليل" : "Analysis Complete" });
    } catch (err: any) {
      console.error("Writing analysis error:", err);
      toast({ title: isAr ? "خطأ" : "Error", description: err.message || "Analysis failed", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scores = analysis?.scores || { grammar: 0, clarity: 0, vocabulary: 0, structure: 0 };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "✍️ مختبر الكتابة" : "✍️ Writing Lab"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "اكتب مقالك واحصل على تصحيحات ذكية بالذكاء الاصطناعي" : "Write your essay and get AI-powered corrections"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                {isAr ? "المحرر" : "Editor"}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEssayLang("ar")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${essayLang === "ar" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {isAr ? "عربي" : "Arabic"}
                </button>
                <button
                  onClick={() => setEssayLang("en")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${essayLang === "en" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {isAr ? "إنجليزي" : "English"}
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 bg-muted/30 rounded-lg p-4 text-card-foreground text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              dir={essayLang === "ar" ? "rtl" : "ltr"}
              placeholder={isAr ? "ابدأ الكتابة هنا..." : "Start writing here..."}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {text.split(/\s+/).filter(Boolean).length} {isAr ? "كلمة" : "words"}
              </span>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isAr ? "تحليل النص" : "Analyze Text"}
              </button>
            </div>
          </div>

          {/* Corrected text with inline highlights */}
          {analysis?.correctedText && (
            <div className="bg-card rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-card-foreground mb-2 text-sm">{isAr ? "النص المصحح" : "Corrected Text"}</h3>
              <div className="text-sm text-card-foreground leading-relaxed bg-muted/20 rounded-lg p-4" dir={essayLang === "ar" ? "rtl" : "ltr"}>
                {(() => {
                  let highlighted = analysis.correctedText;
                  const elements: React.ReactNode[] = [];
                  
                  if (analysis.errors && analysis.errors.length > 0) {
                    // Build a version that highlights corrections inline
                    let remaining = analysis.correctedText;
                    let key = 0;
                    
                    for (const err of analysis.errors) {
                      const idx = remaining.indexOf(err.correction);
                      if (idx !== -1) {
                        // Text before the correction
                        if (idx > 0) elements.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
                        // The correction highlighted
                        elements.push(
                          <span key={key++} className="relative group cursor-help">
                            <span className="bg-destructive/15 text-destructive border-b-2 border-destructive/60 rounded px-0.5 font-medium">
                              {err.correction}
                            </span>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded-lg shadow-elevated px-3 py-2 whitespace-nowrap z-10 border border-border">
                              <span className="line-through text-destructive/70">{err.original}</span> → <span className="text-success font-medium">{err.correction}</span>
                              <br />
                              <span className="text-muted-foreground">{err.explanation}</span>
                            </span>
                          </span>
                        );
                        remaining = remaining.slice(idx + err.correction.length);
                      }
                    }
                    if (remaining) elements.push(<span key={key++}>{remaining}</span>);
                    
                    return elements.length > 0 ? elements : highlighted;
                  }
                  return highlighted;
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-destructive/15 border-b-2 border-destructive/60 rounded" />
                {isAr ? "مرر فوق الكلمات المميزة لرؤية التفاصيل" : "Hover highlighted words to see details"}
              </p>
            </div>
          )}

          {/* Errors */}
          {analysis?.errors && analysis.errors.length > 0 && (
            <div className="bg-card rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-card-foreground mb-3 text-sm">{isAr ? "الأخطاء" : "Errors Found"}</h3>
              <div className="space-y-2">
                {analysis.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-card-foreground">
                        <span className="bg-destructive/10 text-destructive px-1 rounded line-through">{e.original}</span>
                        {" → "}
                        <span className="bg-success/10 text-success px-1 rounded">{e.correction}</span>
                        <span className="text-xs text-muted-foreground ml-2">({e.type})</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{e.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        <div className="space-y-4">
          {/* Scores */}
          <div className="bg-card rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {isAr ? "التقييم" : "Assessment"}
            </h3>
            {analysis ? (
              <>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-gradient-primary">{analysis.overallScore}%</p>
                  <p className="text-xs text-muted-foreground">{isAr ? "التقييم العام" : "Overall Score"}</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: isAr ? "القواعد" : "Grammar", score: scores.grammar, color: "bg-success" },
                    { label: isAr ? "المفردات" : "Vocabulary", score: scores.vocabulary, color: "bg-primary" },
                    { label: isAr ? "الوضوح" : "Clarity", score: scores.clarity, color: "bg-info" },
                    { label: isAr ? "البنية" : "Structure", score: scores.structure, color: "bg-secondary" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold text-card-foreground">{item.score}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center">{isAr ? "اكتب نصاً واضغط تحليل" : "Write text and click Analyze"}</p>
            )}
          </div>

          {/* Suggestions */}
          {analysis?.suggestions && analysis.suggestions.length > 0 && (
            <div className="bg-card rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-card-foreground mb-3 text-sm">
                {isAr ? "اقتراحات التحسين" : "Suggestions"}
              </h3>
              <div className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="p-3 bg-info/5 rounded-lg flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-card-foreground">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default WritingLab;
