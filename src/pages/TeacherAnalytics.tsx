import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { useTeacherStudents } from "@/hooks/useTeacherStudents";
import { BarChart3, Users, BookOpen, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/DashboardWidgets";

const TeacherAnalytics = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const { students } = useTeacherStudents();

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "التحليلات" : "Analytics"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "تتبع أداء الفصل" : "Track class performance"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-5 h-5 text-primary-foreground" />}
          label={isAr ? "إجمالي الطلاب" : "Total Students"}
          value={students.length}
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-primary-foreground" />}
          label={isAr ? "الفصول النشطة" : "Active Classes"}
          value={new Set(students.map((s) => s.class_name).filter(Boolean)).size || 0}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-primary-foreground" />}
          label={isAr ? "متوسط الأداء" : "Avg. Performance"}
          value="—"
          sub={isAr ? "قريباً" : "Coming soon"}
        />
      </div>

      <div className="bg-card rounded-xl shadow-card p-8 text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isAr ? "تحليلات متقدمة قريباً" : "Advanced analytics coming soon"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {isAr
            ? "ستتمكن من تتبع أداء كل طالب بالتفصيل"
            : "You'll be able to track each student's performance in detail"}
        </p>
      </div>
    </AppLayout>
  );
};

export default TeacherAnalytics;
