import { useState, useRef, useCallback, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, Play, Pause, Square, RotateCcw, ChevronRight, ChevronDown, Volume2, Loader2, User, X, Pin, PinOff, Trash2, Clock, Search } from "lucide-react";
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

// All 114 Surahs of the Quran
const allSurahs = [
  { number: 1, name: "Al-Fatiha", nameAr: "الفاتحة", verses: 7, type: "Meccan" },
  { number: 2, name: "Al-Baqarah", nameAr: "البقرة", verses: 286, type: "Medinan" },
  { number: 3, name: "Ali 'Imran", nameAr: "آل عمران", verses: 200, type: "Medinan" },
  { number: 4, name: "An-Nisa", nameAr: "النساء", verses: 176, type: "Medinan" },
  { number: 5, name: "Al-Ma'idah", nameAr: "المائدة", verses: 120, type: "Medinan" },
  { number: 6, name: "Al-An'am", nameAr: "الأنعام", verses: 165, type: "Meccan" },
  { number: 7, name: "Al-A'raf", nameAr: "الأعراف", verses: 206, type: "Meccan" },
  { number: 8, name: "Al-Anfal", nameAr: "الأنفال", verses: 75, type: "Medinan" },
  { number: 9, name: "At-Tawbah", nameAr: "التوبة", verses: 129, type: "Medinan" },
  { number: 10, name: "Yunus", nameAr: "يونس", verses: 109, type: "Meccan" },
  { number: 11, name: "Hud", nameAr: "هود", verses: 123, type: "Meccan" },
  { number: 12, name: "Yusuf", nameAr: "يوسف", verses: 111, type: "Meccan" },
  { number: 13, name: "Ar-Ra'd", nameAr: "الرعد", verses: 43, type: "Medinan" },
  { number: 14, name: "Ibrahim", nameAr: "إبراهيم", verses: 52, type: "Meccan" },
  { number: 15, name: "Al-Hijr", nameAr: "الحجر", verses: 99, type: "Meccan" },
  { number: 16, name: "An-Nahl", nameAr: "النحل", verses: 128, type: "Meccan" },
  { number: 17, name: "Al-Isra", nameAr: "الإسراء", verses: 111, type: "Meccan" },
  { number: 18, name: "Al-Kahf", nameAr: "الكهف", verses: 110, type: "Meccan" },
  { number: 19, name: "Maryam", nameAr: "مريم", verses: 98, type: "Meccan" },
  { number: 20, name: "Taha", nameAr: "طه", verses: 135, type: "Meccan" },
  { number: 21, name: "Al-Anbiya", nameAr: "الأنبياء", verses: 112, type: "Meccan" },
  { number: 22, name: "Al-Hajj", nameAr: "الحج", verses: 78, type: "Medinan" },
  { number: 23, name: "Al-Mu'minun", nameAr: "المؤمنون", verses: 118, type: "Meccan" },
  { number: 24, name: "An-Nur", nameAr: "النور", verses: 64, type: "Medinan" },
  { number: 25, name: "Al-Furqan", nameAr: "الفرقان", verses: 77, type: "Meccan" },
  { number: 26, name: "Ash-Shu'ara", nameAr: "الشعراء", verses: 227, type: "Meccan" },
  { number: 27, name: "An-Naml", nameAr: "النمل", verses: 93, type: "Meccan" },
  { number: 28, name: "Al-Qasas", nameAr: "القصص", verses: 88, type: "Meccan" },
  { number: 29, name: "Al-Ankabut", nameAr: "العنكبوت", verses: 69, type: "Meccan" },
  { number: 30, name: "Ar-Rum", nameAr: "الروم", verses: 60, type: "Meccan" },
  { number: 31, name: "Luqman", nameAr: "لقمان", verses: 34, type: "Meccan" },
  { number: 32, name: "As-Sajdah", nameAr: "السجدة", verses: 30, type: "Meccan" },
  { number: 33, name: "Al-Ahzab", nameAr: "الأحزاب", verses: 73, type: "Medinan" },
  { number: 34, name: "Saba", nameAr: "سبأ", verses: 54, type: "Meccan" },
  { number: 35, name: "Fatir", nameAr: "فاطر", verses: 45, type: "Meccan" },
  { number: 36, name: "Ya-Sin", nameAr: "يس", verses: 83, type: "Meccan" },
  { number: 37, name: "As-Saffat", nameAr: "الصافات", verses: 182, type: "Meccan" },
  { number: 38, name: "Sad", nameAr: "ص", verses: 88, type: "Meccan" },
  { number: 39, name: "Az-Zumar", nameAr: "الزمر", verses: 75, type: "Meccan" },
  { number: 40, name: "Ghafir", nameAr: "غافر", verses: 85, type: "Meccan" },
  { number: 41, name: "Fussilat", nameAr: "فصلت", verses: 54, type: "Meccan" },
  { number: 42, name: "Ash-Shura", nameAr: "الشورى", verses: 53, type: "Meccan" },
  { number: 43, name: "Az-Zukhruf", nameAr: "الزخرف", verses: 89, type: "Meccan" },
  { number: 44, name: "Ad-Dukhan", nameAr: "الدخان", verses: 59, type: "Meccan" },
  { number: 45, name: "Al-Jathiyah", nameAr: "الجاثية", verses: 37, type: "Meccan" },
  { number: 46, name: "Al-Ahqaf", nameAr: "الأحقاف", verses: 35, type: "Meccan" },
  { number: 47, name: "Muhammad", nameAr: "محمد", verses: 38, type: "Medinan" },
  { number: 48, name: "Al-Fath", nameAr: "الفتح", verses: 29, type: "Medinan" },
  { number: 49, name: "Al-Hujurat", nameAr: "الحجرات", verses: 18, type: "Medinan" },
  { number: 50, name: "Qaf", nameAr: "ق", verses: 45, type: "Meccan" },
  { number: 51, name: "Adh-Dhariyat", nameAr: "الذاريات", verses: 60, type: "Meccan" },
  { number: 52, name: "At-Tur", nameAr: "الطور", verses: 49, type: "Meccan" },
  { number: 53, name: "An-Najm", nameAr: "النجم", verses: 62, type: "Meccan" },
  { number: 54, name: "Al-Qamar", nameAr: "القمر", verses: 55, type: "Meccan" },
  { number: 55, name: "Ar-Rahman", nameAr: "الرحمن", verses: 78, type: "Medinan" },
  { number: 56, name: "Al-Waqi'ah", nameAr: "الواقعة", verses: 96, type: "Meccan" },
  { number: 57, name: "Al-Hadid", nameAr: "الحديد", verses: 29, type: "Medinan" },
  { number: 58, name: "Al-Mujadila", nameAr: "المجادلة", verses: 22, type: "Medinan" },
  { number: 59, name: "Al-Hashr", nameAr: "الحشر", verses: 24, type: "Medinan" },
  { number: 60, name: "Al-Mumtahanah", nameAr: "الممتحنة", verses: 13, type: "Medinan" },
  { number: 61, name: "As-Saf", nameAr: "الصف", verses: 14, type: "Medinan" },
  { number: 62, name: "Al-Jumu'ah", nameAr: "الجمعة", verses: 11, type: "Medinan" },
  { number: 63, name: "Al-Munafiqun", nameAr: "المنافقون", verses: 11, type: "Medinan" },
  { number: 64, name: "At-Taghabun", nameAr: "التغابن", verses: 18, type: "Medinan" },
  { number: 65, name: "At-Talaq", nameAr: "الطلاق", verses: 12, type: "Medinan" },
  { number: 66, name: "At-Tahrim", nameAr: "التحريم", verses: 12, type: "Medinan" },
  { number: 67, name: "Al-Mulk", nameAr: "الملك", verses: 30, type: "Meccan" },
  { number: 68, name: "Al-Qalam", nameAr: "القلم", verses: 52, type: "Meccan" },
  { number: 69, name: "Al-Haqqah", nameAr: "الحاقة", verses: 52, type: "Meccan" },
  { number: 70, name: "Al-Ma'arij", nameAr: "المعارج", verses: 44, type: "Meccan" },
  { number: 71, name: "Nuh", nameAr: "نوح", verses: 28, type: "Meccan" },
  { number: 72, name: "Al-Jinn", nameAr: "الجن", verses: 28, type: "Meccan" },
  { number: 73, name: "Al-Muzzammil", nameAr: "المزمل", verses: 20, type: "Meccan" },
  { number: 74, name: "Al-Muddaththir", nameAr: "المدثر", verses: 56, type: "Meccan" },
  { number: 75, name: "Al-Qiyamah", nameAr: "القيامة", verses: 40, type: "Meccan" },
  { number: 76, name: "Al-Insan", nameAr: "الإنسان", verses: 31, type: "Medinan" },
  { number: 77, name: "Al-Mursalat", nameAr: "المرسلات", verses: 50, type: "Meccan" },
  { number: 78, name: "An-Naba", nameAr: "النبأ", verses: 40, type: "Meccan" },
  { number: 79, name: "An-Nazi'at", nameAr: "النازعات", verses: 46, type: "Meccan" },
  { number: 80, name: "Abasa", nameAr: "عبس", verses: 42, type: "Meccan" },
  { number: 81, name: "At-Takwir", nameAr: "التكوير", verses: 29, type: "Meccan" },
  { number: 82, name: "Al-Infitar", nameAr: "الانفطار", verses: 19, type: "Meccan" },
  { number: 83, name: "Al-Mutaffifin", nameAr: "المطففين", verses: 36, type: "Meccan" },
  { number: 84, name: "Al-Inshiqaq", nameAr: "الانشقاق", verses: 25, type: "Meccan" },
  { number: 85, name: "Al-Buruj", nameAr: "البروج", verses: 22, type: "Meccan" },
  { number: 86, name: "At-Tariq", nameAr: "الطارق", verses: 17, type: "Meccan" },
  { number: 87, name: "Al-A'la", nameAr: "الأعلى", verses: 19, type: "Meccan" },
  { number: 88, name: "Al-Ghashiyah", nameAr: "الغاشية", verses: 26, type: "Meccan" },
  { number: 89, name: "Al-Fajr", nameAr: "الفجر", verses: 30, type: "Meccan" },
  { number: 90, name: "Al-Balad", nameAr: "البلد", verses: 20, type: "Meccan" },
  { number: 91, name: "Ash-Shams", nameAr: "الشمس", verses: 15, type: "Meccan" },
  { number: 92, name: "Al-Layl", nameAr: "الليل", verses: 21, type: "Meccan" },
  { number: 93, name: "Ad-Duha", nameAr: "الضحى", verses: 11, type: "Meccan" },
  { number: 94, name: "Ash-Sharh", nameAr: "الشرح", verses: 8, type: "Meccan" },
  { number: 95, name: "At-Tin", nameAr: "التين", verses: 8, type: "Meccan" },
  { number: 96, name: "Al-Alaq", nameAr: "العلق", verses: 19, type: "Meccan" },
  { number: 97, name: "Al-Qadr", nameAr: "القدر", verses: 5, type: "Meccan" },
  { number: 98, name: "Al-Bayyinah", nameAr: "البينة", verses: 8, type: "Medinan" },
  { number: 99, name: "Az-Zalzalah", nameAr: "الزلزلة", verses: 8, type: "Medinan" },
  { number: 100, name: "Al-Adiyat", nameAr: "العاديات", verses: 11, type: "Meccan" },
  { number: 101, name: "Al-Qari'ah", nameAr: "القارعة", verses: 11, type: "Meccan" },
  { number: 102, name: "At-Takathur", nameAr: "التكاثر", verses: 8, type: "Meccan" },
  { number: 103, name: "Al-Asr", nameAr: "العصر", verses: 3, type: "Meccan" },
  { number: 104, name: "Al-Humazah", nameAr: "الهمزة", verses: 9, type: "Meccan" },
  { number: 105, name: "Al-Fil", nameAr: "الفيل", verses: 5, type: "Meccan" },
  { number: 106, name: "Quraysh", nameAr: "قريش", verses: 4, type: "Meccan" },
  { number: 107, name: "Al-Ma'un", nameAr: "الماعون", verses: 7, type: "Meccan" },
  { number: 108, name: "Al-Kawthar", nameAr: "الكوثر", verses: 3, type: "Meccan" },
  { number: 109, name: "Al-Kafirun", nameAr: "الكافرون", verses: 6, type: "Meccan" },
  { number: 110, name: "An-Nasr", nameAr: "النصر", verses: 3, type: "Medinan" },
  { number: 111, name: "Al-Masad", nameAr: "المسد", verses: 5, type: "Meccan" },
  { number: 112, name: "Al-Ikhlas", nameAr: "الإخلاص", verses: 4, type: "Meccan" },
  { number: 113, name: "Al-Falaq", nameAr: "الفلق", verses: 5, type: "Meccan" },
  { number: 114, name: "An-Nas", nameAr: "الناس", verses: 6, type: "Medinan" },
];

