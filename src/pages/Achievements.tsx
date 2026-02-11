import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { Trophy, Flame, Star, BookOpen, PenTool, Target, Medal, Zap } from "lucide-react";
import { BadgeItem } from "@/components/DashboardWidgets";

const weeklyData = [
  { day: "Mon", dayAr: "إثنين", score: 65 },
  { day: "Tue", dayAr: "ثلاثاء", score: 72 },
  { day: "Wed", dayAr: "أربعاء", score: 80 },
  { day: "Thu", dayAr: "خميس", score: 78 },
  { day: "Fri", dayAr: "جمعة", score: 85 },
  { day: "Sat", dayAr: "سبت", score: 88 },
  { day: "Sun", dayAr: "أحد", score: 92 },
];

const Achievements = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "🏆 الإنجازات" : "🏆 Achievements"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "تتبع تقدمك واحصل على شارات جديدة" : "Track your progress and earn new badges"}
        </p>
      </div>

      {/* Streak banner */}
      <div className="bg-gradient-warm rounded-2xl p-6 text-primary-foreground mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-6 h-6" />
            <span className="text-lg font-bold">{isAr ? "سلسلة 12 يوم!" : "12 Day Streak!"}</span>
          </div>
          <p className="text-sm opacity-90">
            {isAr ? "واصل التمرين للحفاظ على سلسلتك" : "Keep practicing to maintain your streak"}
          </p>
        </div>
        <div className="text-5xl font-bold opacity-80">🔥</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly chart */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-card-foreground mb-4">
            {isAr ? "الأداء الأسبوعي" : "Weekly Performance"}
          </h3>
          <div className="flex items-end justify-between h-40 px-2">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full max-w-[32px] relative flex-1 flex items-end">
                  <div
                    className="w-full bg-gradient-primary rounded-t-md transition-all duration-700"
                    style={{ height: `${d.score}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{isAr ? d.dayAr : d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Levels */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-card-foreground mb-4">
            {isAr ? "المستويات" : "Skill Levels"}
          </h3>
          <div className="space-y-4">
            {[
              { icon: BookOpen, label: isAr ? "تلاوة القرآن" : "Quran Recitation", level: 7, xp: 720, maxXp: 1000 },
              { icon: PenTool, label: isAr ? "الكتابة" : "Writing", level: 5, xp: 450, maxXp: 800 },
              { icon: Target, label: isAr ? "الإملاء" : "Spelling", level: 6, xp: 580, maxXp: 900 },
            ].map((skill, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <skill.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-card-foreground">{skill.label}</span>
                    <span className="text-xs text-muted-foreground">Lv.{skill.level}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary rounded-full"
                      style={{ width: `${(skill.xp / skill.maxXp) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{skill.xp}/{skill.maxXp} XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-card-foreground mb-4">
            {isAr ? "الشارات المكتسبة" : "Earned Badges"}
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            <BadgeItem emoji="🌟" label={isAr ? "بداية رائعة" : "Great Start"} />
            <BadgeItem emoji="🔥" label={isAr ? "متحمس" : "On Fire"} />
            <BadgeItem emoji="📖" label={isAr ? "قارئ متميز" : "Top Reader"} />
            <BadgeItem emoji="🎯" label={isAr ? "دقيق" : "Accurate"} />
            <BadgeItem emoji="⚡" label={isAr ? "سريع" : "Quick"} />
            <BadgeItem emoji="✍️" label={isAr ? "كاتب" : "Writer"} earned={false} />
            <BadgeItem emoji="🏆" label={isAr ? "بطل" : "Champion"} earned={false} />
            <BadgeItem emoji="💎" label={isAr ? "ماسي" : "Diamond"} earned={false} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Achievements;
