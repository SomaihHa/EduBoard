import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  BookOpen, Home, Mic, Camera, PenTool, Headphones,
  Trophy, Settings, Users, BarChart3, Globe, UserCircle, GraduationCap, LogOut, Bot, Presentation, Moon, Sun
} from "lucide-react";

const studentNav = [
  { icon: Home, label: "Dashboard", labelAr: "لوحة التحكم", path: "/" },
  { icon: Bot, label: "AI Facilitator", labelAr: "مساعد التعلّم", path: "/ai-facilitator" },
  { icon: Mic, label: "Practice Room", labelAr: "غرفة التمرين", path: "/practice" },
  { icon: BookOpen, label: "Quran Practice", labelAr: "تلاوة القرآن", path: "/quran" },
  { icon: Camera, label: "Homework Scan", labelAr: "مسح الواجبات", path: "/homework" },
  { icon: PenTool, label: "Writing Lab", labelAr: "مختبر الكتابة", path: "/writing" },
  { icon: Headphones, label: "Lecture Notes", labelAr: "ملاحظات المحاضرة", path: "/lectures" },
  { icon: Trophy, label: "Achievements", labelAr: "الإنجازات", path: "/achievements" },
];

const teacherNav = [
  { icon: Home, label: "Dashboard", labelAr: "لوحة التحكم", path: "/" },
  { icon: Bot, label: "AI Facilitator", labelAr: "مساعد التعلّم", path: "/ai-facilitator" },
  { icon: Presentation, label: "Presentations", labelAr: "العروض التقديمية", path: "/presentations" },
  { icon: Users, label: "Students", labelAr: "الطلاب", path: "/students" },
  { icon: BarChart3, label: "Analytics", labelAr: "التحليلات", path: "/analytics" },
  { icon: BookOpen, label: "Assignments", labelAr: "الواجبات", path: "/assignments" },
  { icon: Mic, label: "Recitation Review", labelAr: "مراجعة التلاوة", path: "/recitation-review" },
  { icon: Camera, label: "Submissions", labelAr: "التسليمات", path: "/submissions" },
  { icon: Settings, label: "Settings", labelAr: "الإعدادات", path: "/settings" },
];

export const AppSidebar = () => {
  const { role, setRole, language, setLanguage } = useAppContext();
  const { signOut } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const nav = role === "student" ? studentNav : teacherNav;
  const isAr = language === "ar";

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 bg-gradient-sidebar backdrop-blur-xl flex flex-col rtl:left-auto rtl:right-0 border-r border-white/5">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              EduFine
            </h1>
            <p className="text-[11px] text-sidebar-foreground/50 font-medium uppercase tracking-widest">
              {isAr ? "تعليم ذكي" : "Smart Learning"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-white shadow-sm backdrop-blur-sm"
                  : "text-sidebar-foreground/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-secondary' : ''}`} />
              <span>{isAr ? item.labelAr : item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{isAr ? (isDark ? "الوضع الفاتح" : "الوضع الداكن") : (isDark ? "Light Mode" : "Dark Mode")}</span>
        </button>

        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
        >
          <Globe className="w-5 h-5" />
          <span>{isAr ? "English" : "العربية"}</span>
        </button>
        <button
          onClick={() => setRole(role === "student" ? "teacher" : "student")}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
        >
          <UserCircle className="w-5 h-5" />
          <span>
            {isAr
              ? role === "student" ? "تبديل إلى معلم" : "تبديل إلى طالب"
              : role === "student" ? "Switch to Teacher" : "Switch to Student"}
          </span>
        </button>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
};
