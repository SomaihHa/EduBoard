import { useState, useRef, useCallback } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, Play, Pause, Square, RotateCcw, ChevronRight, ChevronDown, Volume2, Loader2, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Available Qurra (reciters) with their CDN identifiers
const qurraa = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy", nameAr: "مشاري راشد العفاسي" },
  { id: "ar.abdurrahmaansudais", name: "Abdurrahman As-Sudais", nameAr: "عبدالرحمن السديس" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", nameAr: "محمود خليل الحصري" },
  { id: "ar.minshawi", name: "Mohamed Siddiq Al-Minshawi", nameAr: "محمد صديق المنشاوي" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)", nameAr: "عبدالباسط عبدالصمد (مرتّل)" },
  { id: "ar.ahmedajamy", name: "Ahmed Al-Ajamy", nameAr: "أحمد العجمي" },
];

// Surah numbers in the Quran for the API
const surahs = [
  { name: "Al-Fatiha", nameAr: "الفاتحة", verses: 7, difficulty: "Easy", number: 1 },
  { name: "Al-Baqarah", nameAr: "البقرة", verses: 286, difficulty: "Hard", number: 2 },
  { name: "Al-Ikhlas", nameAr: "الإخلاص", verses: 4, difficulty: "Easy", number: 112 },
  { name: "Al-Falaq", nameAr: "الفلق", verses: 5, difficulty: "Easy", number: 113 },
  { name: "An-Nas", nameAr: "الناس", verses: 6, difficulty: "Easy", number: 114 },
  { name: "Ya-Sin", nameAr: "يس", verses: 83, difficulty: "Medium", number: 36 },
];

