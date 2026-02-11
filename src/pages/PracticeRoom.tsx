import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { Mic, MicOff, Play, RotateCcw, ChevronRight, Volume2 } from "lucide-react";

const surahs = [
  { name: "Al-Fatiha", nameAr: "الفاتحة", verses: 7, difficulty: "Easy" },
  { name: "Al-Baqarah", nameAr: "البقرة", verses: 286, difficulty: "Hard" },
  { name: "Al-Ikhlas", nameAr: "الإخلاص", verses: 4, difficulty: "Easy" },
  { name: "Al-Falaq", nameAr: "الفلق", verses: 5, difficulty: "Easy" },
  { name: "An-Nas", nameAr: "الناس", verses: 6, difficulty: "Easy" },
  { name: "Ya-Sin", nameAr: "يس", verses: 83, difficulty: "Medium" },
];

const sampleVerses = [
  { arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", translation: "In the name of Allah, the Most Gracious, the Most Merciful", status: "correct" as const },
  { arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "Praise be to Allah, Lord of all the worlds", status: "correct" as const },
  { arabic: "الرَّحْمَنِ الرَّحِيمِ", translation: "The Most Gracious, the Most Merciful", status: "warning" as const },
  { arabic: "مَالِكِ يَوْمِ الدِّينِ", translation: "Master of the Day of Judgment", status: "idle" as const },
  { arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "You alone we worship, and You alone we ask for help", status: "idle" as const },
  { arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us on the Straight Path", status: "idle" as const },
  { arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "The path of those You have blessed, not of those who incurred wrath, nor of those who went astray", status: "idle" as const },
];

const PracticeRoom = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(0);
  const [activeVerse, setActiveVerse] = useState(2);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "غرفة التمرين - تلاوة القرآن" : "Practice Room — Quran Recitation"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "تدرب على التلاوة واحصل على تقييم فوري" : "Practice recitation and get instant AI feedback"}
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
                onClick={() => setSelectedSurah(i)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                  selectedSurah === i
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-card-foreground"
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
          {/* Verse display */}
          <div className="bg-card rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">
                {isAr ? surahs[selectedSurah].nameAr : surahs[selectedSurah].name}
              </h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {surahs[selectedSurah].verses} {isAr ? "آية" : "verses"}
              </span>
            </div>

            <div className="space-y-4">
              {sampleVerses.map((v, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl transition-all ${
                    v.status === "correct" ? "bg-mint border-2 border-success/20" :
                    v.status === "warning" ? "bg-sand border-2 border-warning/30 animate-pulse-soft" :
                    i === activeVerse ? "bg-muted/50 border-2 border-primary/20" :
                    "bg-transparent"
                  }`}
                >
                  <p className="quran-text text-card-foreground text-center leading-loose" dir="rtl">
                    {v.arabic}
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-2">{v.translation}</p>
                  {v.status === "warning" && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-xs text-warning font-medium">
                        {isAr ? "⚠️ تحقق من أحكام التجويد في 'الرحيم'" : "⚠️ Check Tajweed on 'Ar-Raheem'"}
                      </span>
                      <button className="text-primary hover:text-primary/80">
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recording controls */}
          <div className="bg-card rounded-xl shadow-card p-5 flex items-center justify-center gap-4">
            <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording
                  ? "bg-destructive text-destructive-foreground scale-110 animate-pulse-soft"
                  : "bg-gradient-primary text-primary-foreground hover:scale-105"
              }`}
            >
              {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <Play className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Feedback panel */}
        <div className="space-y-4">
          {/* Score */}
          <div className="bg-card rounded-xl shadow-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {isAr ? "الدقة الحالية" : "Current Accuracy"}
            </p>
            <p className="text-5xl font-bold text-gradient-primary">87%</p>
            <p className="text-xs text-success mt-2">
              {isAr ? "+5% عن المحاولة السابقة" : "+5% from last attempt"}
            </p>
          </div>

          {/* Tajweed rules */}
          <div className="bg-card rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-card-foreground mb-3 text-sm">
              {isAr ? "أحكام التجويد" : "Tajweed Rules"}
            </h3>
            <div className="space-y-2">
              {[
                { rule: isAr ? "إدغام" : "Idghaam", status: "✅" },
                { rule: isAr ? "إخفاء" : "Ikhfaa", status: "✅" },
                { rule: isAr ? "مد طبيعي" : "Madd Tabee'i", status: "⚠️" },
                { rule: isAr ? "قلقلة" : "Qalqalah", status: "❌" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-card-foreground">{t.rule}</span>
                  <span>{t.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement tip */}
          <div className="bg-mint rounded-xl p-4">
            <p className="text-sm font-medium text-foreground">
              💡 {isAr ? "نصيحة: حاول إطالة المد في 'الرحيم'" : "Tip: Try extending the Madd in 'Ar-Raheem'"}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PracticeRoom;
