import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  BookOpen, Home, Mic, Camera, PenTool, Headphones,
  Trophy, Settings, Users, BarChart3, Globe, LogOut, Bot, Presentation, Moon, Sun, Sparkles,
  Menu, ChevronLeft, X
} from "lucide-react";
import EduBoardLogo from "@/components/EduBoardLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebarState } from "@/contexts/SidebarContext";

const studentNav = [
  { icon: Home, label: "Dashboard", labelAr: "لوحة التحكم", path: "/" },
  { icon: Bot, label: "AI Facilitator", labelAr: "مساعد التعلّم", path: "/ai-facilitator" },
  { icon: Mic, label: "Practice Room", labelAr: "غرفة التمرين", path: "/practice" },
  { icon: BookOpen, label: "Quran Practice", labelAr: "تلاوة القرآن", path: "/quran" },
  { icon: Camera, label: "Homework Scan", labelAr: "مسح الواجبات", path: "/homework" },
  { icon: PenTool, label: "Writing Lab", labelAr: "مختبر الكتابة", path: "/writing" },
  { icon: Headphones, label: "Lecture Notes", labelAr: "ملاحظات المحاضرة", path: "/lectures" },
  { icon: Sparkles, label: "Skills Hub", labelAr: "مركز المهارات", path: "/skills" },
  { icon: Trophy, label: "Achievements", labelAr: "الإنجازات", path: "/achievements" },
  { icon: Users, label: "My Classes", labelAr: "فصولي", path: "/classes" },
];

const teacherNav = [
  { icon: Home, label: "Dashboard", labelAr: "لوحة التحكم", path: "/" },
  { icon: Bot, label: "AI Facilitator", labelAr: "مساعد التعلّم", path: "/ai-facilitator" },
  { icon: Presentation, label: "Presentations", labelAr: "العروض التقديمية", path: "/presentations" },
  { icon: BookOpen, label: "Quran Assignments", labelAr: "واجبات القرآن", path: "/quran" },
  { icon: Users, label: "My Students", labelAr: "طلابي", path: "/students" },
  { icon: Users, label: "Class Management", labelAr: "إدارة الفصول", path: "/classes" },
  { icon: BarChart3, label: "Analytics", labelAr: "التحليلات", path: "/analytics" },
  { icon: Camera, label: "Submissions", labelAr: "التسليمات", path: "/submissions" },
  { icon: Settings, label: "Settings", labelAr: "الإعدادات", path: "/settings" },
];

export const AppSidebar = () => {
  const { role, language, setLanguage } = useAppContext();
  const { signOut } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { collapsed, setCollapsed } = useSidebarState();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = role === "student" ? studentNav : teacherNav;
  const isAr = language === "ar";
  const showLabel = !collapsed || isMobile;

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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarContent = (
    <>
      <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <EduBoardLogo />
          {showLabel && (
            <p className="text-[11px] text-sidebar-foreground/50 font-medium uppercase tracking-widest truncate">
              {isAr ? "تعليم ذكي" : "Smart Learning"}
            </p>
          )}
        </div>
        {isMobile ? (
          <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground/60 hover:text-white flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => setCollapsed(!collapsed)} className="text-sidebar-foreground/60 hover:text-white flex-shrink-0">
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={!showLabel ? (isAr ? item.labelAr : item.label) : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                !showLabel ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-white/10 text-white shadow-sm backdrop-blur-sm"
                  : "text-sidebar-foreground/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-secondary' : ''}`} />
              {showLabel && <span className="truncate">{isAr ? item.labelAr : item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-4 border-t border-sidebar-border space-y-1">
        <button
          onClick={toggleDarkMode}
          title={!showLabel ? (isDark ? "Light" : "Dark") : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all ${!showLabel ? "justify-center" : ""}`}
        >
          {isDark ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {showLabel && <span>{isAr ? (isDark ? "الوضع الفاتح" : "الوضع الداكن") : (isDark ? "Light Mode" : "Dark Mode")}</span>}
        </button>

        <button
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          title={!showLabel ? (isAr ? "English" : "العربية") : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all ${!showLabel ? "justify-center" : ""}`}
        >
          <Globe className="w-5 h-5 flex-shrink-0" />
          {showLabel && <span>{isAr ? "English" : "العربية"}</span>}
        </button>

        {showLabel && (
          <div className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground/50">
            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            <span>{isAr ? (role === "student" ? "طالب" : "معلم") : (role === "student" ? "Student" : "Teacher")}</span>
          </div>
        )}

        <button
          onClick={signOut}
          title={!showLabel ? (isAr ? "خروج" : "Sign Out") : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all ${!showLabel ? "justify-center" : ""}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {showLabel && <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>}
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 rtl:left-auto rtl:right-4 z-50 p-2 rounded-lg bg-card border border-border shadow-md text-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
            <aside
              className="fixed top-0 left-0 rtl:left-auto rtl:right-0 z-50 h-screen w-64 bg-gradient-sidebar backdrop-blur-xl flex flex-col border-r border-white/5 animate-slide-in"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </aside>
          </div>
        )}
      </>
    );
  }

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-gradient-sidebar backdrop-blur-xl flex flex-col rtl:left-auto rtl:right-0 border-r border-white/5 transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      {sidebarContent}
    </aside>
  );
};
