import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useAppContext } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import {
  BookOpen, Plus, Send, Loader2, Check, Clock, AlertCircle,
  Play, Mic, Trash2, FileText, PenTool, Image, Sparkles,
  Filter, ChevronDown, Upload, X, MessageSquare
} from "lucide-react";

// ─── Assignment Types ───────────────────────────────────────────

const ASSIGNMENT_TYPES = [
  { id: "quran_recitation", label: "Quran Recitation", labelAr: "تلاوة القرآن", icon: BookOpen, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { id: "essay_writing", label: "Essay Writing", labelAr: "كتابة مقال", icon: PenTool, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "homework_upload", label: "Homework Upload", labelAr: "رفع واجب", icon: Image, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  { id: "poem_speech", label: "Poem / Speech", labelAr: "شعر / خطاب", icon: Mic, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { id: "general_task", label: "General Task", labelAr: "مهمة عامة", icon: FileText, color: "text-slate-500", bgColor: "bg-slate-500/10" },
  { id: "custom", label: "Custom", labelAr: "مخصص", icon: Sparkles, color: "text-pink-500", bgColor: "bg-pink-500/10" },
] as const;

type AssignmentType = typeof ASSIGNMENT_TYPES[number]["id"];

const getTypeInfo = (type: string) => ASSIGNMENT_TYPES.find(t => t.id === type) || ASSIGNMENT_TYPES[4];

// ─── Surah Options (for Quran type) ─────────────────────────────

const surahOptions = [
  { number: 1, name: "Al-Fatiha", nameAr: "الفاتحة", verses: 7 },
  { number: 36, name: "Ya-Sin", nameAr: "يس", verses: 83 },
  { number: 55, name: "Ar-Rahman", nameAr: "الرحمن", verses: 78 },
  { number: 67, name: "Al-Mulk", nameAr: "الملك", verses: 30 },
  { number: 78, name: "An-Naba", nameAr: "النبأ", verses: 40 },
  { number: 87, name: "Al-A'la", nameAr: "الأعلى", verses: 19 },
  { number: 88, name: "Al-Ghashiyah", nameAr: "الغاشية", verses: 26 },
  { number: 89, name: "Al-Fajr", nameAr: "الفجر", verses: 30 },
  { number: 91, name: "Ash-Shams", nameAr: "الشمس", verses: 15 },
  { number: 93, name: "Ad-Duha", nameAr: "الضحى", verses: 11 },
  { number: 94, name: "Ash-Sharh", nameAr: "الشرح", verses: 8 },
  { number: 95, name: "At-Tin", nameAr: "التين", verses: 8 },
  { number: 96, name: "Al-Alaq", nameAr: "العلق", verses: 19 },
  { number: 97, name: "Al-Qadr", nameAr: "القدر", verses: 5 },
  { number: 99, name: "Az-Zalzalah", nameAr: "الزلزلة", verses: 8 },
  { number: 103, name: "Al-Asr", nameAr: "العصر", verses: 3 },
  { number: 105, name: "Al-Fil", nameAr: "الفيل", verses: 5 },
  { number: 106, name: "Quraysh", nameAr: "قريش", verses: 4 },
  { number: 108, name: "Al-Kawthar", nameAr: "الكوثر", verses: 3 },
  { number: 109, name: "Al-Kafirun", nameAr: "الكافرون", verses: 6 },
  { number: 110, name: "An-Nasr", nameAr: "النصر", verses: 3 },
  { number: 112, name: "Al-Ikhlas", nameAr: "الإخلاص", verses: 4 },
  { number: 113, name: "Al-Falaq", nameAr: "الفلق", verses: 5 },
  { number: 114, name: "An-Nas", nameAr: "الناس", verses: 6 },
];

// ─── Secure Audio Player ────────────────────────────────────────

const SecureAudioPlayer = ({ filePath, getSignedUrl }: { filePath: string; getSignedUrl: (path: string) => Promise<string> }) => {
  const [src, setSrc] = useState<string>("");
  useEffect(() => {
    getSignedUrl(filePath).then(setSrc);
  }, [filePath, getSignedUrl]);
  if (!src) return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
  return <audio controls src={src} className="h-8" />;
};

// ─── Types ──────────────────────────────────────────────────────

interface Assignment {
  id: string;
  teacher_id: string;
  surah_number: number;
  surah_name: string;
  surah_name_ar: string;
  ayah_from: number;
  ayah_to: number;
  description: string;
  created_at: string;
  assignment_type: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  audio_url: string | null;
  submission_text: string | null;
  submission_image_url: string | null;
  status: string;
  teacher_feedback: string | null;
  submitted_at: string;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const QuranAssignments = () => {
  const { language } = useAppContext();
  const { user, role } = useAuth();
  const isAr = language === "ar";
  const isTeacher = role === "teacher";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  // Teacher form
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<AssignmentType>("quran_recitation");
  const [formSurah, setFormSurah] = useState(0);
  const [formAyahFrom, setFormAyahFrom] = useState(1);
  const [formAyahTo, setFormAyahTo] = useState(1);
  const [formDesc, setFormDesc] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [creating, setCreating] = useState(false);

  // Student recording
  const [recordingFor, setRecordingFor] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Student text submission
  const [textSubmission, setTextSubmission] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<Record<string, File | null>>({});

  const getSignedAudioUrl = useCallback(async (filePath: string): Promise<string> => {
    if (filePath.startsWith("http")) return filePath;
    if (signedUrls[filePath]) return signedUrls[filePath];
    const { data } = await supabase.storage.from("recordings").createSignedUrl(filePath, 3600);
    if (data?.signedUrl) {
      setSignedUrls(prev => ({ ...prev, [filePath]: data.signedUrl }));
      return data.signedUrl;
    }
    return "";
  }, [signedUrls]);

  useEffect(() => { if (user) fetchAssignments(); }, [user]);

  const fetchAssignments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quran_assignments")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setAssignments(data as Assignment[]);
      const subs: Record<string, Submission[]> = {};
      for (const a of data) {
        const { data: subData } = await supabase
          .from("assignment_submissions")
          .select("*")
          .eq("assignment_id", a.id);
        if (subData) subs[a.id] = subData as Submission[];
      }
      setSubmissions(subs);
    }
    if (error) console.error(error);
    setLoading(false);
  };

  // ─── Create Assignment ───────────────────────

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);

    const isQuran = formType === "quran_recitation";
    const surah = isQuran ? surahOptions[formSurah] : null;

    const { error } = await supabase.from("quran_assignments").insert({
      teacher_id: user.id,
      surah_number: surah?.number || 0,
      surah_name: isQuran ? surah!.name : formTitle || getTypeInfo(formType).label,
      surah_name_ar: isQuran ? surah!.nameAr : formTitle || getTypeInfo(formType).labelAr,
      ayah_from: isQuran ? formAyahFrom : 0,
      ayah_to: isQuran ? formAyahTo : 0,
      description: formDesc,
      assignment_type: formType,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isAr ? "تم" : "Created", description: isAr ? "تم إنشاء الواجب" : "Assignment created" });
      setShowForm(false);
      setFormDesc("");
      setFormTitle("");
      fetchAssignments();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("quran_assignments").delete().eq("id", id);
    if (!error) fetchAssignments();
  };

  // ─── Student: Audio Recording ────────────────

  const startRecording = async (assignmentId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecordingFor(assignmentId);
      setIsRecording(true);
    } catch {
      toast({ title: "Error", description: "Microphone access denied", variant: "destructive" });
    }
  };

  const stopAndSubmitAudio = async () => {
    if (!mediaRecorderRef.current || !recordingFor || !user) return;
    setSubmitting(true);
    const recorder = mediaRecorderRef.current;

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const fileName = `${user.id}/${recordingFor}-${Date.now()}.webm`;
      const { error: uploadErr } = await supabase.storage.from("recordings").upload(fileName, blob);
      if (uploadErr) {
        toast({ title: "Error", description: uploadErr.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const { error: insertErr } = await supabase.from("assignment_submissions").insert({
        assignment_id: recordingFor,
        student_id: user.id,
        audio_url: fileName,
      });
      if (insertErr) {
        toast({ title: "Error", description: insertErr.message, variant: "destructive" });
      } else {
        toast({ title: isAr ? "تم" : "Submitted" });
        fetchAssignments();
      }
      setRecordingFor(null);
      setIsRecording(false);
      setSubmitting(false);
    };
    recorder.stop();
    recorder.stream.getTracks().forEach(t => t.stop());
  };

  // ─── Student: Text Submission ────────────────

  const submitText = async (assignmentId: string) => {
    if (!user || !textSubmission[assignmentId]?.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("assignment_submissions").insert({
      assignment_id: assignmentId,
      student_id: user.id,
      submission_text: textSubmission[assignmentId],
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isAr ? "تم" : "Submitted" });
      setTextSubmission(prev => ({ ...prev, [assignmentId]: "" }));
      fetchAssignments();
    }
    setSubmitting(false);
  };

  // ─── Student: Image Upload ───────────────────

  const submitImage = async (assignmentId: string) => {
    if (!user || !imageFile[assignmentId]) return;
    setSubmitting(true);
    const file = imageFile[assignmentId]!;
    const fileName = `${user.id}/${assignmentId}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: uploadErr } = await supabase.storage.from("recordings").upload(fileName, file);
    if (uploadErr) {
      toast({ title: "Error", description: uploadErr.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from("assignment_submissions").insert({
      assignment_id: assignmentId,
      student_id: user.id,
      submission_image_url: fileName,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isAr ? "تم" : "Submitted" });
      setImageFile(prev => ({ ...prev, [assignmentId]: null }));
      fetchAssignments();
    }
    setSubmitting(false);
  };

  // ─── Filtered assignments ────────────────────

  const filteredAssignments = filterType === "all"
    ? assignments
    : assignments.filter(a => a.assignment_type === filterType);

  const selectedSurahObj = surahOptions[formSurah];

  // ─── Render submission interface per type ────

  const renderSubmissionUI = (assignment: Assignment, mySubmission: Submission | undefined) => {
    if (mySubmission) {
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
            mySubmission.status === "reviewed" ? "bg-primary/10 text-primary"
            : mySubmission.status === "needs_improvement" ? "bg-accent/10 text-accent"
            : "bg-info/10 text-info"
          }`}>
            {mySubmission.status === "reviewed" ? <Check className="w-4 h-4" /> :
             mySubmission.status === "needs_improvement" ? <AlertCircle className="w-4 h-4" /> :
             <Clock className="w-4 h-4" />}
            {mySubmission.status === "reviewed" ? (isAr ? "تمت المراجعة" : "Reviewed") :
             mySubmission.status === "needs_improvement" ? (isAr ? "يحتاج تحسين" : "Needs Improvement") :
             (isAr ? "تم التسليم" : "Submitted")}
          </div>
          {mySubmission.teacher_feedback && (
            <p className="text-sm text-muted-foreground">{mySubmission.teacher_feedback}</p>
          )}
        </div>
      );
    }

    const type = assignment.assignment_type;

    // Audio-based types: quran_recitation, poem_speech
    if (type === "quran_recitation" || type === "poem_speech") {
      if (recordingFor === assignment.id) {
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-destructive animate-pulse">
              <Mic className="w-5 h-5" />
              <span className="text-sm font-medium">{isAr ? "جاري التسجيل..." : "Recording..."}</span>
            </div>
            <button onClick={stopAndSubmitAudio} disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isAr ? "إيقاف وتسليم" : "Stop & Submit"}
            </button>
          </div>
        );
      }
      return (
        <button onClick={() => startRecording(assignment.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border text-foreground text-sm hover:bg-muted/80 transition-colors">
          <Mic className="w-4 h-4 text-primary" />
          {type === "quran_recitation" ? (isAr ? "سجّل تلاوتك" : "Record Recitation") : (isAr ? "سجّل إلقاءك" : "Record Speech")}
        </button>
      );
    }

    // Text-based types: essay_writing, custom
    if (type === "essay_writing" || type === "custom") {
      return (
        <div className="space-y-2">
          <textarea
            value={textSubmission[assignment.id] || ""}
            onChange={e => setTextSubmission(prev => ({ ...prev, [assignment.id]: e.target.value }))}
            placeholder={isAr ? "اكتب إجابتك هنا..." : "Write your answer here..."}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm resize-none h-28 focus:ring-2 focus:ring-primary/30 outline-none"
          />
          <button onClick={() => submitText(assignment.id)} disabled={submitting || !textSubmission[assignment.id]?.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isAr ? "تسليم" : "Submit"}
          </button>
        </div>
      );
    }

    // Image-based: homework_upload
    if (type === "homework_upload") {
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {imageFile[assignment.id]?.name || (isAr ? "اختر صورة الواجب" : "Choose homework image")}
            </span>
            <input type="file" accept="image/*" className="hidden"
              onChange={e => setImageFile(prev => ({ ...prev, [assignment.id]: e.target.files?.[0] || null }))} />
          </label>
          {imageFile[assignment.id] && (
            <div className="flex items-center gap-2">
              <button onClick={() => submitImage(assignment.id)} disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isAr ? "رفع وتسليم" : "Upload & Submit"}
              </button>
              <button onClick={() => setImageFile(prev => ({ ...prev, [assignment.id]: null }))}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      );
    }

    // General task: text or file
    return (
      <div className="space-y-2">
        <textarea
          value={textSubmission[assignment.id] || ""}
          onChange={e => setTextSubmission(prev => ({ ...prev, [assignment.id]: e.target.value }))}
          placeholder={isAr ? "اكتب إجابتك أو ارفع ملفاً..." : "Write your response..."}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm resize-none h-20 focus:ring-2 focus:ring-primary/30 outline-none"
        />
        <button onClick={() => submitText(assignment.id)} disabled={submitting || !textSubmission[assignment.id]?.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isAr ? "تسليم" : "Submit"}
        </button>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-primary" />
              {isAr ? "الواجبات" : "Assignments"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isTeacher
                ? isAr ? "أنشئ وأدِر واجبات الطلاب" : "Create and manage student assignments"
                : isAr ? "اعرض واجباتك وقدّم إجاباتك" : "View assignments and submit your work"}
            </p>
          </div>
          {isTeacher && (
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              {isAr ? "واجب جديد" : "New Assignment"}
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {isAr ? "الكل" : "All"}
          </button>
          {ASSIGNMENT_TYPES.map(t => (
            <button key={t.id} onClick={() => setFilterType(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              <t.icon className="w-3 h-3" />
              {isAr ? t.labelAr : t.label}
            </button>
          ))}
        </div>

        {/* Teacher Create Form */}
        {isTeacher && showForm && (
          <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{isAr ? "إنشاء واجب جديد" : "Create New Assignment"}</h3>

            {/* Assignment Type Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">{isAr ? "نوع الواجب" : "Assignment Type"}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ASSIGNMENT_TYPES.map(t => (
                  <button key={t.id} onClick={() => setFormType(t.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      formType === t.id
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}>
                    <t.icon className={`w-4 h-4 ${formType === t.id ? "text-primary" : t.color}`} />
                    {isAr ? t.labelAr : t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quran-specific fields */}
            {formType === "quran_recitation" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{isAr ? "السورة" : "Surah"}</label>
                  <select value={formSurah}
                    onChange={e => { const idx = Number(e.target.value); setFormSurah(idx); setFormAyahFrom(1); setFormAyahTo(surahOptions[idx].verses); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm">
                    {surahOptions.map((s, i) => (
                      <option key={s.number} value={i}>{s.number}. {s.name} - {s.nameAr}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{isAr ? "من آية" : "From Ayah"}</label>
                  <input type="number" min={1} max={selectedSurahObj.verses} value={formAyahFrom}
                    onChange={e => setFormAyahFrom(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{isAr ? "إلى آية" : "To Ayah"}</label>
                  <input type="number" min={formAyahFrom} max={selectedSurahObj.verses} value={formAyahTo}
                    onChange={e => setFormAyahTo(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
                </div>
              </div>
            )}

            {/* Non-Quran title */}
            {formType !== "quran_recitation" && (
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{isAr ? "عنوان الواجب" : "Assignment Title"}</label>
                <input value={formTitle} onChange={e => setFormTitle(e.target.value)}
                  placeholder={isAr ? "مثال: كتابة مقال عن البيئة" : "e.g. Write an essay about the environment"}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{isAr ? "تعليمات" : "Instructions (optional)"}</label>
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)}
                placeholder={isAr ? "تعليمات للطلاب..." : "Instructions for students..."}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm h-20 resize-none" />
            </div>

            <button onClick={handleCreate} disabled={creating || (formType !== "quran_recitation" && !formTitle.trim())}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isAr ? "إنشاء" : "Create Assignment"}
            </button>
          </div>
        )}

        {/* Assignments List */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">{isAr ? "لا توجد واجبات" : "No assignments found"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map(a => {
              const mySubs = submissions[a.id] || [];
              const mySubmission = mySubs.find(s => s.student_id === user?.id);
              const typeInfo = getTypeInfo(a.assignment_type);
              const TypeIcon = typeInfo.icon;

              return (
                <div key={a.id} className="bg-card rounded-2xl border border-border shadow-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${typeInfo.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {a.assignment_type === "quran_recitation"
                              ? `${a.surah_name_ar} - ${a.surah_name}`
                              : a.surah_name}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                            {isAr ? typeInfo.labelAr : typeInfo.label}
                          </span>
                        </div>
                        {a.assignment_type === "quran_recitation" && a.ayah_from > 0 && (
                          <p className="text-primary text-sm mt-0.5">
                            {isAr ? `الآيات ${a.ayah_from} - ${a.ayah_to}` : `Ayah ${a.ayah_from} – ${a.ayah_to}`}
                          </p>
                        )}
                        {a.description && <p className="text-muted-foreground text-sm mt-1">{a.description}</p>}
                        <p className="text-muted-foreground text-xs mt-1.5">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTeacher && (
                        <>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                            {mySubs.length} {isAr ? "تسليم" : "submissions"}
                          </span>
                          <button onClick={() => handleDelete(a.id)}
                            className="p-2 rounded-lg text-destructive/60 hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Student submission UI */}
                  {!isTeacher && (
                    <div className="mt-4 pt-4 border-t border-border">
                      {renderSubmissionUI(a, mySubmission)}
                    </div>
                  )}

                  {/* Teacher: View submissions */}
                  {isTeacher && mySubs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      <p className="text-sm font-medium text-foreground mb-2">{isAr ? "التسليمات" : "Submissions"}</p>
                      {mySubs.map(s => (
                        <div key={s.id} className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {s.audio_url && <SecureAudioPlayer filePath={s.audio_url} getSignedUrl={getSignedAudioUrl} />}
                            {s.submission_text && (
                              <p className="text-sm text-foreground truncate max-w-xs">{s.submission_text}</p>
                            )}
                            {s.submission_image_url && (
                              <span className="text-xs text-primary flex items-center gap-1"><Image className="w-3 h-3" /> Image</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(s.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-lg ${
                            s.status === "reviewed" ? "bg-primary/10 text-primary" :
                            s.status === "needs_improvement" ? "bg-accent/10 text-accent" :
                            "bg-info/10 text-info"
                          }`}>
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default QuranAssignments;
