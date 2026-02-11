import { useState, useRef, useEffect } from "react";
import { Bell, BookOpen, Mic, PenTool, Camera, Calendar, X, Check } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  type: "assignment" | "recitation" | "essay" | "homework" | "reminder";
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  time: string;
  timeAr: string;
  read: boolean;
  link: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "recitation",
    title: "Quran Recitation Due",
    titleAr: "موعد تلاوة القرآن",
    description: "Surah Al-Mulk recitation is due tomorrow",
    descriptionAr: "تلاوة سورة الملك مطلوبة غداً",
    time: "Due tomorrow",
    timeAr: "مطلوب غداً",
    read: false,
    link: "/practice",
  },
  {
    id: "2",
    type: "essay",
    title: "Essay Submission Reminder",
    titleAr: "تذكير بتسليم المقال",
    description: "Your Arabic essay 'My Future Goals' is due in 2 days",
    descriptionAr: "مقالك 'أهدافي المستقبلية' مطلوب خلال يومين",
    time: "2 days left",
    timeAr: "باقي يومان",
    read: false,
    link: "/writing",
  },
  {
    id: "3",
    type: "homework",
    title: "New Homework Uploaded",
    titleAr: "واجب جديد تم رفعه",
    description: "Math worksheet Ch.5 has been assigned by Mr. Khalid",
    descriptionAr: "تم تكليف ورقة عمل رياضيات الفصل 5 من الأستاذ خالد",
    time: "3 hours ago",
    timeAr: "منذ 3 ساعات",
    read: false,
    link: "/homework",
  },
  {
    id: "4",
    type: "reminder",
    title: "Practice Streak at Risk!",
    titleAr: "سلسلة التمرين في خطر!",
    description: "Complete one practice session today to keep your 12-day streak",
    descriptionAr: "أكمل جلسة تمرين واحدة اليوم للحفاظ على سلسلتك لـ 12 يوماً",
    time: "Today",
    timeAr: "اليوم",
    read: true,
    link: "/practice",
  },
  {
    id: "5",
    type: "assignment",
    title: "Teacher Feedback Ready",
    titleAr: "ملاحظات المعلم جاهزة",
    description: "Your Surah Al-Fatiha recitation has been reviewed",
    descriptionAr: "تمت مراجعة تلاوتك لسورة الفاتحة",
    time: "Yesterday",
    timeAr: "أمس",
    read: true,
    link: "/achievements",
  },
];

const iconMap = {
  assignment: Calendar,
  recitation: Mic,
  essay: PenTool,
  homework: Camera,
  reminder: BookOpen,
};

const colorMap = {
  assignment: "bg-primary/10 text-primary",
  recitation: "bg-secondary/10 text-secondary",
  essay: "bg-accent/10 text-accent",
  homework: "bg-info/10 text-info",
  reminder: "bg-warning/10 text-warning",
};

export const NotificationBell = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute top-full mt-2 w-80 sm:w-96 bg-card rounded-2xl shadow-elevated border border-border z-50 overflow-hidden ${isAr ? "left-0" : "right-0"}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-card-foreground">
              {isAr ? "الإشعارات" : "Notifications"}
              {unreadCount > 0 && (
                <span className="ml-2 rtl:mr-2 rtl:ml-0 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {unreadCount} {isAr ? "جديد" : "new"}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                {isAr ? "قراءة الكل" : "Mark all read"}
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">{isAr ? "لا توجد إشعارات" : "No notifications"}</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = iconMap[n.type];
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors group ${
                      n.read ? "bg-card" : "bg-primary/[0.03]"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${colorMap[n.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <Link
                      to={n.link}
                      onClick={() => { markAsRead(n.id); setOpen(false); }}
                      className="flex-1 min-w-0"
                    >
                      <p className={`text-sm leading-tight ${n.read ? "text-card-foreground" : "text-card-foreground font-semibold"}`}>
                        {isAr ? n.titleAr : n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {isAr ? n.descriptionAr : n.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1 font-medium">
                        {isAr ? n.timeAr : n.time}
                      </p>
                    </Link>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-muted transition-all flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
