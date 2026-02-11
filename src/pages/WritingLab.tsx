import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { PenTool, CheckCircle, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";

const WritingLab = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const [text, setText] = useState(
    isAr
      ? "التعليم هو أساس بناء المجتمعات. من خلال التعلم والتطور يمكن للإنسان أن يساهم في تقدم وطنه ورفعة أمته."
      : "Education is the foundation of building societies. Through learning and growth, individuals can contribute to the progress of their nation and the advancement of their people."
  );

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "✍️ مختبر الكتابة" : "✍️ Writing Lab"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "اكتب مقالك واحصل على تصحيحات ذكية" : "Write your essay and get AI-powered corrections"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                {isAr ? "المحرر" : "Editor"}
              </h3>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 bg-muted rounded-lg text-muted-foreground font-medium">
                  {isAr ? "عربي" : "Arabic"}
                </button>
                <button className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium">
                  {isAr ? "إنجليزي" : "English"}
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 bg-muted/30 rounded-lg p-4 text-card-foreground text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              dir={isAr ? "rtl" : "ltr"}
              placeholder={isAr ? "ابدأ الكتابة هنا..." : "Start writing here..."}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {text.split(/\s+/).length} {isAr ? "كلمة" : "words"}
              </span>
              <button className="px-4 py-2 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                {isAr ? "تحليل النص" : "Analyze Text"}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="space-y-4">
          {/* Scores */}
          <div className="bg-card rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {isAr ? "التقييم" : "Assessment"}
            </h3>
            <div className="space-y-3">
              {[
                { label: isAr ? "القواعد" : "Grammar", score: 88, color: "bg-success" },
                { label: isAr ? "المفردات" : "Vocabulary", score: 75, color: "bg-primary" },
                { label: isAr ? "الوضوح" : "Clarity", score: 82, color: "bg-info" },
                { label: isAr ? "البنية" : "Structure", score: 90, color: "bg-secondary" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-card-foreground">{item.score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-card rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-card-foreground mb-3 text-sm">
              {isAr ? "اقتراحات التحسين" : "Suggestions"}
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-success/5 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <p className="text-xs text-card-foreground">
                  {isAr ? "بنية جمل ممتازة" : "Excellent sentence structure"}
                </p>
              </div>
              <div className="p-3 bg-warning/5 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-xs text-card-foreground">
                  {isAr ? "حاول تنويع المفردات المستخدمة" : "Try to diversify your vocabulary"}
                </p>
              </div>
              <div className="p-3 bg-info/5 rounded-lg flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                <p className="text-xs text-card-foreground">
                  {isAr ? "أضف أمثلة لدعم حجتك" : "Add examples to support your argument"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default WritingLab;
