import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { StatCard, ProgressRing, BadgeItem } from "@/components/DashboardWidgets";
import { BookOpen, Mic, Camera, PenTool, Flame, Star, Target, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  { icon: Mic, label: "Practice Room", labelAr: "غرفة التمرين", path: "/practice", color: "bg-gradient-primary" },
  { icon: BookOpen, label: "Assignments", labelAr: "الواجبات", path: "/assignments", color: "bg-gradient-success" },
  { icon: Camera, label: "Scan Homework", labelAr: "مسح الواجب", path: "/homework", color: "bg-gradient-warm" },
  { icon: PenTool, label: "Writing Lab", labelAr: "مختبر الكتابة", path: "/writing", color: "bg-gradient-primary" },
];

const recentActivity = [
  { type: "quran", title: "Surah Al-Fatiha", titleAr: "سورة الفاتحة", score: 92, time: "2h ago", timeAr: "منذ ساعتين" },
  { type: "writing", title: "Essay: My School", titleAr: "مقال: مدرستي", score: 78, time: "5h ago", timeAr: "منذ 5 ساعات" },
  { type: "homework", title: "Math Worksheet", titleAr: "ورقة عمل رياضيات", score: 85, time: "1d ago", timeAr: "منذ يوم" },
];

const StudentDashboard = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "مرحباً، أحمد! 👋" : "Welcome back, Ahmed! 👋"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "واصل تقدمك الرائع اليوم" : "Keep up your amazing progress today"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Flame className="w-5 h-5 text-primary-foreground" />}
          label={isAr ? "أيام متتالية" : "Day Streak"}
          value={12}
          sub={isAr ? "أفضل إنجاز: 18" : "Best: 18 days"}
          colorClass="bg-gradient-warm"
        />
        <StatCard
          icon={<Star className="w-5 h-5 text-primary-foreground" />}
          label={isAr ? "نقاط الأسبوع" : "Weekly Points"}
          value={340}
          sub={isAr ? "+45 اليوم" : "+45 today"}
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-primary-foreground" />}
          label={isAr ? "دقة التلاوة" : "Recitation Accuracy"}
          value="87%"
          sub={isAr ? "+3% هذا الأسبوع" : "+3% this week"}
          colorClass="bg-gradient-success"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-primary-foreground" />}
          label={isAr ? "وقت التمرين" : "Practice Time"}
          value="2.5h"
          sub={isAr ? "اليوم" : "Today"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {isAr ? "ابدأ الآن" : "Quick Actions"}
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {quickActions.map((a) => (
              <Link
                key={a.path}
                to={a.path}
                className="bg-card rounded-xl shadow-card p-5 hover:shadow-elevated transition-all duration-200 group"
              >
                <div className={`w-12 h-12 rounded-xl ${a.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <a.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <p className="font-semibold text-card-foreground">{isAr ? a.labelAr : a.label}</p>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {isAr ? "النشاط الأخير" : "Recent Activity"}
          </h2>
          <div className="bg-card rounded-xl shadow-card divide-y divide-border">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-card-foreground">{isAr ? item.titleAr : item.title}</p>
                  <p className="text-xs text-muted-foreground">{isAr ? item.timeAr : item.time}</p>
                </div>
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                  item.score >= 90 ? "bg-mint text-success" :
                  item.score >= 80 ? "bg-sand text-accent-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {item.score}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          <div className="bg-card rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-card-foreground mb-4">
              {isAr ? "التقدم الأسبوعي" : "Weekly Progress"}
            </h3>
            <div className="flex justify-around">
              <ProgressRing value={87} label={isAr ? "تلاوة" : "Recitation"} />
              <ProgressRing value={72} label={isAr ? "كتابة" : "Writing"} />
            </div>
          </div>

          {/* Badges */}
          <div className="bg-card rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-card-foreground mb-4">
              {isAr ? "الشارات" : "Badges"}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <BadgeItem emoji="🌟" label={isAr ? "نجم" : "Star"} />
              <BadgeItem emoji="🔥" label={isAr ? "متحمس" : "On Fire"} />
              <BadgeItem emoji="📖" label={isAr ? "قارئ" : "Reader"} />
              <BadgeItem emoji="✍️" label={isAr ? "كاتب" : "Writer"} earned={false} />
              <BadgeItem emoji="🏆" label={isAr ? "بطل" : "Champ"} earned={false} />
              <BadgeItem emoji="💎" label={isAr ? "ماسي" : "Diamond"} earned={false} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;
