import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Settings } from "lucide-react";

const TeacherSettings = () => {
  const { language } = useAppContext();
  const { user } = useAuth();
  const isAr = language === "ar";

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "الإعدادات" : "Settings"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "إدارة حسابك وتفضيلاتك" : "Manage your account and preferences"}
        </p>
      </div>

      <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            {isAr ? "البريد الإلكتروني" : "Email"}
          </label>
          <p className="text-foreground mt-1">{user?.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            {isAr ? "الدور" : "Role"}
          </label>
          <p className="text-foreground mt-1">{isAr ? "معلم" : "Teacher"}</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default TeacherSettings;