// Cumulative ayah start numbers for audio CDN (absolute ayah numbering)
const surahStartAyahs = [0,1,8,294,494,670,790,955,1161,1236,1365,1474,1597,1708,1751,1803,1902,2030,2141,2251,2349,2484,2596,2674,2792,2869,2946,3173,3266,3354,3423,3483,3517,3547,3620,3674,3719,3802,3984,4072,4147,4232,4286,4339,4428,4487,4524,4559,4597,4626,4644,4689,4749,4798,4860,4915,4993,5089,5118,5140,5164,5177,5191,5202,5213,5231,5243,5255,5285,5337,5389,5433,5461,5489,5509,5565,5605,5636,5686,5726,5772,5814,5843,5862,5898,5923,5945,5962,5981,6007,6037,6057,6072,6093,6104,6112,6120,6139,6144,6152,6160,6171,6182,6190,6193,6202,6207,6211,6218,6221,6227,6230,6233,6237,6241,6247];

const getAbsoluteAyahNumber = (surahNum: number, ayahNum: number): number => {
  return (surahStartAyahs[surahNum] || 1) + ayahNum - 1;
};

interface TajweedResult {
  accuracyScore: number;
  tajweedRules: { rule: string; status: string; details: string }[];
  mistakes: { word: string; issue: string; correction: string }[];
  feedback: string;
  improvementTip: string;
}

