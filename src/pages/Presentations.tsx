import { useState, useEffect, useCallback, useRef } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Presentation, ChevronLeft, ChevronRight, Play, Maximize2, Minimize2,
  FileText, Loader2, Lightbulb, BookOpen, HelpCircle, List
} from "lucide-react";

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

interface Slide {
  title: string;
  content: string[];
  type: "title" | "content" | "terms" | "qa" | "highlights";
  icon?: React.ReactNode;
}

const generateSlides = (note: SavedNote): Slide[] => {
  const slides: Slide[] = [];

  // Title slide
  slides.push({
    title: note.title,
    content: note.summary ? [note.summary] : [],
    type: "title",
  });

  // Section slides
  note.sections?.forEach((sec) => {
    slides.push({
      title: sec.heading,
      content: [sec.content],
      type: "content",
      icon: sec.type === "definition" ? <BookOpen className="w-6 h-6" /> :
            sec.type === "key_point" || sec.type === "concept" ? <Lightbulb className="w-6 h-6" /> :
            sec.type === "question_answer" ? <HelpCircle className="w-6 h-6" /> :
            <FileText className="w-6 h-6" />,
    });
  });

  // Key terms slide(s) — group 4 per slide
  if (note.key_terms?.length > 0) {
    for (let i = 0; i < note.key_terms.length; i += 4) {
      const chunk = note.key_terms.slice(i, i + 4);
      slides.push({
        title: "Key Terms",
        content: chunk.map(kt => `**${kt.term}**: ${kt.definition}`),
        type: "terms",
      });
    }
  }

  // Q&A slides — group 2 per slide
  if (note.questions_and_answers?.length > 0) {
    for (let i = 0; i < note.questions_and_answers.length; i += 2) {
      const chunk = note.questions_and_answers.slice(i, i + 2);
      slides.push({
        title: "Questions & Answers",
        content: chunk.map(qa => `❓ ${qa.question}\n💡 ${qa.answer}`),
        type: "qa",
      });
    }
  }

  // Highlights slide
  if (note.highlights?.length > 0) {
    slides.push({
      title: "Key Highlights",
      content: note.highlights.map(h => `⭐ ${h}`),
      type: "highlights",
    });
  }

  return slides;
};

const SLIDE_COLORS: Record<Slide["type"], string> = {
  title: "from-primary/20 to-secondary/20",
  content: "from-blue-500/10 to-cyan-500/10",
  terms: "from-amber-500/10 to-orange-500/10",
  qa: "from-purple-500/10 to-pink-500/10",
  highlights: "from-emerald-500/10 to-teal-500/10",
};

const Presentations = () => {
  const { language } = useAppContext();
  const { user } = useAuth();
  const isAr = language === "ar";
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("saved_lecture_notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setNotes(data as unknown as SavedNote[]);
    setLoading(false);
  };

  const handleSelectNote = (note: SavedNote) => {
    setSelectedNote(note);
    setSlides(generateSlides(note));
    setCurrentSlide(0);
  };

  const handleBack = () => {
    setSelectedNote(null);
    setSlides([]);
    setCurrentSlide(0);
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

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
    const onFsChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (!selectedNote) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); nextSlide(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prevSlide(); }
      if (e.key === "Escape" && isFullscreen) toggleFullscreen();
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNote, nextSlide, prevSlide, isFullscreen, toggleFullscreen]);

  // Note selection view
  if (!selectedNote) {
    return (
      <AppLayout>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Presentation className="w-8 h-8 text-primary" />
            {isAr ? "العروض التقديمية" : "Presentations"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAr ? "حوّل ملاحظات المحاضرة إلى عروض تقديمية تفاعلية" : "Convert your lecture notes into interactive presentations"}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-card rounded-xl shadow-card p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-semibold text-card-foreground mb-1">
              {isAr ? "لا توجد ملاحظات محفوظة" : "No saved notes yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isAr ? "سجّل محاضرة في صفحة ملاحظات المحاضرة واحفظها أولاً" : "Record a lecture in Lecture Notes and save it first"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className="bg-card rounded-xl shadow-card p-5 text-left hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border border-border group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Play className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-card-foreground text-sm truncate">{note.title}</p>
                    {note.summary && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.summary}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                      <span>{new Date(note.created_at).toLocaleDateString(isAr ? "ar" : "en", { dateStyle: "medium" })}</span>
                      <span>•</span>
                      <span>{(note.sections?.length || 0) + (note.key_terms?.length > 0 ? 1 : 0) + (note.highlights?.length > 0 ? 1 : 0) + 1} {isAr ? "شريحة" : "slides"}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </AppLayout>
    );
  }

  // Presentation view
  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <AppLayout>
      <div ref={containerRef} className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background p-6" : ""}`}>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {isAr ? "العودة" : "Back"}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen (F)"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Slide */}
        <div
          className={`flex-1 bg-gradient-to-br ${SLIDE_COLORS[slide.type]} bg-card rounded-2xl shadow-card border border-border flex flex-col items-center justify-center p-8 md:p-16 min-h-[400px] ${isFullscreen ? "min-h-[calc(100vh-10rem)]" : ""} cursor-pointer select-none`}
          onClick={nextSlide}
        >
          {slide.type === "title" ? (
            <div className="text-center max-w-2xl">
              <Presentation className="w-12 h-12 text-primary mx-auto mb-6 opacity-50" />
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">{slide.title}</h1>
              {slide.content.map((c, i) => (
                <p key={i} className="text-lg md:text-xl text-muted-foreground leading-relaxed">{c}</p>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-3xl">
              <div className="flex items-center gap-3 mb-8">
                {slide.icon && <div className="text-primary opacity-60">{slide.icon}</div>}
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{slide.title}</h2>
              </div>
              <div className="space-y-4">
                {slide.content.map((c, i) => (
                  <div key={i} className="text-base md:text-lg text-card-foreground leading-relaxed">
                    {c.split("\n").map((line, j) => (
                      <p key={j} className={j > 0 ? "mt-1 text-muted-foreground text-sm md:text-base" : "font-medium"}>
                        {line.startsWith("**") ? (
                          <>
                            <span className="font-bold text-foreground">{line.replace(/\*\*/g, "").split(":")[0]}</span>
                            <span className="text-muted-foreground">: {line.replace(/\*\*/g, "").split(":").slice(1).join(":")}</span>
                          </>
                        ) : line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-3 rounded-xl bg-card shadow-card border border-border hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Slide dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === currentSlide ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="p-3 rounded-xl bg-card shadow-card border border-border hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Presentations;
