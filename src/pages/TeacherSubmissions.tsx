import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Camera, Loader2, Inbox } from "lucide-react";

const TeacherSubmissions = () => {
  const { language } = useAppContext();
  const { user } = useAuth();
  const isAr = language === "ar";

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["teacher-submissions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("assignment_submissions")
        .select("*, quran_assignments!inner(teacher_id, surah_name, surah_name_ar)")
        .eq("quran_assignments.teacher_id", user.id)
        .order("submitted_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "التسليمات" : "Submissions"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "مراجعة تسليمات الطلاب" : "Review student submissions"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !submissions?.length ? (
        <div className="bg-card rounded-xl shadow-card p-8 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isAr ? "لا توجد تسليمات" : "No submissions yet"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isAr ? "ستظهر تسليمات الطلاب هنا" : "Student submissions will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s: any) => (
            <div key={s.id} className="bg-card rounded-xl shadow-card p-4 hover:shadow-elevated transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-card-foreground text-sm">{s.student_id.slice(0, 8)}...</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.status === "reviewed" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                }`}>
                  {s.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isAr ? s.quran_assignments?.surah_name_ar : s.quran_assignments?.surah_name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(s.submitted_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default TeacherSubmissions;
