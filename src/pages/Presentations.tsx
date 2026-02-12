import { useState, useEffect, useCallback, useRef } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import PptxGenJS from "pptxgenjs";
import {
  Presentation, ChevronLeft, ChevronRight, Play, Maximize2, Minimize2,
  FileText, Loader2, Lightbulb, BookOpen, HelpCircle, Download, Plus,
  Sparkles, Trash2, GripVertical, Save, Edit3, MessageSquare, ArrowUp, ArrowDown
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface PresentationSlide {
  title: string;
  bullets: string[];
  notes: string;
  type: "title" | "content" | "examples" | "discussion" | "summary" | "quran";
}

interface SavedPresentation {
  id: string;
  title: string;
  topic: string;
  grade_level: string;
  subject: string;
  duration: string;
  language: string;
  slides: PresentationSlide[];
  speaker_notes: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface LectureSection {
  heading: string;
  type: string;
  content: string;
}

interface SavedNote {
  id: string;
  title: string;
  summary: string | null;
  sections: LectureSection[];
  key_terms: { term: string; definition: string }[];
  questions_and_answers: { question: string; answer: string }[];
  highlights: string[];
  created_at: string;
}

type ViewMode = "list" | "create" | "editor" | "present" | "notes-present";

// ─── Slide Colors ───────────────────────────────────────────────

const SLIDE_TYPE_COLORS: Record<string, string> = {
  title: "from-primary/20 to-secondary/20",
  content: "from-blue-500/10 to-cyan-500/10",
  examples: "from-amber-500/10 to-orange-500/10",
  discussion: "from-purple-500/10 to-pink-500/10",
  summary: "from-emerald-500/10 to-teal-500/10",
  quran: "from-yellow-500/10 to-amber-500/10",
  terms: "from-amber-500/10 to-orange-500/10",
  qa: "from-purple-500/10 to-pink-500/10",
  highlights: "from-emerald-500/10 to-teal-500/10",
};

const SLIDE_TYPE_ICONS: Record<string, React.ReactNode> = {
  title: <Presentation className="w-5 h-5" />,
  content: <FileText className="w-5 h-5" />,
  examples: <Lightbulb className="w-5 h-5" />,
  discussion: <MessageSquare className="w-5 h-5" />,
  summary: <BookOpen className="w-5 h-5" />,
  quran: <BookOpen className="w-5 h-5" />,
  terms: <Lightbulb className="w-5 h-5" />,
  qa: <HelpCircle className="w-5 h-5" />,
  highlights: <Sparkles className="w-5 h-5" />,
};

// ─── PPT Export Helpers ─────────────────────────────────────────

const PPT_COLORS = {
  title: { bg: "1a365d", text: "FFFFFF", accent: "63b3ed" },
  content: { bg: "FFFFFF", text: "1a202c", accent: "3182ce" },
  examples: { bg: "fffbeb", text: "92400e", accent: "d97706" },
  discussion: { bg: "faf5ff", text: "553c9a", accent: "805ad5" },
  summary: { bg: "f0fff4", text: "22543d", accent: "38a169" },
  quran: { bg: "fffff0", text: "744210", accent: "d69e2e" },
};

function exportPresentationToPPT(pres: { title: string; slides: PresentationSlide[] }, isAr: boolean) {
  const pptx = new PptxGenJS();
  pptx.author = "EduBoard";
  pptx.title = pres.title;
  pptx.layout = "LAYOUT_WIDE";

  pres.slides.forEach((slide) => {
    const colors = PPT_COLORS[slide.type] || PPT_COLORS.content;
    const s = pptx.addSlide();
    s.background = { color: colors.bg };

    if (slide.type !== "title") {
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.15, h: "100%", fill: { color: colors.accent } });
    }

    s.addText(slide.title, {
      x: 0.6, y: slide.type === "title" ? 1.5 : 0.4, w: "88%", h: slide.type === "title" ? 1.5 : 0.8,
      fontSize: slide.type === "title" ? 36 : 28, bold: true, color: colors.text,
      align: isAr ? "right" : "left",
    });

    slide.bullets.forEach((bullet, idx) => {
      const yStart = slide.type === "title" ? 3.2 : 1.6;
      s.addText(slide.type === "title" ? bullet : `• ${bullet}`, {
        x: 0.8, y: yStart + idx * 0.8, w: "85%", h: 0.7,
        fontSize: slide.type === "title" ? 18 : 16, color: slide.type === "title" ? colors.accent : "4a5568",
        align: isAr ? "right" : "left",
      });
    });

    if (slide.notes) {
      s.addNotes(slide.notes);
    }
  });

  return pptx;
}

