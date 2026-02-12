import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { useTeacherStudents } from "@/hooks/useTeacherStudents";
import { Users, Loader2 } from "lucide-react";

const TeacherStudents = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const { students, loading } = useTeacherStudents();

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "طلابي" : "My Students"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "عرض وإدارة الطلاب المرتبطين" : "View and manage your linked students"}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-card rounded-xl shadow-card p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isAr ? "لا يوجد طلاب بعد" : "No students yet"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isAr
              ? "أنشئ رمز دعوة من صفحة إدارة الفصول لربط الطلاب"
              : "Create an invite code from Class Management to link students"}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {isAr ? "الطالب" : "Student"}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {isAr ? "الفصل" : "Class"}
                  </th>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {isAr ? "تاريخ الانضمام" : "Joined"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-card-foreground text-sm">
                      {s.profile?.full_name || s.student_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {s.class_name || (isAr ? "بدون فصل" : "No class")}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default TeacherStudents;
