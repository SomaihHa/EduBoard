import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/DashboardWidgets";
import { Users, BookOpen, CheckCircle, AlertCircle, Clock, TrendingUp } from "lucide-react";

const students = [
  { name: "Ahmed Al-Rashid", nameAr: "أحمد الراشد", recitation: 92, writing: 78, homework: 95, streak: 12 },
  { name: "Fatima Hassan", nameAr: "فاطمة حسن", recitation: 88, writing: 85, homework: 90, streak: 8 },
  { name: "Omar Khalil", nameAr: "عمر خليل", recitation: 75, writing: 70, homework: 82, streak: 5 },
  { name: "Sara Mohammed", nameAr: "سارة محمد", recitation: 95, writing: 91, homework: 98, streak: 20 },
  { name: "Youssef Ali", nameAr: "يوسف علي", recitation: 68, writing: 62, homework: 75, streak: 3 },
];

const pendingReviews = [
  { student: "Ahmed", studentAr: "أحمد", type: "Quran Recitation", typeAr: "تلاوة القرآن", surah: "Al-Baqarah", surahAr: "البقرة", time: "30min ago" },
  { student: "Fatima", studentAr: "فاطمة", type: "Essay Submission", typeAr: "تسليم مقال", surah: "My Future", surahAr: "مستقبلي", time: "1h ago" },
  { student: "Omar", studentAr: "عمر", type: "Homework Scan", typeAr: "مسح واجب", surah: "Math P.42", surahAr: "رياضيات ص٤٢", time: "2h ago" },
];

const TeacherDashboard = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "مرحباً، أستاذ محمد 👋" : "Welcome, Mr. Mohammed 👋"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "إليك ملخص أداء طلابك" : "Here's your class performance overview"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-5 h-5 text-primary-foreground" />}
          label={isAr ? "الطلاب النشطين" : "Active Students"}
          value={28}
          sub={isAr ? "من 32" : "of 32 total"}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-primary-foreground" />}
          label={isAr ? "تم التقييم" : "Reviewed Today"}
          value={14}
          colorClass="bg-gradient-success"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-primary-foreground" />}
          label={isAr ? "بانتظار المراجعة" : "Pending Reviews"}
          value={7}
          colorClass="bg-gradient-warm"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-primary-foreground" />}
          label={isAr ? "متوسط الفصل" : "Class Average"}
          value="82%"
          sub={isAr ? "+5% هذا الأسبوع" : "+5% this week"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Table */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {isAr ? "أداء الطلاب" : "Student Performance"}
          </h2>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isAr ? "الطالب" : "Student"}
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isAr ? "تلاوة" : "Recitation"}
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isAr ? "كتابة" : "Writing"}
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isAr ? "واجبات" : "Homework"}
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      🔥
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((s, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-card-foreground text-sm">
                        {isAr ? s.nameAr : s.name}
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className={`text-sm font-semibold ${s.recitation >= 85 ? "text-success" : s.recitation >= 70 ? "text-accent" : "text-destructive"}`}>
                          {s.recitation}%
                        </span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className={`text-sm font-semibold ${s.writing >= 85 ? "text-success" : s.writing >= 70 ? "text-accent" : "text-destructive"}`}>
                          {s.writing}%
                        </span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className={`text-sm font-semibold ${s.homework >= 85 ? "text-success" : s.homework >= 70 ? "text-accent" : "text-destructive"}`}>
                          {s.homework}%
                        </span>
                      </td>
                      <td className="text-center px-3 py-3 text-sm">{s.streak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pending Reviews */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {isAr ? "بانتظار المراجعة" : "Pending Reviews"}
          </h2>
          <div className="space-y-3">
            {pendingReviews.map((r, i) => (
              <div key={i} className="bg-card rounded-xl shadow-card p-4 hover:shadow-elevated transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-card-foreground text-sm">{isAr ? r.studentAr : r.student}</span>
                  <span className="text-xs text-muted-foreground">{r.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{isAr ? r.typeAr : r.type}</p>
                <p className="text-sm font-medium text-primary mt-1">{isAr ? r.surahAr : r.surah}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TeacherDashboard;