// ─── Lecture Notes to Slides ────────────────────────────────────

function notesToSlides(note: SavedNote): PresentationSlide[] {
  const slides: PresentationSlide[] = [];
  slides.push({ title: note.title, bullets: note.summary ? [note.summary] : [], notes: "", type: "title" });
  note.sections?.forEach((sec) => {
    slides.push({ title: sec.heading, bullets: [sec.content], notes: "", type: "content" });
  });
  if (note.key_terms?.length > 0) {
    for (let i = 0; i < note.key_terms.length; i += 4) {
      const chunk = note.key_terms.slice(i, i + 4);
      slides.push({ title: "Key Terms", bullets: chunk.map(kt => `${kt.term}: ${kt.definition}`), notes: "", type: "examples" });
    }
  }
  if (note.questions_and_answers?.length > 0) {
    for (let i = 0; i < note.questions_and_answers.length; i += 2) {
      const chunk = note.questions_and_answers.slice(i, i + 2);
      slides.push({ title: "Q&A", bullets: chunk.map(qa => `❓ ${qa.question} — 💡 ${qa.answer}`), notes: "", type: "discussion" });
    }
  }
  if (note.highlights?.length > 0) {
    slides.push({ title: "Key Highlights", bullets: note.highlights.map(h => `⭐ ${h}`), notes: "", type: "summary" });
  }
  return slides;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const Presentations = () => {
  const { language } = useAppContext();
  const { user } = useAuth();
  const isAr = language === "ar";

  const [view, setView] = useState<ViewMode>("list");
  const [presentations, setPresentations] = useState<SavedPresentation[]>([]);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Create form
  const [formTopic, setFormTopic] = useState("");
  const [formGrade, setFormGrade] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDuration, setFormDuration] = useState("30 minutes");
  const [formLang, setFormLang] = useState<"ar" | "en">(language as "ar" | "en");

  // Editor state
  const [editingPres, setEditingPres] = useState<SavedPresentation | null>(null);
  const [editSlides, setEditSlides] = useState<PresentationSlide[]>([]);
  const [editTitle, setEditTitle] = useState("");
  const [editingSlideIdx, setEditingSlideIdx] = useState<number | null>(null);

  // Present mode
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Notes-based present (legacy)
  const [noteSlides, setNoteSlides] = useState<PresentationSlide[]>([]);

  // ─── Data fetching ───────────────────────────

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [presRes, notesRes] = await Promise.all([
      supabase.from("presentations").select("*").order("updated_at", { ascending: false }),
      supabase.from("saved_lecture_notes").select("*").order("created_at", { ascending: false }),
    ]);
    if (presRes.data) setPresentations(presRes.data as unknown as SavedPresentation[]);
    if (notesRes.data) setNotes(notesRes.data as unknown as SavedNote[]);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  // ─── AI Generation ───────────────────────────

  const handleGenerate = async () => {
    if (!formTopic.trim()) {
      toast({ title: isAr ? "أدخل الموضوع" : "Enter a topic", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-presentation", {
        body: { topic: formTopic, gradeLevel: formGrade, subject: formSubject, duration: formDuration, language: formLang },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const slides = data.slides as PresentationSlide[];
      const title = data.title || formTopic;

      // Save to DB
      const { data: saved, error: saveErr } = await supabase.from("presentations").insert({
        teacher_id: user!.id,
        title,
        topic: formTopic,
        grade_level: formGrade,
        subject: formSubject,
        duration: formDuration,
        language: formLang,
        slides: slides as any,
        speaker_notes: slides.map(s => s.notes) as any,
        status: "draft",
      }).select().single();

      if (saveErr) throw saveErr;

      toast({ title: isAr ? "تم إنشاء العرض!" : "Presentation generated!" });
      setEditingPres(saved as unknown as SavedPresentation);
      setEditSlides(slides);
      setEditTitle(title);
      setView("editor");
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast({ title: isAr ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // ─── Save Edits ──────────────────────────────

  const handleSave = async () => {
    if (!editingPres) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("presentations").update({
        title: editTitle,
        slides: editSlides as any,
        speaker_notes: editSlides.map(s => s.notes) as any,
      }).eq("id", editingPres.id);
      if (error) throw error;
      toast({ title: isAr ? "تم الحفظ" : "Saved!" });
      fetchData();
    } catch (err: any) {
      toast({ title: isAr ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete Presentation ─────────────────────

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("presentations").delete().eq("id", id);
    if (!error) {
      toast({ title: isAr ? "تم الحذف" : "Deleted" });
      fetchData();
    }
  };

  // ─── Open Existing for Edit ──────────────────

  const openEditor = (pres: SavedPresentation) => {
    setEditingPres(pres);
    setEditSlides(pres.slides || []);
    setEditTitle(pres.title);
    setEditingSlideIdx(null);
    setView("editor");
  };

  // ─── Open Notes-based Presentation ───────────

  const openNotesPresentation = (note: SavedNote) => {
    setNoteSlides(notesToSlides(note));
    setCurrentSlide(0);
    setView("notes-present");
  };

  // ─── Slide Editor Helpers ────────────────────

  const updateSlide = (idx: number, updates: Partial<PresentationSlide>) => {
    setEditSlides(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const addSlide = (afterIdx: number) => {
    const newSlide: PresentationSlide = { title: isAr ? "شريحة جديدة" : "New Slide", bullets: [""], notes: "", type: "content" };
    setEditSlides(prev => [...prev.slice(0, afterIdx + 1), newSlide, ...prev.slice(afterIdx + 1)]);
  };

  const removeSlide = (idx: number) => {
    if (editSlides.length <= 1) return;
    setEditSlides(prev => prev.filter((_, i) => i !== idx));
    if (editingSlideIdx === idx) setEditingSlideIdx(null);
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= editSlides.length) return;
    setEditSlides(prev => {
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
    if (editingSlideIdx === idx) setEditingSlideIdx(newIdx);
  };

  // ─── PPT Export ──────────────────────────────

  const handleExportPPT = async (title: string, slides: PresentationSlide[]) => {
    setExporting(true);
    try {
      const pptx = exportPresentationToPPT({ title, slides }, isAr);
      await pptx.writeFile({ fileName: `${title.replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, "")}.pptx` });
      toast({ title: isAr ? "تم التحميل" : "Downloaded!" });
    } catch (err: any) {
      toast({ title: isAr ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  // ─── Presentation mode ───────────────────────

  const startPresent = () => {
    setCurrentSlide(0);
    setView("present");
  };

  const nextSlide = useCallback(() => {
    const slides = view === "notes-present" ? noteSlides : editSlides;
    setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  }, [view, noteSlides, editSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (view !== "present" && view !== "notes-present") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); nextSlide(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prevSlide(); }
      if (e.key === "Escape") { if (isFullscreen) toggleFullscreen(); else setView("editor"); }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, nextSlide, prevSlide, isFullscreen, toggleFullscreen]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Present Mode
  // ═══════════════════════════════════════════════════════════════

  if (view === "present" || view === "notes-present") {
    const slides = view === "notes-present" ? noteSlides : editSlides;
    const slide = slides[currentSlide];
    if (!slide) return null;
    const progress = ((currentSlide + 1) / slides.length) * 100;

    return (
      <AppLayout>
        <div ref={containerRef} className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background p-6" : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setView(view === "notes-present" ? "list" : "editor")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" /> {isAr ? "العودة" : "Back"}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">{currentSlide + 1} / {slides.length}</span>
              <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div
            className={`flex-1 bg-gradient-to-br ${SLIDE_TYPE_COLORS[slide.type] || SLIDE_TYPE_COLORS.content} bg-card rounded-2xl shadow-card border border-border flex flex-col items-center justify-center p-8 md:p-16 min-h-[400px] ${isFullscreen ? "min-h-[calc(100vh-10rem)]" : ""} cursor-pointer select-none`}
            onClick={nextSlide}
            dir={isAr ? "rtl" : "ltr"}
          >
            {slide.type === "title" ? (
              <div className="text-center max-w-2xl">
                <Presentation className="w-12 h-12 text-primary mx-auto mb-6 opacity-50" />
                <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">{slide.title}</h1>
                {slide.bullets.map((b, i) => <p key={i} className="text-lg md:text-xl text-muted-foreground leading-relaxed">{b}</p>)}
              </div>
            ) : (
              <div className="w-full max-w-3xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="text-primary opacity-60">{SLIDE_TYPE_ICONS[slide.type]}</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">{slide.title}</h2>
                </div>
                <div className="space-y-3">
                  {slide.bullets.map((b, i) => (
                    <p key={i} className="text-base md:text-lg text-card-foreground leading-relaxed">• {b}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button onClick={prevSlide} disabled={currentSlide === 0} className="p-3 rounded-xl bg-card shadow-card border border-border hover:bg-muted transition-colors disabled:opacity-30">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-all duration-200 ${i === currentSlide ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`} />
              ))}
            </div>
            <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="p-3 rounded-xl bg-card shadow-card border border-border hover:bg-muted transition-colors disabled:opacity-30">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Create Form
  // ═══════════════════════════════════════════════════════════════

  if (view === "create") {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" /> {isAr ? "العودة" : "Back"}
          </button>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" />
              {isAr ? "إنشاء عرض تقديمي بالذكاء الاصطناعي" : "AI Presentation Builder"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{isAr ? "أدخل تفاصيل الدرس وسيقوم الذكاء الاصطناعي بإنشاء العرض" : "Enter lesson details and AI will generate your presentation"}</p>
          </div>

          <div className="bg-card rounded-xl shadow-card border border-border p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{isAr ? "الموضوع *" : "Topic *"}</label>
              <input value={formTopic} onChange={e => setFormTopic(e.target.value)} maxLength={500}
                placeholder={isAr ? "مثال: الكسور العشرية" : "e.g. Decimal Fractions"}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{isAr ? "المرحلة الدراسية" : "Grade Level"}</label>
                <select value={formGrade} onChange={e => setFormGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                  <option value="">{isAr ? "اختر" : "Select"}</option>
                  <option value="Grade 1-3">{isAr ? "الصف 1-3" : "Grade 1-3"}</option>
                  <option value="Grade 4-6">{isAr ? "الصف 4-6" : "Grade 4-6"}</option>
                  <option value="Grade 7-9">{isAr ? "الصف 7-9" : "Grade 7-9"}</option>
                  <option value="Grade 10-12">{isAr ? "الصف 10-12" : "Grade 10-12"}</option>
                  <option value="University">{isAr ? "جامعة" : "University"}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{isAr ? "المادة" : "Subject"}</label>
                <select value={formSubject} onChange={e => setFormSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                  <option value="">{isAr ? "اختر" : "Select"}</option>
                  <option value="Mathematics">{isAr ? "رياضيات" : "Mathematics"}</option>
                  <option value="Science">{isAr ? "علوم" : "Science"}</option>
                  <option value="Arabic Language">{isAr ? "اللغة العربية" : "Arabic Language"}</option>
                  <option value="English Language">{isAr ? "اللغة الإنجليزية" : "English Language"}</option>
                  <option value="Islamic Studies">{isAr ? "التربية الإسلامية" : "Islamic Studies"}</option>
                  <option value="Quran">{isAr ? "القرآن الكريم" : "Quran"}</option>
                  <option value="Social Studies">{isAr ? "اجتماعيات" : "Social Studies"}</option>
                  <option value="History">{isAr ? "تاريخ" : "History"}</option>
                  <option value="Other">{isAr ? "أخرى" : "Other"}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{isAr ? "المدة" : "Duration"}</label>
                <select value={formDuration} onChange={e => setFormDuration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                  <option value="15 minutes">{isAr ? "15 دقيقة" : "15 minutes"}</option>
                  <option value="30 minutes">{isAr ? "30 دقيقة" : "30 minutes"}</option>
                  <option value="45 minutes">{isAr ? "45 دقيقة" : "45 minutes"}</option>
                  <option value="60 minutes">{isAr ? "60 دقيقة" : "60 minutes"}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{isAr ? "اللغة" : "Language"}</label>
                <select value={formLang} onChange={e => setFormLang(e.target.value as "ar" | "en")}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !formTopic.trim()}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? (isAr ? "جاري الإنشاء..." : "Generating...") : (isAr ? "إنشاء بالذكاء الاصطناعي" : "Generate with AI")}
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: Slide Editor
  // ═══════════════════════════════════════════════════════════════

  if (view === "editor" && editingPres) {
    return (
      <AppLayout>
        <div className="flex flex-col h-full">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <button onClick={() => { setView("list"); setEditingPres(null); }} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" /> {isAr ? "العودة" : "Back"}
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {isAr ? "حفظ" : "Save"}
              </button>
              <button onClick={() => handleExportPPT(editTitle, editSlides)} disabled={exporting} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50">
                {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                PPT
              </button>
              <button onClick={startPresent} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Play className="w-3.5 h-3.5" /> {isAr ? "عرض" : "Present"}
              </button>
            </div>
          </div>

          {/* Title */}
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
            className="text-2xl font-bold text-foreground bg-transparent border-b border-border pb-2 mb-4 focus:outline-none focus:border-primary" />

          {/* Slides list + editor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
            {/* Slide thumbnails */}
            <div className="lg:col-span-1 space-y-2 overflow-y-auto max-h-[70vh] pr-1">
              {editSlides.map((slide, idx) => (
                <div key={idx} onClick={() => setEditingSlideIdx(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${editingSlideIdx === idx ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/30"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground w-5">{idx + 1}</span>
                    <div className="text-primary/60">{SLIDE_TYPE_ICONS[slide.type]}</div>
                    <span className="text-xs font-medium text-foreground truncate flex-1">{slide.title}</span>
                    <div className="flex items-center gap-0.5">
                      <button onClick={e => { e.stopPropagation(); moveSlide(idx, -1); }} disabled={idx === 0} className="p-0.5 rounded hover:bg-muted disabled:opacity-20"><ArrowUp className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); moveSlide(idx, 1); }} disabled={idx === editSlides.length - 1} className="p-0.5 rounded hover:bg-muted disabled:opacity-20"><ArrowDown className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); removeSlide(idx); }} disabled={editSlides.length <= 1} className="p-0.5 rounded hover:bg-destructive/10 text-destructive/60 disabled:opacity-20"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate ml-7">{slide.bullets[0] || ""}</p>
                </div>
              ))}
              <button onClick={() => addSlide(editSlides.length - 1)}
                className="w-full py-2 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
                <Plus className="w-3 h-3" /> {isAr ? "إضافة شريحة" : "Add Slide"}
              </button>
            </div>

            {/* Slide detail editor */}
            <div className="lg:col-span-2">
              {editingSlideIdx !== null && editSlides[editingSlideIdx] ? (
                <div className="bg-card rounded-xl shadow-card border border-border p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">{SLIDE_TYPE_ICONS[editSlides[editingSlideIdx].type]}</div>
                    <select value={editSlides[editingSlideIdx].type}
                      onChange={e => updateSlide(editingSlideIdx, { type: e.target.value as PresentationSlide["type"] })}
                      className="text-xs rounded-lg border border-border bg-background px-2 py-1 text-foreground">
                      <option value="title">{isAr ? "عنوان" : "Title"}</option>
                      <option value="content">{isAr ? "محتوى" : "Content"}</option>
                      <option value="examples">{isAr ? "أمثلة" : "Examples"}</option>
                      <option value="discussion">{isAr ? "نقاش" : "Discussion"}</option>
                      <option value="summary">{isAr ? "ملخص" : "Summary"}</option>
                      <option value="quran">{isAr ? "قرآن" : "Quran"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{isAr ? "عنوان الشريحة" : "Slide Title"}</label>
                    <input value={editSlides[editingSlideIdx].title}
                      onChange={e => updateSlide(editingSlideIdx, { title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm mt-1 focus:ring-2 focus:ring-primary/30 outline-none" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{isAr ? "النقاط" : "Bullet Points"}</label>
                    <div className="space-y-2 mt-1">
                      {editSlides[editingSlideIdx].bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground mt-2.5">•</span>
                          <textarea value={bullet} rows={2}
                            onChange={e => {
                              const newBullets = [...editSlides[editingSlideIdx].bullets];
                              newBullets[bIdx] = e.target.value;
                              updateSlide(editingSlideIdx, { bullets: newBullets });
                            }}
                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none focus:ring-2 focus:ring-primary/30 outline-none" />
                          <button onClick={() => {
                            const newBullets = editSlides[editingSlideIdx].bullets.filter((_, i) => i !== bIdx);
                            updateSlide(editingSlideIdx, { bullets: newBullets.length ? newBullets : [""] });
                          }} className="p-1 mt-1 rounded hover:bg-destructive/10 text-destructive/60"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const newBullets = [...editSlides[editingSlideIdx].bullets, ""];
                        updateSlide(editingSlideIdx, { bullets: newBullets });
                      }} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> {isAr ? "إضافة نقطة" : "Add bullet"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">{isAr ? "ملاحظات المتحدث" : "Speaker Notes"}</label>
                    <textarea value={editSlides[editingSlideIdx].notes} rows={3}
                      onChange={e => updateSlide(editingSlideIdx, { notes: e.target.value })}
                      placeholder={isAr ? "ملاحظات خاصة بالمعلم..." : "Private notes for the teacher..."}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm mt-1 resize-none focus:ring-2 focus:ring-primary/30 outline-none" />
                  </div>

                  {/* Preview */}
                  <div className={`bg-gradient-to-br ${SLIDE_TYPE_COLORS[editSlides[editingSlideIdx].type] || SLIDE_TYPE_COLORS.content} rounded-xl p-6 min-h-[200px]`}
                    dir={editingPres.language === "ar" ? "rtl" : "ltr"}>
                    <h3 className="text-xl font-bold text-foreground mb-3">{editSlides[editingSlideIdx].title}</h3>
                    {editSlides[editingSlideIdx].bullets.filter(b => b).map((b, i) => (
                      <p key={i} className="text-sm text-card-foreground mb-1">• {b}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-xl shadow-card border border-border p-12 text-center text-muted-foreground text-sm">
                  {isAr ? "اختر شريحة للتعديل" : "Select a slide to edit"}
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: List View (default)
  // ═══════════════════════════════════════════════════════════════

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Presentation className="w-8 h-8 text-primary" />
            {isAr ? "العروض التقديمية" : "Presentations"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isAr ? "أنشئ عروضاً تقديمية بالذكاء الاصطناعي أو من ملاحظات المحاضرة" : "Create AI presentations or from lecture notes"}
          </p>
        </div>
        <button onClick={() => setView("create")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> {isAr ? "إنشاء عرض جديد" : "Create Presentation"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-8">
          {/* AI Generated Presentations */}
          {presentations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> {isAr ? "عروض الذكاء الاصطناعي" : "AI Presentations"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presentations.map(pres => (
                  <div key={pres.id} className="bg-card rounded-xl shadow-card p-5 border border-border group hover:shadow-lg hover:scale-[1.01] transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-card-foreground text-sm truncate">{pres.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{pres.subject} • {pres.grade_level}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {(pres.slides as any[])?.length || 0} {isAr ? "شريحة" : "slides"} • {new Date(pres.updated_at).toLocaleDateString(isAr ? "ar" : "en", { dateStyle: "medium" })}
                        </p>
                      </div>
                      <button onClick={() => handleDelete(pres.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => openEditor(pres)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <Edit3 className="w-3 h-3" /> {isAr ? "تعديل" : "Edit"}
                      </button>
                      <button onClick={() => handleExportPPT(pres.title, pres.slides)} disabled={exporting}
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50">
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lecture Notes Presentations */}
          {notes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" /> {isAr ? "من ملاحظات المحاضرة" : "From Lecture Notes"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(note => (
                  <div key={note.id} className="bg-card rounded-xl shadow-card p-5 border border-border hover:shadow-lg hover:scale-[1.01] transition-all">
                    <button onClick={() => openNotesPresentation(note)} className="w-full text-left">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Play className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-card-foreground text-sm truncate">{note.title}</p>
                          {note.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.summary}</p>}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(note.created_at).toLocaleDateString(isAr ? "ar" : "en", { dateStyle: "medium" })}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => handleExportPPT(note.title, notesToSlides(note))} disabled={exporting}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
                      {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      {isAr ? "تحميل PPT" : "Download PPT"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {presentations.length === 0 && notes.length === 0 && (
            <div className="bg-card rounded-xl shadow-card p-12 text-center">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-semibold text-card-foreground mb-1">{isAr ? "لا توجد عروض تقديمية" : "No presentations yet"}</p>
              <p className="text-sm text-muted-foreground mb-4">{isAr ? "أنشئ عرضاً تقديمياً بالذكاء الاصطناعي" : "Create your first AI-powered presentation"}</p>
              <button onClick={() => setView("create")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> {isAr ? "إنشاء عرض" : "Create Presentation"}
              </button>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default Presentations;
