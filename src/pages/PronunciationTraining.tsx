import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic, MicOff, Play, RotateCcw, Send, Plus, Volume2, CheckCircle,
  AlertCircle, BookOpen, Users, User, Trophy, ChevronDown, X, Loader2
} from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTeacherStudents } from "@/hooks/useTeacherStudents";

// ── Built-in Library ──
const arabicLibrary = {
  letter: [
    { text: "ع", hint: "عين - Ain (deep throat)", category: "difficult" },
    { text: "غ", hint: "غين - Ghain (gargling)", category: "difficult" },
    { text: "ق", hint: "قاف - Qaf (deep K)", category: "difficult" },
    { text: "ح", hint: "حاء - Ha (breathy H)", category: "difficult" },
    { text: "خ", hint: "خاء - Kha (like Bach)", category: "difficult" },
    { text: "ص", hint: "صاد - Sad (emphatic S)", category: "similar" },
    { text: "ض", hint: "ضاد - Dad (emphatic D)", category: "similar" },
    { text: "ط", hint: "طاء - Ta (emphatic T)", category: "similar" },
    { text: "ظ", hint: "ظاء - Dha (emphatic Th)", category: "similar" },
    { text: "ث", hint: "ثاء - Tha (soft Th)", category: "similar" },
    { text: "س", hint: "سين - Sin", category: "similar" },
  ],
  word: [
    { text: "صَبْر", hint: "Sabr - Patience", category: "common" },
    { text: "عِلْم", hint: "Ilm - Knowledge", category: "common" },
    { text: "قَلْب", hint: "Qalb - Heart", category: "common" },
    { text: "صَدَقَة", hint: "Sadaqah - Charity", category: "common" },
    { text: "غَفُور", hint: "Ghafoor - Forgiving", category: "tajweed" },
  ],
  sentence: [
    { text: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", hint: "Bismillahi Ar-Rahman Ar-Raheem", category: "common" },
    { text: "الحَمْدُ لِلَّهِ رَبِّ العَالَمِينَ", hint: "Alhamdulillahi Rabbil Aalameen", category: "common" },
  ],
  paragraph: [
    { text: "قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", hint: "Surah Al-Ikhlas", category: "tajweed" },
  ],
};

const englishLibrary = {
  letter: [
    { text: "th", hint: "as in 'think' - tongue between teeth", category: "difficult" },
    { text: "v", hint: "as in 'very' - teeth on lower lip", category: "difficult" },
    { text: "p", hint: "as in 'pen' - puff of air", category: "difficult" },
    { text: "r", hint: "as in 'red' - tongue curled back", category: "difficult" },
  ],
  word: [
    { text: "through", hint: "/θruː/ - 'th' sound", category: "difficult" },
    { text: "vegetable", hint: "/ˈvedʒ.tə.bəl/ - stress on first", category: "stress" },
    { text: "comfortable", hint: "/ˈkʌmf.tə.bəl/ - 3 syllables", category: "stress" },
    { text: "development", hint: "/dɪˈvel.əp.mənt/ - stress on second", category: "stress" },
  ],
  sentence: [
    { text: "The thirty-three thieves thought they thrilled the throne.", hint: "'th' practice", category: "rhythm" },
    { text: "Peter Piper picked a peck of pickled peppers.", hint: "'p' practice", category: "rhythm" },
  ],
  paragraph: [
    { text: "She sells seashells by the seashore. The shells she sells are seashells, I'm sure.", hint: "S/Sh distinction", category: "rhythm" },
  ],
};

interface PronunciationTask {
  id: string;
  teacher_id: string;
  language: string;
  level: string;
  text_content: string;
  phonetic_hint: string | null;
  practice_mode: string;
  target_accuracy: number | null;
  assign_to: string;
  assigned_student_id: string | null;
  created_at: string;
}

interface TaskSubmission {
  id: string;
  task_id: string;
  student_id: string;
  accuracy_score: number | null;
  clarity_score: number | null;
  articulation_score: number | null;
  stress_score: number | null;
  overall_score: number | null;
  mispronounced_parts: any;
  ai_feedback: string | null;
  attempt_number: number;
  is_best_attempt: boolean;
  teacher_feedback: string | null;
  submitted_at: string;
  audio_url: string | null;
}

// ── Teacher: Create Task Form ──
const CreateTaskForm = ({ isAr, onCreated }: { isAr: boolean; onCreated: () => void }) => {
  const { user } = useAuth();
  const { students } = useTeacherStudents();
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [level, setLevel] = useState<"letter" | "word" | "sentence" | "paragraph">("word");
  const [textContent, setTextContent] = useState("");
  const [phoneticHint, setPhoneticHint] = useState("");
  const [practiceMode, setPracticeMode] = useState<"practice" | "graded">("practice");
  const [targetAccuracy, setTargetAccuracy] = useState(80);
  const [assignTo, setAssignTo] = useState<"class" | "individual">("class");
  const [assignedStudentId, setAssignedStudentId] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);
  const [saving, setSaving] = useState(false);

  const library = language === "ar" ? arabicLibrary : englishLibrary;
  const libraryItems = library[level] || [];

  const handleSubmit = async () => {
    if (!user || !textContent.trim()) return;
    setSaving(true);

    const { error } = await supabase.from("pronunciation_tasks").insert({
      teacher_id: user.id,
      language,
      level,
      text_content: textContent.trim(),
      phonetic_hint: phoneticHint.trim() || null,
      practice_mode: practiceMode,
      target_accuracy: practiceMode === "graded" ? targetAccuracy : null,
      assign_to: assignTo,
      assigned_student_id: assignTo === "individual" ? assignedStudentId || null : null,
    } as any);

    setSaving(false);
    if (error) {
      toast.error(isAr ? "فشل إنشاء المهمة" : "Failed to create task");
    } else {
      toast.success(isAr ? "تم إنشاء مهمة النطق" : "Pronunciation task created!");
      setTextContent("");
      setPhoneticHint("");
      onCreated();
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card p-6 space-y-5">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Plus className="w-5 h-5 text-primary" />
        {isAr ? "إنشاء مهمة نطق" : "Create Pronunciation Task"}
      </h3>

      {/* Language & Level */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">{isAr ? "اللغة" : "Language"}</label>
          <div className="flex gap-2">
            <button onClick={() => setLanguage("ar")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${language === "ar" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {isAr ? "عربي" : "Arabic"}
            </button>
            <button onClick={() => setLanguage("en")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${language === "en" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {isAr ? "إنجليزي" : "English"}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">{isAr ? "المستوى" : "Level"}</label>
          <select value={level} onChange={(e) => setLevel(e.target.value as any)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="letter">{isAr ? "حرف" : "Letter"}</option>
            <option value="word">{isAr ? "كلمة" : "Word"}</option>
            <option value="sentence">{isAr ? "جملة" : "Sentence"}</option>
            <option value="paragraph">{isAr ? "فقرة" : "Paragraph"}</option>
          </select>
        </div>
      </div>

      {/* Library toggle */}
      <div>
        <button onClick={() => setShowLibrary(!showLibrary)} className="text-sm text-primary hover:underline flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          {isAr ? "اختر من المكتبة" : "Choose from Library"}
          <ChevronDown className={`w-3 h-3 transition-transform ${showLibrary ? "rotate-180" : ""}`} />
        </button>
        {showLibrary && (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {libraryItems.map((item, i) => (
              <button key={i} onClick={() => { setTextContent(item.text); setPhoneticHint(item.hint); setShowLibrary(false); }}
                className="p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-start transition-all">
                <p className={`font-medium text-sm ${language === "ar" ? "font-arabic text-base" : ""}`}>{item.text}</p>
                <p className="text-xs text-muted-foreground truncate">{item.hint}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text content */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">{isAr ? "النص" : "Text Content"}</label>
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className={`w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] ${language === "ar" ? "font-arabic text-lg text-right" : ""}`}
          dir={language === "ar" ? "rtl" : "ltr"}
          placeholder={isAr ? "أدخل النص المطلوب..." : "Enter text to pronounce..."}
        />
      </div>

      {/* Phonetic hint */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">{isAr ? "تلميح صوتي (اختياري)" : "Phonetic Hint (optional)"}</label>
        <input
          value={phoneticHint}
          onChange={(e) => setPhoneticHint(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          placeholder={isAr ? "مثال: /sˤabr/" : "e.g., /θruː/"}
        />
      </div>

      {/* Assignment */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">{isAr ? "تعيين إلى" : "Assign To"}</label>
          <div className="flex gap-2">
            <button onClick={() => setAssignTo("class")} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all ${assignTo === "class" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <Users className="w-3.5 h-3.5" />{isAr ? "الفصل" : "Class"}
            </button>
            <button onClick={() => setAssignTo("individual")} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all ${assignTo === "individual" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <User className="w-3.5 h-3.5" />{isAr ? "طالب" : "Student"}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">{isAr ? "النمط" : "Mode"}</label>
          <div className="flex gap-2">
            <button onClick={() => setPracticeMode("practice")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${practiceMode === "practice" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {isAr ? "تمرين" : "Practice"}
            </button>
            <button onClick={() => setPracticeMode("graded")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${practiceMode === "graded" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {isAr ? "مُقيَّم" : "Graded"}
            </button>
          </div>
        </div>
      </div>

      {assignTo === "individual" && students.length > 0 && (
        <select value={assignedStudentId} onChange={(e) => setAssignedStudentId(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value="">{isAr ? "اختر طالباً" : "Select student"}</option>
          {students.map((s) => (
            <option key={s.student_id} value={s.student_id}>{s.profile?.full_name || s.student_id}</option>
          ))}
        </select>
      )}

      {practiceMode === "graded" && (
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">
            {isAr ? `الدقة المطلوبة: ${targetAccuracy}%` : `Target Accuracy: ${targetAccuracy}%`}
          </label>
          <input type="range" min={50} max={100} value={targetAccuracy} onChange={(e) => setTargetAccuracy(Number(e.target.value))}
            className="w-full accent-primary" />
        </div>
      )}

      <Button onClick={handleSubmit} disabled={saving || !textContent.trim()} className="w-full">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {isAr ? "إنشاء المهمة" : "Create Task"}
      </Button>
    </div>
  );
};

// ── Student: Practice Card ──
const PracticeCard = ({ task, isAr, onSubmitted }: { task: PronunciationTask; isAr: boolean; onSubmitted: () => void }) => {
  const { user } = useAuth();
  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();
  const { isRecording, audioBlob, audioUrl, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [attempts, setAttempts] = useState<TaskSubmission[]>([]);

  // Fetch previous attempts
  useEffect(() => {
    if (!user) return;
    supabase.from("pronunciation_submissions")
      .select("*")
      .eq("task_id", task.id)
      .eq("student_id", user.id)
      .order("submitted_at", { ascending: false })
      .then(({ data }) => setAttempts((data as any) || []));
  }, [task.id, user]);

  const handleStartPractice = async () => {
    resetTranscript();
    setResult(null);
    const lang = task.language === "ar" ? "ar-SA" : "en-US";
    startListening(lang);
    await startRecording();
  };

  const handleStopPractice = async () => {
    stopListening();
    stopRecording();
  };

  const handleAnalyze = async () => {
    if (!user || !transcript.trim()) {
      toast.error(isAr ? "لم يتم اكتشاف كلام" : "No speech detected");
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("pronunciation-analyze", {
        body: {
          transcript: transcript.trim(),
          targetText: task.text_content,
          language: task.language,
          level: task.level,
        },
      });

      if (error) throw error;
      setResult(data);

      // Upload audio if available
      let savedAudioUrl: string | null = null;
      if (audioBlob) {
        const filePath = `${user.id}/pronunciation/${task.id}/${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage.from("recordings").upload(filePath, audioBlob, { contentType: "audio/webm" });
        if (!uploadError) savedAudioUrl = filePath;
      }

      // Save submission
      const attemptNum = attempts.length + 1;
      const isNewBest = !attempts.length || (data.overallScore > (attempts.find(a => a.is_best_attempt)?.overall_score || 0));

      // Unmark previous best if this is new best
      if (isNewBest && attempts.length) {
        const prevBest = attempts.find(a => a.is_best_attempt);
        if (prevBest) {
          await supabase.from("pronunciation_submissions").update({ is_best_attempt: false } as any).eq("id", prevBest.id);
        }
      }

      await supabase.from("pronunciation_submissions").insert({
        task_id: task.id,
        student_id: user.id,
        audio_url: savedAudioUrl,
        accuracy_score: data.accuracyScore || 0,
        clarity_score: data.clarityScore || 0,
        articulation_score: data.articulationScore || 0,
        stress_score: data.stressScore || null,
        overall_score: data.overallScore || 0,
        mispronounced_parts: data.mispronounced || [],
        ai_feedback: data.feedback || "",
        attempt_number: attemptNum,
        is_best_attempt: isNewBest,
      } as any);

      onSubmitted();
      // Refresh attempts
      const { data: newAttempts } = await supabase.from("pronunciation_submissions")
        .select("*").eq("task_id", task.id).eq("student_id", user.id)
        .order("submitted_at", { ascending: false });
      setAttempts((newAttempts as any) || []);
    } catch (e: any) {
      toast.error(e.message || (isAr ? "فشل التحليل" : "Analysis failed"));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetry = () => {
    resetTranscript();
    resetRecording();
    setResult(null);
  };

  const bestScore = attempts.find(a => a.is_best_attempt)?.overall_score || 0;
  const isGraded = task.practice_mode === "graded";
  const passed = isGraded && bestScore >= (task.target_accuracy || 80);

  return (
    <div className="bg-card rounded-xl shadow-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${task.language === "ar" ? "bg-primary/10 text-primary" : "bg-info/10 text-info"}`}>
              {task.language === "ar" ? (isAr ? "عربي" : "Arabic") : (isAr ? "إنجليزي" : "English")}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">{task.level}</span>
            {isGraded && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${passed ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {isAr ? `هدف: ${task.target_accuracy}%` : `Target: ${task.target_accuracy}%`}
              </span>
            )}
          </div>
        </div>
        {bestScore > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{isAr ? "أفضل" : "Best"}</p>
            <p className={`text-lg font-bold ${bestScore >= 80 ? "text-success" : bestScore >= 60 ? "text-warning" : "text-destructive"}`}>{bestScore}%</p>
          </div>
        )}
      </div>

      {/* Target text */}
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <p className={`font-semibold ${task.language === "ar" ? "font-arabic text-2xl leading-loose" : "text-xl"}`} dir={task.language === "ar" ? "rtl" : "ltr"}>
          {task.text_content}
        </p>
        {task.phonetic_hint && (
          <p className="text-sm text-muted-foreground mt-2">{task.phonetic_hint}</p>
        )}
      </div>

      {/* Recording controls */}
      {!result && (
        <div className="flex flex-col items-center gap-3">
          {isListening ? (
            <>
              <div className="relative">
                <button onClick={handleStopPractice} className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-elevated animate-pulse">
                  <MicOff className="w-7 h-7" />
                </button>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full animate-ping" />
              </div>
              <p className="text-sm text-muted-foreground">{isAr ? "جارٍ الاستماع..." : "Listening..."}</p>
              {(transcript || interimTranscript) && (
                <div className="bg-muted/30 rounded-lg p-3 w-full text-center">
                  <p className="text-sm">{transcript}<span className="text-muted-foreground">{interimTranscript}</span></p>
                </div>
              )}
            </>
          ) : transcript ? (
            <div className="w-full space-y-3">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{isAr ? "ما قلته:" : "You said:"}</p>
                <p className="text-sm font-medium">{transcript}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRetry} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4" />{isAr ? "إعادة" : "Retry"}
                </Button>
                <Button onClick={handleAnalyze} disabled={analyzing} className="flex-1">
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isAr ? "تحليل" : "Analyze"}
                </Button>
              </div>
            </div>
          ) : (
            <button onClick={handleStartPractice} disabled={!isSupported}
              className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elevated hover:scale-105 transition-transform">
              <Mic className="w-7 h-7" />
            </button>
          )}
          {!isSupported && <p className="text-xs text-destructive">{isAr ? "المتصفح لا يدعم التعرف على الكلام" : "Speech recognition not supported"}</p>}
        </div>
      )}

      {/* Results */}
      {result && !result.error && (
        <div className="space-y-3 animate-slide-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: isAr ? "الدقة" : "Accuracy", score: result.accuracyScore },
              { label: isAr ? "الوضوح" : "Clarity", score: result.clarityScore },
              { label: isAr ? "النطق" : "Articulation", score: result.articulationScore },
              ...(task.language === "en" ? [{ label: isAr ? "التشديد" : "Stress", score: result.stressScore }] : []),
            ].map((s, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-bold ${(s.score || 0) >= 80 ? "text-success" : (s.score || 0) >= 60 ? "text-warning" : "text-destructive"}`}>{s.score || 0}%</p>
              </div>
            ))}
          </div>

          {/* Overall */}
          <div className={`rounded-xl p-4 text-center ${(result.overallScore || 0) >= 80 ? "bg-success/10" : (result.overallScore || 0) >= 60 ? "bg-warning/10" : "bg-destructive/10"}`}>
            <p className="text-sm text-muted-foreground">{isAr ? "الدرجة الكلية" : "Overall Score"}</p>
            <p className="text-3xl font-bold">{result.overallScore || 0}%</p>
          </div>

          {/* Mispronounced */}
          {result.mispronounced?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">{isAr ? "أخطاء النطق:" : "Mispronounced:"}</p>
              <div className="space-y-1">
                {result.mispronounced.map((m: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 bg-destructive/5 rounded-lg p-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-medium text-destructive">{m.target}</span>
                      {m.heard && <span className="text-muted-foreground"> → {m.heard}</span>}
                      {m.tip && <p className="text-muted-foreground mt-0.5">{m.tip}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {result.feedback && (
            <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">{result.feedback}</p>
          )}

          {/* Audio playback */}
          {audioUrl && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{isAr ? "تسجيلك:" : "Your recording:"}</p>
              <audio controls src={audioUrl} className="w-full h-8" />
            </div>
          )}

          <Button onClick={handleRetry} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4" />{isAr ? "حاول مرة أخرى" : "Try Again"}
          </Button>
        </div>
      )}

      {/* Attempt history */}
      {attempts.length > 0 && !isListening && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">{isAr ? `${attempts.length} محاولة` : `${attempts.length} attempt(s)`}</p>
          <div className="flex gap-1 overflow-x-auto">
            {attempts.slice(0, 10).map((a, i) => (
              <div key={a.id} className={`px-2 py-1 rounded text-xs font-medium ${a.is_best_attempt ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                #{a.attempt_number}: {a.overall_score}%
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Teacher: Monitor Submissions ──
const TeacherMonitor = ({ isAr }: { isAr: boolean }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<PronunciationTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    supabase.from("pronunciation_tasks")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setTasks((data as any) || []));
  }, [user]);

  useEffect(() => {
    if (!selectedTask) { setSubmissions([]); return; }
    supabase.from("pronunciation_submissions")
      .select("*")
      .eq("task_id", selectedTask)
      .order("submitted_at", { ascending: false })
      .then(({ data }) => setSubmissions((data as any) || []));
  }, [selectedTask]);

  const handleFeedback = async (subId: string) => {
    const text = feedbackText[subId];
    if (!text?.trim()) return;
    await supabase.from("pronunciation_submissions")
      .update({ teacher_feedback: text.trim(), reviewed_at: new Date().toISOString() } as any)
      .eq("id", subId);
    toast.success(isAr ? "تم إرسال الملاحظة" : "Feedback sent");
    setFeedbackText(prev => ({ ...prev, [subId]: "" }));
    // Refresh
    const { data } = await supabase.from("pronunciation_submissions").select("*").eq("task_id", selectedTask!).order("submitted_at", { ascending: false });
    setSubmissions((data as any) || []);
  };

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from("pronunciation_tasks").delete().eq("id", taskId);
    toast.success(isAr ? "تم حذف المهمة" : "Task deleted");
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTask === taskId) setSelectedTask(null);
  };

  // Group submissions by student for monitoring
  const studentGroups: Record<string, any[]> = {};
  submissions.forEach(s => {
    if (!studentGroups[s.student_id]) studentGroups[s.student_id] = [];
    studentGroups[s.student_id].push(s);
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{isAr ? "مراقبة التقدم" : "Monitor Progress"}</h3>

      {/* Task selector */}
      <select value={selectedTask || ""} onChange={(e) => setSelectedTask(e.target.value || null)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
        <option value="">{isAr ? "اختر مهمة..." : "Select a task..."}</option>
        {tasks.map(t => (
          <option key={t.id} value={t.id}>
            {t.text_content.slice(0, 40)}{t.text_content.length > 40 ? "..." : ""} ({t.language.toUpperCase()} - {t.level})
          </option>
        ))}
      </select>

      {/* Task list with delete */}
      {!selectedTask && tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="bg-card rounded-xl shadow-card p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedTask(t.id)}>
                <p className={`font-medium text-sm truncate ${t.language === "ar" ? "font-arabic" : ""}`}>{t.text_content}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{t.language.toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground capitalize">{t.level}</span>
                  <span className="text-xs text-muted-foreground">{t.practice_mode}</span>
                </div>
              </div>
              <button onClick={() => handleDeleteTask(t.id)} className="text-destructive/60 hover:text-destructive p-1"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Submissions view */}
      {selectedTask && (
        <div className="space-y-3">
          {Object.entries(studentGroups).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">{isAr ? "لا توجد محاولات بعد" : "No submissions yet"}</p>
          )}
          {Object.entries(studentGroups).map(([studentId, subs]) => {
            const best = subs.find(s => s.is_best_attempt) || subs[0];
            return (
              <div key={studentId} className="bg-card rounded-xl shadow-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{studentId.slice(0, 8)}...</p>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{isAr ? `${subs.length} محاولة` : `${subs.length} attempts`}</p>
                    <p className={`text-lg font-bold ${(best.overall_score || 0) >= 80 ? "text-success" : (best.overall_score || 0) >= 60 ? "text-warning" : "text-destructive"}`}>
                      {best.overall_score || 0}%
                    </p>
                  </div>
                </div>

                {/* Common errors */}
                {best.mispronounced_parts?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(best.mispronounced_parts as any[]).slice(0, 3).map((m: any, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">{m.target || m.word}</span>
                    ))}
                  </div>
                )}

                {/* Audio playback for teacher */}
                {best.audio_url && (
                  <AudioPlayer storagePath={best.audio_url} />
                )}

                {/* Teacher feedback */}
                {best.teacher_feedback ? (
                  <p className="text-xs text-success bg-success/5 rounded p-2">{best.teacher_feedback}</p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={feedbackText[best.id] || ""}
                      onChange={(e) => setFeedbackText(prev => ({ ...prev, [best.id]: e.target.value }))}
                      className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs"
                      placeholder={isAr ? "أضف ملاحظة..." : "Add feedback..."}
                    />
                    <Button size="sm" variant="outline" onClick={() => handleFeedback(best.id)} disabled={!feedbackText[best.id]?.trim()}>
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Audio player for signed URLs
const AudioPlayer = ({ storagePath }: { storagePath: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase.storage.from("recordings").createSignedUrl(storagePath, 3600)
      .then(({ data }) => setUrl(data?.signedUrl || null));
  }, [storagePath]);
  if (!url) return null;
  return <audio controls src={url} className="w-full h-8" />;
};

// ── Main Page ──
const PronunciationTraining = () => {
  const { role, language } = useAppContext();
  const { user } = useAuth();
  const isAr = language === "ar";
  const isTeacher = role === "teacher";
  const [tasks, setTasks] = useState<PronunciationTask[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("pronunciation_tasks")
      .select("*")
      .order("created_at", { ascending: false });
    setTasks((data as any) || []);
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks, refreshKey]);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Volume2 className="w-6 h-6 text-primary" />
          {isAr ? "تدريب النطق" : "Pronunciation Training"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAr ? "تمرن على نطق الحروف والكلمات والجمل" : "Practice pronouncing letters, words, and sentences"}
        </p>
      </div>

      {isTeacher ? (
        <Tabs defaultValue="create" className="space-y-4">
          <TabsList>
            <TabsTrigger value="create">{isAr ? "إنشاء مهمة" : "Create Task"}</TabsTrigger>
            <TabsTrigger value="monitor">{isAr ? "المراقبة" : "Monitor"}</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <CreateTaskForm isAr={isAr} onCreated={() => setRefreshKey(k => k + 1)} />
          </TabsContent>
          <TabsContent value="monitor">
            <TeacherMonitor isAr={isAr} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl shadow-card">
              <Volume2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{isAr ? "لا توجد مهام نطق حالياً" : "No pronunciation tasks yet"}</p>
              <p className="text-xs text-muted-foreground mt-1">{isAr ? "سيظهر هنا ما يعينه المعلم" : "Tasks from your teacher will appear here"}</p>
            </div>
          ) : (
            tasks.map(task => (
              <PracticeCard key={task.id} task={task} isAr={isAr} onSubmitted={() => setRefreshKey(k => k + 1)} />
            ))
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default PronunciationTraining;
