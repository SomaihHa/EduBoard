import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAppContext } from "@/contexts/AppContext";
import {
  Mic2, PenLine, Presentation, Brain, MessageSquare, BookOpen,
  Users, Timer, Target, Sparkles, ChevronRight, Play
} from "lucide-react";

const skills = [
  {
    id: "public-speaking",
    icon: Mic2,
    title: "Public Speaking",
    titleAr: "الخطابة",
    description: "Build confidence, structure speeches, and master delivery techniques.",
    descriptionAr: "بناء الثقة وتنظيم الخطب وإتقان تقنيات الإلقاء.",
    color: "from-violet-500/20 to-purple-500/20",
    accent: "text-violet-400",
    border: "border-violet-500/20",
    modules: [
      "Voice projection & tone",
      "Body language & eye contact",
      "Speech structuring",
      "Overcoming stage fright",
      "Persuasive techniques",
    ],
    modulesAr: [
      "إسقاط الصوت والنبرة",
      "لغة الجسد والتواصل البصري",
      "هيكلة الخطاب",
      "التغلب على رهبة المسرح",
      "تقنيات الإقناع",
    ],
  },
  {
    id: "handwriting",
    icon: PenLine,
    title: "Handwriting",
    titleAr: "تحسين الخط",
    description: "Improve your penmanship with guided exercises for Arabic and English scripts.",
    descriptionAr: "حسّن خطك مع تمارين موجهة للخط العربي والإنجليزي.",
    color: "from-amber-500/20 to-orange-500/20",
    accent: "text-amber-400",
    border: "border-amber-500/20",
    modules: [
      "Letter formation basics",
      "Stroke consistency",
      "Arabic calligraphy (Naskh)",
      "Speed & legibility drills",
      "Creative lettering",
    ],
    modulesAr: [
      "أساسيات تشكيل الحروف",
      "ثبات الخطوط",
      "الخط العربي (النسخ)",
      "تمارين السرعة والوضوح",
      "الخط الإبداعي",
    ],
  },
  {
    id: "presentation",
    icon: Presentation,
    title: "Presentation Skills",
    titleAr: "مهارات العرض",
    description: "Design compelling slides, tell stories, and engage your audience.",
    descriptionAr: "صمم شرائح جذابة واسرد قصصاً وأشرك جمهورك.",
    color: "from-cyan-500/20 to-blue-500/20",
    accent: "text-cyan-400",
    border: "border-cyan-500/20",
    modules: [
      "Slide design principles",
      "Storytelling in presentations",
      "Audience engagement",
      "Q&A handling",
      "Time management",
    ],
    modulesAr: [
      "مبادئ تصميم الشرائح",
      "سرد القصص في العروض",
      "إشراك الجمهور",
      "إدارة الأسئلة والأجوبة",
      "إدارة الوقت",
    ],
  },
  {
    id: "critical-thinking",
    icon: Brain,
    title: "Critical Thinking",
    titleAr: "التفكير النقدي",
    description: "Sharpen your analytical skills, logical reasoning, and problem solving.",
    descriptionAr: "شحذ مهاراتك التحليلية والتفكير المنطقي وحل المشكلات.",
    color: "from-emerald-500/20 to-teal-500/20",
    accent: "text-emerald-400",
    border: "border-emerald-500/20",
    modules: [
      "Identifying assumptions",
      "Logical fallacies",
      "Evidence evaluation",
      "Problem decomposition",
      "Decision making frameworks",
    ],
    modulesAr: [
      "تحديد الافتراضات",
      "المغالطات المنطقية",
      "تقييم الأدلة",
      "تفكيك المشكلات",
      "أطر صنع القرار",
    ],
  },
  {
    id: "debate",
    icon: MessageSquare,
    title: "Debate & Discussion",
    titleAr: "المناظرة والنقاش",
    description: "Learn structured argumentation, rebuttals, and respectful discourse.",
    descriptionAr: "تعلم الحجج المنظمة والردود والحوار المحترم.",
    color: "from-rose-500/20 to-pink-500/20",
    accent: "text-rose-400",
    border: "border-rose-500/20",
    modules: [
      "Argument construction",
      "Counter-arguments & rebuttals",
      "Active listening",
      "Structured debate formats",
      "Respectful disagreement",
    ],
    modulesAr: [
      "بناء الحجج",
      "الحجج المضادة والردود",
      "الاستماع الفعّال",
      "صيغ المناظرة المنظمة",
      "الاختلاف المحترم",
    ],
  },
  {
    id: "time-management",
    icon: Timer,
    title: "Time Management",
    titleAr: "إدارة الوقت",
    description: "Master prioritization, scheduling, and productivity techniques.",
    descriptionAr: "أتقن تحديد الأولويات والجدولة وتقنيات الإنتاجية.",
    color: "from-sky-500/20 to-indigo-500/20",
    accent: "text-sky-400",
    border: "border-sky-500/20",
    modules: [
      "Eisenhower matrix",
      "Pomodoro technique",
      "Goal setting (SMART)",
      "Avoiding procrastination",
      "Study planning",
    ],
    modulesAr: [
      "مصفوفة أيزنهاور",
      "تقنية بومودورو",
      "تحديد الأهداف (SMART)",
      "تجنب التسويف",
      "تخطيط الدراسة",
    ],
  },
];

const SkillsHub = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
              {isAr ? "تطوير الذات" : "Self Development"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isAr ? "مركز المهارات" : "Skills Hub"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-lg">
            {isAr
              ? "اكتشف وتعلم مهارات جديدة تساعدك على التفوق داخل الفصل وخارجه."
              : "Discover and learn new skills that help you excel inside and outside the classroom."}
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => {
            const isExpanded = expandedSkill === skill.id;
            const Icon = skill.icon;
            return (
              <div
                key={skill.id}
                className={`relative rounded-2xl border ${skill.border} bg-gradient-to-br ${skill.color} backdrop-blur-sm p-5 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                  isExpanded ? "sm:col-span-2 lg:col-span-2 row-span-2" : ""
                }`}
                onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl bg-white/5 ${skill.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-[15px]">
                      {isAr ? skill.titleAr : skill.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {isAr ? skill.descriptionAr : skill.description}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 mt-1 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </div>

                {/* Expanded content — modules list */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-white/10 animate-slide-in">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      {isAr ? "الوحدات" : "Modules"}
                    </p>
                    <ul className="space-y-2">
                      {(isAr ? skill.modulesAr : skill.modules).map((mod, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2.5 text-sm text-foreground/80"
                        >
                          <Target className={`w-3.5 h-3.5 flex-shrink-0 ${skill.accent}`} />
                          {mod}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-foreground transition-all`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Future: navigate to skill detail/practice page
                      }}
                    >
                      <Play className="w-3.5 h-3.5" />
                      {isAr ? "ابدأ التعلم" : "Start Learning"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default SkillsHub;
