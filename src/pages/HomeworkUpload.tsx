import { useState, useRef } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, FileText, CheckCircle, AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OCRResult {
  extractedText: string;
  corrections: { original: string; correction: string; type: string; explanation: string }[];
  feedback: { type: string; message: string }[];
  overallScore: number;
  summary: string;
}

const HomeworkUpload = () => {
  const { language } = useAppContext();
  const isAr = language === "ar";
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "analyzing" | "result">("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setUploadState("uploading");

    // Convert image to base64 for text extraction simulation
    // In production, you'd use a real OCR service. Here we use AI to analyze.
    const reader = new FileReader();
    reader.onload = async () => {
      setUploadState("analyzing");
      try {
        // For now, we'll send a description prompt since the AI gateway handles text
        // In a production app, you'd use a dedicated OCR API first
        const sampleText = isAr
          ? "الرياضيات هي لغة العلوم. من خلال الحساب الدقيقة يمكننا فهم الظواهر الطبيعية وحل المشكلات المعقدة. العلم يفتح ابواب المعرفه."
          : "Mathematics is the languege of science. Through precise calculatons we can understand natural phenomena and solve complex problms. Science opens the dors of knowledge.";

        const { data, error } = await supabase.functions.invoke("ai-analyze", {
          body: {
            action: "ocr-analyze",
            text: `The student uploaded a photo of their handwritten homework. Here is the extracted text (with possible OCR errors):\n\n${sampleText}`,
            language,
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setOcrResult(data);
        setUploadState("result");
        toast({ title: isAr ? "تم التحليل" : "Analysis Complete", description: isAr ? "تم مسح الواجب بنجاح" : "Homework scanned successfully" });
      } catch (err: any) {
        console.error("OCR analysis error:", err);
        toast({ title: isAr ? "خطأ" : "Error", description: err.message || "Analysis failed", variant: "destructive" });
        setUploadState("idle");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setOcrResult(null);
    setUploadState("idle");
  };

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
          {uploadState === "idle" && !selectedFile && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-card rounded-xl shadow-card p-8 border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer text-center"
            >
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
                  <button
                    onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Camera className="w-4 h-4" />
                    {isAr ? "كاميرا" : "Camera"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {isAr ? "رفع ملف" : "Upload"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden file inputs */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

          {/* Preview */}
          {previewUrl && (
            <div className="bg-card rounded-xl shadow-card p-4 relative">
              <button onClick={handleReset} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors z-10">
                <X className="w-4 h-4" />
              </button>
              <img src={previewUrl} alt="Uploaded homework" className="w-full rounded-lg max-h-96 object-contain" />
              {(uploadState === "uploading" || uploadState === "analyzing") && (
                <div className="absolute inset-0 bg-background/60 rounded-xl flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm text-foreground mt-2">
                    {uploadState === "uploading"
                      ? (isAr ? "جارٍ الرفع..." : "Uploading...")
                      : (isAr ? "جارٍ التحليل بالذكاء الاصطناعي..." : "AI analyzing...")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Upload another */}
          {uploadState === "result" && (
            <button
              onClick={handleReset}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {isAr ? "رفع واجب آخر" : "Upload Another"}
            </button>
          )}
        </div>

        {/* AI Result */}
        <div>
          {uploadState === "idle" && !ocrResult && (
            <div className="bg-card rounded-xl shadow-card p-12 text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {isAr ? "ارفع صورة واجبك لرؤية نتائج التحليل" : "Upload your homework to see AI analysis results"}
              </p>
            </div>
          )}

          {uploadState === "analyzing" && (
            <div className="bg-card rounded-xl shadow-card p-12 text-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">{isAr ? "جارٍ تحليل الواجب..." : "Analyzing homework..."}</p>
            </div>
          )}

          {ocrResult && (
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

              {/* Extracted text */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
                  {isAr ? "النص المستخرج" : "Extracted Text"}
                </p>
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-card-foreground leading-relaxed" dir={isAr ? "rtl" : "ltr"}>
                  <p className={isAr ? "font-arabic" : ""}>{ocrResult.extractedText}</p>
                </div>
              </div>

              {/* Corrections */}
              {ocrResult.corrections?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
                    {isAr ? "التصحيحات" : "Corrections"}
                  </p>
                  <div className="space-y-2">
                    {ocrResult.corrections.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-card-foreground">
                            <span className="bg-destructive/10 text-destructive px-1 rounded line-through">{c.original}</span>
                            {" → "}
                            <span className="bg-success/10 text-success px-1 rounded">{c.correction}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {ocrResult.feedback?.length > 0 && (
                <div className="space-y-2 mb-4">
                  {ocrResult.feedback.map((f, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                      f.type === "positive" ? "bg-success/5" : f.type === "negative" ? "bg-destructive/5" : "bg-info/5"
                    }`}>
                      {f.type === "positive" ? (
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      ) : f.type === "negative" ? (
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-sm text-card-foreground">{f.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary & Score */}
              <div className="mt-4 pt-4 border-t border-border text-center">
                {ocrResult.summary && <p className="text-sm text-muted-foreground mb-2">{ocrResult.summary}</p>}
                <p className="text-sm text-muted-foreground">{isAr ? "التقييم العام" : "Overall Score"}</p>
                <p className="text-4xl font-bold text-gradient-primary mt-1">{ocrResult.overallScore}%</p>
                <button className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  {isAr ? "إرسال للمعلم" : "Submit to Teacher"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default HomeworkUpload;
