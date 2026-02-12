import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Inbox, BookOpen, PenTool, Image, Mic, FileText, Sparkles } from "lucide-react";

const TYPE_INFO: Record<string, { label: string; labelAr: string; icon: any; color: string }> = {
  quran_recitation: { label: "Quran Recitation", labelAr: "تلاوة القرآن", icon: BookOpen, color: "text-emerald-500" },
  essay_writing: { label: "Essay Writing", labelAr: "كتابة مقال", icon: PenTool, color: "text-blue-500" },
  homework_upload: { label: "Homework Upload", labelAr: "رفع واجب", icon: Image, color: "text-amber-500" },
  poem_speech: { label: "Poem / Speech", labelAr: "شعر / خطاب", icon: Mic, color: "text-purple-500" },
  general_task: { label: "General Task", labelAr: "مهمة عامة", icon: FileText, color: "text-slate-500" },
  custom: { label: "Custom", labelAr: "مخصص", icon: Sparkles, color: "text-pink-500" },
};

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
        .select("*, quran_assignments!inner(teacher_id, surah_name, surah_name_ar, assignment_type)")
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
          {submissions.map((s: any) => {
            const assignmentType = s.quran_assignments?.assignment_type || "quran_recitation";
            const typeInfo = TYPE_INFO[assignmentType] || TYPE_INFO.general_task;
            const TypeIcon = typeInfo.icon;

            return (
              <div key={s.id} className="bg-card rounded-xl shadow-card p-4 hover:shadow-elevated transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                    <span className="font-medium text-card-foreground text-sm">
                      {isAr ? s.quran_assignments?.surah_name_ar : s.quran_assignments?.surah_name}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.status === "reviewed" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                  }`}>
                    {s.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isAr ? typeInfo.labelAr : typeInfo.label}
                </p>
                {s.submission_text && (
                  <p className="text-sm text-foreground mt-1 line-clamp-2">{s.submission_text}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(s.submitted_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default TeacherSubmissions;