interface SavedPractice {
  id: string;
  surahName: string;
  surahNameAr: string;
  result: TajweedResult;
  timestamp: Date;
  pinned: boolean;
}

const PracticeRoom = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const [selectedSurah, setSelectedSurah] = useState(0); // index into allSurahs
  const [tajweedResult, setTajweedResult] = useState<TajweedResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [surahSearch, setSurahSearch] = useState("");

  // Dynamically fetched verses
  const [verses, setVerses] = useState<{ arabic: string; translation: string }[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);

  // Saved practice history
  const [savedPractices, setSavedPractices] = useState<SavedPractice[]>([]);

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

  const currentSurah = allSurahs[selectedSurah];
  const fullSurahText = verses.map((v) => v.arabic).join(" ");

  // Fetch verses from Al-Quran Cloud API when surah changes
  useEffect(() => {
    const fetchVerses = async () => {
      setIsLoadingVerses(true);
      setVerses([]);
      try {
        const [arRes, enRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${currentSurah.number}/ar.alafasy`),
          fetch(`https://api.alquran.cloud/v1/surah/${currentSurah.number}/en.asad`),
        ]);
        const arData = await arRes.json();
        const enData = await enRes.json();

        if (arData.status === "OK" && enData.status === "OK") {
          const arAyahs = arData.data.ayahs;
          const enAyahs = enData.data.ayahs;
          const combined = arAyahs.map((a: any, i: number) => ({
            arabic: a.text,
            translation: enAyahs[i]?.text || "",
          }));
          setVerses(combined);
        }
      } catch (err) {
        console.error("Failed to fetch surah:", err);
        toast({ title: isAr ? "خطأ" : "Error", description: isAr ? "تعذّر تحميل الآيات" : "Could not load verses", variant: "destructive" });
      } finally {
        setIsLoadingVerses(false);
      }
    };
    fetchVerses();
  }, [selectedSurah, currentSurah.number, isAr]);

  // Filter surahs by search
  const filteredSurahs = allSurahs.filter((s) => {
    if (!surahSearch.trim()) return true;
    const q = surahSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.nameAr.includes(q) || s.number.toString() === q;
  });

  const getAudioUrl = useCallback((ayahIndex: number, qariIdx?: number) => {
    const surahNum = currentSurah.number;
    const absNum = getAbsoluteAyahNumber(surahNum, ayahIndex + 1);
    const qari = qurraa[qariIdx ?? selectedQari].id;
    return `https://cdn.islamic.network/quran/audio/128/${qari}/${absNum}.mp3`;
  }, [currentSurah.number, selectedQari]);

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

  // Save current result to history for reference
  const saveToHistory = () => {
    if (!tajweedResult) return;
    const practice: SavedPractice = {
      id: Date.now().toString(),
      surahName: currentSurah.name,
      surahNameAr: currentSurah.nameAr,
      result: tajweedResult,
      timestamp: new Date(),
      pinned: false,
    };
    setSavedPractices((prev) => [practice, ...prev]);
    setTajweedResult(null);
    toast({ title: isAr ? "تم الحفظ" : "Saved", description: isAr ? "تم حفظ النتيجة للمرجع" : "Result saved for reference" });
  };

  // Dismiss current result without saving
  const dismissResult = () => {
    setTajweedResult(null);
  };

  // Toggle pin on a saved practice
  const togglePin = (id: string) => {
    setSavedPractices((prev) => prev.map((p) => p.id === id ? { ...p, pinned: !p.pinned } : p));
  };

  // Remove a saved practice
  const removeSaved = (id: string) => {
    setSavedPractices((prev) => prev.filter((p) => p.id !== id));
  };

  // Clear all non-pinned saved practices
  const clearUnpinned = () => {
    setSavedPractices((prev) => prev.filter((p) => p.pinned));
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
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={surahSearch}
              onChange={(e) => setSurahSearch(e.target.value)}
              placeholder={isAr ? "ابحث عن سورة..." : "Search surah..."}
              className="w-full pl-8 rtl:pl-3 rtl:pr-8 pr-3 py-2 bg-muted/50 rounded-lg text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              dir={isAr ? "rtl" : "ltr"}
            />
          </div>
          <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
            {filteredSurahs.map((s) => {
              const idx = allSurahs.indexOf(s);
              return (
                <button
                  key={s.number}
                  onClick={() => { setSelectedSurah(idx); setTajweedResult(null); stopQari(); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedSurah === idx ? "bg-primary text-primary-foreground" : "hover:bg-muted text-card-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      selectedSurah === idx ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {s.number}
                    </span>
                    <div className="text-left rtl:text-right min-w-0">
                      <p className="font-medium truncate">{isAr ? s.nameAr : s.name}</p>
                      <p className={`text-[10px] ${selectedSurah === idx ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {s.verses} {isAr ? "آية" : "verses"} · {s.type}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                </button>
              );
            })}
            {filteredSurahs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">{isAr ? "لا توجد نتائج" : "No results"}</p>
            )}
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
                {isAr ? currentSurah.nameAr : currentSurah.name}
              </h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {verses.length} {isAr ? "آية" : "verses"}
              </span>
            </div>

            {isLoadingVerses ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">{isAr ? "جارٍ تحميل الآيات..." : "Loading verses..."}</p>
              </div>
            ) : verses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{isAr ? "لا توجد آيات" : "No verses loaded"}</p>
            ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
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
            )}
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
          {/* Current result */}
          <div className="bg-card rounded-xl shadow-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-2">{isAr ? "الدقة الحالية" : "Current Accuracy"}</p>
            <p className="text-5xl font-bold text-gradient-primary">
              {tajweedResult ? `${tajweedResult.accuracyScore}%` : "—"}
            </p>
            {tajweedResult?.feedback && <p className="text-xs text-success mt-2">{tajweedResult.feedback}</p>}

            {/* Save / Dismiss buttons */}
            {tajweedResult && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={saveToHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Pin className="w-3.5 h-3.5" />
                  {isAr ? "حفظ للمرجع" : "Keep for Reference"}
                </button>
                <button
                  onClick={dismissResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {isAr ? "إزالة" : "Dismiss"}
                </button>
              </div>
            )}
          </div>

          {/* Current Tajweed details */}
          {tajweedResult && (
            <>
              <div className="bg-card rounded-xl shadow-card p-5">
                <h3 className="font-semibold text-card-foreground mb-3 text-sm">{isAr ? "أحكام التجويد" : "Tajweed Rules"}</h3>
                <div className="space-y-2">
                  {tajweedResult.tajweedRules?.map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-card-foreground">{t.rule}</span>
                      <span>{t.status === "correct" ? "✅" : t.status === "warning" ? "⚠️" : "❌"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {tajweedResult.mistakes && tajweedResult.mistakes.length > 0 && (
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

              {tajweedResult.improvementTip && (
                <div className="bg-mint rounded-xl p-4">
                  <p className="text-sm font-medium text-foreground">💡 {tajweedResult.improvementTip}</p>
                </div>
              )}
            </>
          )}

          {/* No current result prompt */}
          {!tajweedResult && savedPractices.length === 0 && (
            <div className="bg-card rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-card-foreground mb-3 text-sm">{isAr ? "أحكام التجويد" : "Tajweed Rules"}</h3>
              <p className="text-xs text-muted-foreground">{isAr ? "سجّل تلاوتك لرؤية التقييم" : "Record your recitation to see evaluation"}</p>
            </div>
          )}

          {/* Saved Practice History */}
          {savedPractices.length > 0 && (
            <div className="bg-card rounded-xl shadow-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-card-foreground text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {isAr ? "السجل المحفوظ" : "Saved History"}
                  <span className="text-xs font-normal text-muted-foreground">({savedPractices.length})</span>
                </h3>
                {savedPractices.some((p) => !p.pinned) && (
                  <button
                    onClick={clearUnpinned}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {isAr ? "مسح غير المثبتة" : "Clear unpinned"}
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedPractices
                  .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))
                  .map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-lg p-3 transition-all ${
                      p.pinned ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-semibold text-card-foreground">
                          {isAr ? p.surahNameAr : p.surahName}
                        </span>
                        <span className={`ml-2 rtl:mr-2 rtl:ml-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                          p.result.accuracyScore >= 90 ? "bg-mint text-success" :
                          p.result.accuracyScore >= 70 ? "bg-sand text-accent-foreground" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {p.result.accuracyScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePin(p.id)}
                          className={`p-1 rounded transition-colors ${
                            p.pinned ? "text-primary hover:text-primary/70" : "text-muted-foreground hover:text-primary"
                          }`}
                          title={p.pinned ? (isAr ? "إلغاء التثبيت" : "Unpin") : (isAr ? "تثبيت" : "Pin")}
                        >
                          {p.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => removeSaved(p.id)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                          title={isAr ? "حذف" : "Remove"}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {p.timestamp.toLocaleString(isAr ? "ar" : "en", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                    {p.result.feedback && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.result.feedback}</p>
                    )}
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

export default PracticeRoom;