const surahVerses: Record<number, { arabic: string; translation: string }[]> = {
  0: [
    { arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", translation: "In the name of Allah, the Most Gracious, the Most Merciful" },
    { arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "Praise be to Allah, Lord of all the worlds" },
    { arabic: "الرَّحْمَنِ الرَّحِيمِ", translation: "The Most Gracious, the Most Merciful" },
    { arabic: "مَالِكِ يَوْمِ الدِّينِ", translation: "Master of the Day of Judgment" },
    { arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "You alone we worship, and You alone we ask for help" },
    { arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us on the Straight Path" },
    { arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "The path of those You have blessed, not of those who incurred wrath, nor of those who went astray" },
  ],
  2: [
    { arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", translation: "In the name of Allah, the Most Gracious, the Most Merciful" },
    { arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say: He is Allah, the One" },
    { arabic: "اللَّهُ الصَّمَدُ", translation: "Allah, the Eternal Refuge" },
    { arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born" },
    { arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation: "Nor is there to Him any equivalent" },
  ],
  3: [
    { arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", translation: "In the name of Allah, the Most Gracious, the Most Merciful" },
    { arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", translation: "Say: I seek refuge in the Lord of daybreak" },
    { arabic: "مِن شَرِّ مَا خَلَقَ", translation: "From the evil of that which He created" },
    { arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "And from the evil of darkness when it settles" },
    { arabic: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", translation: "And from the evil of the blowers in knots" },
    { arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", translation: "And from the evil of an envier when he envies" },
  ],
};

const surahStartAyah: Record<number, number> = {
  1: 1, 2: 8, 36: 2596, 112: 6222, 113: 6226, 114: 6231,
};

const getAbsoluteAyahNumber = (surahNum: number, ayahNum: number): number => {
  const start = surahStartAyah[surahNum];
  if (!start) return 1;
  return start + ayahNum - 1;
};

interface TajweedResult {
  accuracyScore: number;
  tajweedRules: { rule: string; status: string; details: string }[];
  mistakes: { word: string; issue: string; correction: string }[];
  feedback: string;
  improvementTip: string;
}

const PracticeRoom = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const [selectedSurah, setSelectedSurah] = useState(0);
  const [tajweedResult, setTajweedResult] = useState<TajweedResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Qari state
  const [selectedQari, setSelectedQari] = useState(0);
  const [qariDropdownOpen, setQariDropdownOpen] = useState(false);
  const [isPlayingQari, setIsPlayingQari] = useState(false);
  const [isPausedQari, setIsPausedQari] = useState(false);
  const [isLoadingQari, setIsLoadingQari] = useState(false);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const qariAudioRef = useRef<HTMLAudioElement | null>(null);
  const playNextRef = useRef<((index: number) => void) | null>(null);

  const { isRecording, audioUrl, startRecording, stopRecording, resetRecording, error: recError } = useAudioRecorder();
  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, isSupported, error: speechError } = useSpeechRecognition();

  const verses = surahVerses[selectedSurah] || surahVerses[0];
  const fullSurahText = verses.map((v) => v.arabic).join(" ");

  const getAudioUrl = useCallback((ayahIndex: number, qariIdx?: number) => {
    const surahNum = surahs[selectedSurah].number;
    const absNum = getAbsoluteAyahNumber(surahNum, ayahIndex + 1);
    const qari = qurraa[qariIdx ?? selectedQari].id;
    return `https://cdn.islamic.network/quran/audio/128/${qari}/${absNum}.mp3`;
  }, [selectedSurah, selectedQari]);

  const stopQari = useCallback(() => {
    if (qariAudioRef.current) {
      qariAudioRef.current.pause();
      qariAudioRef.current.currentTime = 0;
      qariAudioRef.current = null;
    }
    setIsPlayingQari(false);
    setIsPausedQari(false);
    setPlayingAyah(null);
    setIsLoadingQari(false);
    playNextRef.current = null;
  }, []);

  const pauseQari = useCallback(() => {
    if (qariAudioRef.current && isPlayingQari) {
      qariAudioRef.current.pause();
      setIsPlayingQari(false);
      setIsPausedQari(true);
    }
  }, [isPlayingQari]);

  const resumeQari = useCallback(() => {
    if (qariAudioRef.current && isPausedQari) {
      qariAudioRef.current.play();
      setIsPlayingQari(true);
      setIsPausedQari(false);
    }
  }, [isPausedQari]);

  const playAyah = useCallback((ayahIndex: number) => {
    stopQari();
    const url = getAudioUrl(ayahIndex);
    setPlayingAyah(ayahIndex);
    setIsLoadingQari(true);

    const audio = new Audio(url);
    qariAudioRef.current = audio;

    audio.oncanplaythrough = () => { setIsLoadingQari(false); setIsPlayingQari(true); audio.play(); };
    audio.onended = () => { setIsPlayingQari(false); setPlayingAyah(null); };
    audio.onerror = () => {
      stopQari();
      toast({ title: isAr ? "خطأ" : "Error", description: isAr ? "تعذّر تحميل الصوت" : "Could not load audio", variant: "destructive" });
    };
  }, [getAudioUrl, isAr, stopQari]);

  const playFullSurah = useCallback((startFrom = 0) => {
    stopQari();
    const totalAyahs = verses.length;

    const playNext = (index: number) => {
      if (index >= totalAyahs) { stopQari(); return; }
      const url = getAudioUrl(index);
      const audio = new Audio(url);
      qariAudioRef.current = audio;
      setPlayingAyah(index);
      setIsLoadingQari(true);

      audio.oncanplaythrough = () => { setIsLoadingQari(false); audio.play(); };
      audio.onended = () => playNext(index + 1);
      audio.onerror = () => stopQari();
    };

    playNextRef.current = playNext;
    setIsPlayingQari(true);
    playNext(startFrom);
  }, [getAudioUrl, verses.length, stopQari]);

  const restartQari = useCallback(() => playFullSurah(0), [playFullSurah]);

  // --- Recording handlers ---
  const handleStartRecording = async () => {
    setTajweedResult(null);
    resetTranscript();
    await startRecording();
    startListening("ar-SA");
  };

  const handleStopRecording = async () => {
    stopRecording();
    stopListening();
    setTimeout(async () => {
      const recitedText = transcript || interimTranscript;
      if (!recitedText.trim()) {
        toast({ title: isAr ? "لم يتم التعرف على الكلام" : "No speech detected", description: isAr ? "حاول مرة أخرى" : "Try again", variant: "destructive" });
        return;
      }
      await analyzeTajweed(recitedText);
    }, 500);
  };

  const analyzeTajweed = async (recitedText: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-analyze", {
        body: { action: "tajweed-check", text: `Correct text:\n${fullSurahText}\n\nStudent recited:\n${recitedText}`, language: "ar" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTajweedResult(data);
    } catch (err: any) {
      console.error("Tajweed analysis error:", err);
      toast({ title: isAr ? "خطأ" : "Error", description: err.message || "Analysis failed", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    resetRecording();
    resetTranscript();
    setTajweedResult(null);
    stopQari();
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "غرفة التمرين - تلاوة القرآن" : "Practice Room — Quran Recitation"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "تدرب على التلاوة واحصل على تقييم فوري بالذكاء الاصطناعي" : "Practice recitation and get instant AI Tajweed feedback"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Surah list */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="font-semibold text-card-foreground mb-3 text-sm">
            {isAr ? "اختر السورة" : "Select Surah"}
          </h3>
          <div className="space-y-1">
            {surahs.map((s, i) => (
              <button
                key={i}
                onClick={() => { setSelectedSurah(i); setTajweedResult(null); stopQari(); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                  selectedSurah === i ? "bg-primary text-primary-foreground" : "hover:bg-muted text-card-foreground"
                }`}
              >
                <span className="font-medium">{isAr ? s.nameAr : s.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Main recitation area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Qari Selector + Controls */}
          <div className="bg-card rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold text-card-foreground text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {isAr ? "القارئ" : "Qari"}
              </h3>
              <div className="relative">
                <button
                  onClick={() => setQariDropdownOpen(!qariDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm font-medium text-card-foreground hover:bg-muted/80 transition-colors"
                >
                  <span className="truncate max-w-[180px]">{isAr ? qurraa[selectedQari].nameAr : qurraa[selectedQari].name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${qariDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {qariDropdownOpen && (
                  <div className="absolute top-full mt-1 right-0 rtl:right-auto rtl:left-0 w-72 bg-card border border-border rounded-xl shadow-elevated z-50 py-1 max-h-60 overflow-y-auto">
                    {qurraa.map((q, i) => (
                      <button
                        key={q.id}
                        onClick={() => { stopQari(); setSelectedQari(i); setQariDropdownOpen(false); }}
                        className={`w-full text-left rtl:text-right px-4 py-2.5 text-sm transition-colors ${
                          selectedQari === i ? "bg-primary/10 text-primary font-semibold" : "text-card-foreground hover:bg-muted"
                        }`}
                      >
                        {isAr ? q.nameAr : q.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Transport controls: Restart | Play/Pause | Stop */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={restartQari}
                disabled={!isPlayingQari && !isPausedQari}
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors disabled:opacity-30"
                title={isAr ? "إعادة" : "Restart"}
              >
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              </button>

              <button
                onClick={() => {
                  if (isPlayingQari) pauseQari();
                  else if (isPausedQari) resumeQari();
                  else playFullSurah(0);
                }}
                disabled={isLoadingQari}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isPlayingQari ? "bg-secondary text-secondary-foreground" : "bg-gradient-primary text-primary-foreground hover:scale-105"
                }`}
              >
                {isLoadingQari ? <Loader2 className="w-5 h-5 animate-spin" /> : isPlayingQari ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                onClick={stopQari}
                disabled={!isPlayingQari && !isPausedQari}
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors disabled:opacity-30"
                title={isAr ? "إيقاف" : "Stop"}
              >
                <Square className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {(isPlayingQari || isPausedQari) && (
              <p className="text-center text-xs text-muted-foreground mt-2">
                {isPlayingQari && <span className="text-secondary animate-pulse">● </span>}
                {isPausedQari && <span className="text-warning">⏸ </span>}
                {isAr ? qurraa[selectedQari].nameAr : qurraa[selectedQari].name}
                {playingAyah !== null && ` — ${isAr ? "آية" : "Ayah"} ${playingAyah + 1}`}
              </p>
            )}
          </div>

          {/* Verse display */}
          <div className="bg-card rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                {isAr ? surahs[selectedSurah].nameAr : surahs[selectedSurah].name}
              </h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {verses.length} {isAr ? "آية" : "verses"}
              </span>
            </div>

            <div className="space-y-3">
              {verses.map((v, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    playingAyah === i ? "bg-primary/10 ring-2 ring-primary/30" : "bg-muted/30"
                  }`}
                >
                  <p className="quran-text text-card-foreground text-center leading-loose" dir="rtl">{v.arabic}</p>
                  <p className="text-xs text-muted-foreground text-center mt-2">{v.translation}</p>
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => playAyah(i)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        playingAyah === i && (isPlayingQari || isPausedQari)
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10"
                      }`}
                    >
                      {playingAyah === i && isLoadingQari ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : playingAyah === i && isPlayingQari ? (
                        <Volume2 className="w-3 h-3 animate-pulse" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      {playingAyah === i && isPlayingQari ? (isAr ? "يُتلى..." : "Playing...") : (isAr ? "استمع" : "Listen")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live transcript */}
          {(transcript || interimTranscript) && (
            <div className="bg-card rounded-xl shadow-card p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                {isAr ? "ما تم سماعه" : "What AI Heard"}
              </h4>
              <p className="text-sm text-card-foreground font-arabic" dir="rtl">
                {transcript}
                {interimTranscript && <span className="text-muted-foreground italic"> {interimTranscript}</span>}
              </p>
            </div>
          )}

          {/* Recording controls */}
          <div className="bg-card rounded-xl shadow-card p-5 flex flex-col items-center gap-3">
            {(recError || speechError) && <p className="text-xs text-destructive">{recError || speechError}</p>}
            {!isSupported && <p className="text-xs text-warning">{isAr ? "المتصفح لا يدعم التعرف على الكلام" : "Speech recognition not supported in this browser"}</p>}
            <div className="flex items-center gap-4">
              <button onClick={handleReset} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                <RotateCcw className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isAnalyzing}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording ? "bg-destructive text-destructive-foreground scale-110 animate-pulse" : "bg-gradient-primary text-primary-foreground hover:scale-105"
                } disabled:opacity-50`}
              >
                {isAnalyzing ? <Loader2 className="w-7 h-7 animate-spin" /> : isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
              {audioUrl && (
                <button onClick={() => { const a = new Audio(audioUrl); a.play(); }} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <Play className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>
            {isRecording && (
              <p className="text-xs text-success animate-pulse">
                {isAr ? "🎙️ جارٍ الاستماع... اقرأ الآيات" : "🎙️ Listening... Recite the verses"}
              </p>
            )}
          </div>
        </div>

        {/* Feedback panel */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl shadow-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-2">{isAr ? "الدقة الحالية" : "Current Accuracy"}</p>
            <p className="text-5xl font-bold text-gradient-primary">
              {tajweedResult ? `${tajweedResult.accuracyScore}%` : "—"}
            </p>
            {tajweedResult?.feedback && <p className="text-xs text-success mt-2">{tajweedResult.feedback}</p>}
          </div>

          <div className="bg-card rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-card-foreground mb-3 text-sm">{isAr ? "أحكام التجويد" : "Tajweed Rules"}</h3>
            {tajweedResult?.tajweedRules ? (
              <div className="space-y-2">
                {tajweedResult.tajweedRules.map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-card-foreground">{t.rule}</span>
                    <span>{t.status === "correct" ? "✅" : t.status === "warning" ? "⚠️" : "❌"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{isAr ? "سجّل تلاوتك لرؤية التقييم" : "Record your recitation to see evaluation"}</p>
            )}
          </div>

          {tajweedResult?.mistakes && tajweedResult.mistakes.length > 0 && (
            <div className="bg-card rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-card-foreground mb-3 text-sm">{isAr ? "الأخطاء" : "Mistakes"}</h3>
              <div className="space-y-2">
                {tajweedResult.mistakes.map((m, i) => (
                  <div key={i} className="bg-destructive/5 rounded-lg p-2">
                    <p className="text-sm font-medium text-card-foreground font-arabic" dir="rtl">{m.word}</p>
                    <p className="text-xs text-muted-foreground">{m.issue}</p>
                    <p className="text-xs text-success">{m.correction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tajweedResult?.improvementTip && (
            <div className="bg-mint rounded-xl p-4">
              <p className="text-sm font-medium text-foreground">💡 {tajweedResult.improvementTip}</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default PracticeRoom;
