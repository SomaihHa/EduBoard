import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, FileText, Loader2, BookOpen, Lightbulb, HelpCircle, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LectureSection {
  heading: string;
  type: string;
  content: string;
}

interface LectureAnalysis {
  title: string;
  summary: string;
  sections: LectureSection[];
  keyTerms: { term: string; definition: string }[];
  questionsAndAnswers: { question: string; answer: string }[];
  highlights: string[];
}

const LectureNotes = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const { isRecording, audioUrl, startRecording, stopRecording, resetRecording, duration, error: recError } = useAudioRecorder();
  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, isSupported, error: speechError } = useSpeechRecognition();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<LectureAnalysis | null>(null);
  const [manualText, setManualText] = useState("");

  const handleStartRecording = async () => {
    await startRecording();
    startListening(isAr ? "ar-SA" : "en-US");
  };

  const handleStopRecording = () => {
    stopRecording();
    stopListening();
  };

  const handleReset = () => {
    resetRecording();
    resetTranscript();
    setAnalysis(null);
    setManualText("");
  };

  const handleAnalyze = async () => {
    const text = transcript || manualText;
    if (!text.trim()) {
      toast({ title: isAr ? "لا يوجد نص" : "No text", description: isAr ? "سجّل محاضرة أو اكتب النص" : "Record a lecture or type text first", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-analyze", {
        body: { action: "lecture-notes", text, language },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data);
      toast({ title: isAr ? "تم التحليل" : "Analysis Complete", description: isAr ? "تم إنشاء الملاحظات المنظمة" : "Structured notes generated" });
    } catch (err: any) {
      console.error("Lecture analysis error:", err);
      toast({ title: isAr ? "خطأ" : "Error", description: err.message || "Analysis failed", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const sectionIcon = (type: string) => {
    switch (type) {
      case "definition": return <BookOpen className="w-4 h-4 text-info" />;
      case "key_point": case "concept": return <Lightbulb className="w-4 h-4 text-warning" />;
      case "question_answer": return <HelpCircle className="w-4 h-4 text-primary" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "🎤 ملاحظات المحاضرة" : "🎤 Lecture Notes"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "سجّل المحاضرة وحوّلها إلى ملاحظات منظمة بالذكاء الاصطناعي" : "Record lectures and convert them into AI-structured notes"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recording Panel */}
        <div className="space-y-4">
          {/* Recorder */}
          <div className="bg-card rounded-xl shadow-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {isRecording ? (isAr ? "جارٍ التسجيل..." : "Recording...") : (isAr ? "اضغط للتسجيل" : "Press to record")}
            </p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button onClick={handleReset} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                <RotateCcw className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? "bg-destructive text-destructive-foreground scale-110 animate-pulse"
                    : "bg-gradient-primary text-primary-foreground hover:scale-105"
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <div className="w-10 h-10 flex items-center justify-center">
                <span className="text-lg font-mono font-bold text-card-foreground">{formatDuration(duration)}</span>
              </div>
            </div>

            {(recError || speechError) && (
              <p className="text-xs text-destructive mt-2">{recError || speechError}</p>
            )}

            {!isSupported && (
              <p className="text-xs text-warning mt-2">
                {isAr ? "المتصفح لا يدعم التعرف على الكلام. يمكنك كتابة النص يدوياً." : "Speech recognition not supported. You can type text manually."}
              </p>
            )}

            {audioUrl && (
              <div className="mt-4">
                <audio controls src={audioUrl} className="w-full" />
              </div>
            )}
          </div>

          {/* Transcript / Manual input */}
          <div className="bg-card rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-card-foreground mb-2 text-sm">
              {isAr ? "النص المسجّل" : "Transcript"}
            </h3>
            <textarea
              value={transcript || manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={isAr ? "سيظهر النص هنا أثناء التسجيل، أو اكتب يدوياً..." : "Transcript appears here during recording, or type manually..."}
              className="w-full h-40 bg-muted/50 rounded-lg p-3 text-sm text-card-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              dir={isAr ? "rtl" : "ltr"}
            />
            {interimTranscript && (
              <p className="text-xs text-muted-foreground italic mt-1">{interimTranscript}</p>
            )}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!transcript && !manualText.trim())}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {isAr ? "تحليل وإنشاء ملاحظات" : "Analyze & Generate Notes"}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {!analysis && !isAnalyzing && (
            <div className="bg-card rounded-xl shadow-card p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {isAr ? "سجّل محاضرة أو اكتب النص ثم اضغط تحليل" : "Record a lecture or type text, then click Analyze"}
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-card rounded-xl shadow-card p-12 text-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">{isAr ? "جارٍ التحليل..." : "Analyzing lecture..."}</p>
            </div>
          )}

          {analysis && (
            <>
              {/* Summary */}
              <div className="bg-card rounded-xl shadow-card p-5">
                <h2 className="text-lg font-bold text-card-foreground mb-1">{analysis.title}</h2>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>

              {/* Sections */}
              {analysis.sections?.map((sec, i) => (
                <div key={i} className="bg-card rounded-xl shadow-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {sectionIcon(sec.type)}
                    <h3 className="font-semibold text-card-foreground text-sm">{sec.heading}</h3>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{sec.type}</span>
                  </div>
                  <p className="text-sm text-card-foreground">{sec.content}</p>
                </div>
              ))}

              {/* Key Terms */}
              {analysis.keyTerms?.length > 0 && (
                <div className="bg-card rounded-xl shadow-card p-5">
                  <h3 className="font-semibold text-card-foreground mb-3 text-sm">
                    {isAr ? "المصطلحات الرئيسية" : "Key Terms"}
                  </h3>
                  <div className="space-y-2">
                    {analysis.keyTerms.map((kt, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-semibold text-card-foreground">{kt.term}</p>
                        <p className="text-xs text-muted-foreground">{kt.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Q&A */}
              {analysis.questionsAndAnswers?.length > 0 && (
                <div className="bg-card rounded-xl shadow-card p-5">
                  <h3 className="font-semibold text-card-foreground mb-3 text-sm">
                    {isAr ? "أسئلة وأجوبة" : "Questions & Answers"}
                  </h3>
                  <div className="space-y-3">
                    {analysis.questionsAndAnswers.map((qa, i) => (
                      <div key={i} className="border-l-2 border-primary pl-3">
                        <p className="text-sm font-medium text-card-foreground">❓ {qa.question}</p>
                        <p className="text-xs text-muted-foreground mt-1">💡 {qa.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {analysis.highlights?.length > 0 && (
                <div className="bg-mint rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-2 text-sm">
                    {isAr ? "أبرز النقاط" : "Key Highlights"}
                  </h3>
                  <ul className="space-y-1">
                    {analysis.highlights.map((h, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span>⭐</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default LectureNotes;
