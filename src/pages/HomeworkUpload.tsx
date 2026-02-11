import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { Camera, Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

const HomeworkUpload = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "result">("result");

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "📸 مسح الواجبات" : "📸 Homework Scanner"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "صوّر واجبك واحصل على تصحيح ذكي فوري" : "Snap your homework and get instant AI correction"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload area */}
        <div>
          <div className="bg-card rounded-xl shadow-card p-8 border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground">
                  {isAr ? "التقط صورة أو ارفع ملف" : "Take a photo or upload a file"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAr ? "يدعم الصور والملفات المكتوبة بخط اليد" : "Supports images and handwritten documents"}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  <Camera className="w-4 h-4" />
                  {isAr ? "كاميرا" : "Camera"}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
                  <Upload className="w-4 h-4" />
                  {isAr ? "رفع ملف" : "Upload"}
                </button>
              </div>
            </div>
          </div>

          {/* Recent uploads */}
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-3">
              {isAr ? "الواجبات الأخيرة" : "Recent Uploads"}
            </h3>
            <div className="space-y-2">
              {[
                { name: isAr ? "واجب الرياضيات" : "Math Homework", status: "reviewed", score: 85 },
                { name: isAr ? "مقال العربي" : "Arabic Essay", status: "pending", score: null },
                { name: isAr ? "ورقة العلوم" : "Science Sheet", status: "reviewed", score: 92 },
              ].map((item, i) => (
                <div key={i} className="bg-card rounded-lg shadow-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                  </div>
                  {item.status === "reviewed" ? (
                    <span className="text-sm font-bold text-success">{item.score}%</span>
                  ) : (
                    <span className="text-xs text-warning font-medium px-2 py-0.5 bg-sand rounded-full">
                      {isAr ? "بانتظار المراجعة" : "Pending"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Result */}
        <div className="bg-card rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">
              {isAr ? "نتيجة المسح الذكي" : "AI Scan Results"}
            </h3>
            <span className="text-xs bg-mint text-success font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {isAr ? "مكتمل" : "Completed"}
            </span>
          </div>

          {/* OCR result */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
              {isAr ? "النص المستخرج" : "Extracted Text"}
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-card-foreground leading-relaxed" dir="rtl">
              <p className="font-arabic">
                الرياضيات هي لغة العلوم. من خلال{" "}
                <span className="bg-destructive/10 text-destructive px-1 rounded line-through">الحساب</span>{" "}
                <span className="bg-success/10 text-success px-1 rounded">الحسابات</span>{" "}
                الدقيقة يمكننا فهم الظواهر الطبيعية وحل المشكلات المعقدة.
              </p>
            </div>
          </div>

          {/* Feedback items */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  {isAr ? "خطأ إملائي" : "Spelling Error"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "'الحساب' → 'الحسابات' (جمع مناسب للسياق)" : "'Hisab' → 'Hisabaat' (correct plural form)"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-success/5 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  {isAr ? "بنية الجملة سليمة" : "Good Sentence Structure"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "تسلسل منطقي واضح" : "Clear logical flow and coherent argument"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-info/5 rounded-lg">
              <FileText className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  {isAr ? "اقتراح تحسين" : "Improvement Suggestion"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "أضف أمثلة عملية لدعم الفكرة" : "Add practical examples to support the main idea"}
                </p>
              </div>
            </div>
          </div>

          {/* Overall score */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">{isAr ? "التقييم العام" : "Overall Score"}</p>
            <p className="text-4xl font-bold text-gradient-primary mt-1">85%</p>
            <button className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              {isAr ? "إرسال للمعلم" : "Submit to Teacher"}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HomeworkUpload;
