import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useAppContext } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import {
  BookOpen, Plus, Send, Loader2, Check, Clock, AlertCircle,
  Play, Square, Mic, MicOff, Trash2, ChevronDown
} from "lucide-react";

// Curated surah list for assignments
const surahOptions = [
  { number: 1, name: "Al-Fatiha", nameAr: "الفاتحة", verses: 7 },
  { number: 36, name: "Ya-Sin", nameAr: "يس", verses: 83 },
  { number: 55, name: "Ar-Rahman", nameAr: "الرحمن", verses: 78 },
  { number: 67, name: "Al-Mulk", nameAr: "الملك", verses: 30 },
  { number: 78, name: "An-Naba", nameAr: "النبأ", verses: 40 },
  { number: 87, name: "Al-A'la", nameAr: "الأعلى", verses: 19 },
  { number: 88, name: "Al-Ghashiyah", nameAr: "الغاشية", verses: 26 },
  { number: 89, name: "Al-Fajr", nameAr: "الفجر", verses: 30 },
  { number: 91, name: "Ash-Shams", nameAr: "الشمس", verses: 15 },
  { number: 93, name: "Ad-Duha", nameAr: "الضحى", verses: 11 },
  { number: 94, name: "Ash-Sharh", nameAr: "الشرح", verses: 8 },
  { number: 95, name: "At-Tin", nameAr: "التين", verses: 8 },
  { number: 96, name: "Al-Alaq", nameAr: "العلق", verses: 19 },
  { number: 97, name: "Al-Qadr", nameAr: "القدر", verses: 5 },
  { number: 99, name: "Az-Zalzalah", nameAr: "الزلزلة", verses: 8 },
  { number: 103, name: "Al-Asr", nameAr: "العصر", verses: 3 },
  { number: 105, name: "Al-Fil", nameAr: "الفيل", verses: 5 },
  { number: 106, name: "Quraysh", nameAr: "قريش", verses: 4 },
  { number: 108, name: "Al-Kawthar", nameAr: "الكوثر", verses: 3 },
  { number: 109, name: "Al-Kafirun", nameAr: "الكافرون", verses: 6 },
  { number: 110, name: "An-Nasr", nameAr: "النصر", verses: 3 },
  { number: 112, name: "Al-Ikhlas", nameAr: "الإخلاص", verses: 4 },
  { number: 113, name: "Al-Falaq", nameAr: "الفلق", verses: 5 },
  { number: 114, name: "An-Nas", nameAr: "الناس", verses: 6 },
];

interface Assignment {
  id: string;
  teacher_id: string;
  surah_number: number;
  surah_name: string;
  surah_name_ar: string;
  ayah_from: number;
  ayah_to: number;
  description: string;
  created_at: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  audio_url: string;
  status: string;
  teacher_feedback: string | null;
  submitted_at: string;
}

const QuranAssignments = () => {
  const { language } = useAppContext();
  const { user, role } = useAuth();
  const isAr = language === "ar";
  const isTeacher = role === "teacher";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [loading, setLoading] = useState(true);

  // Teacher form
  const [showForm, setShowForm] = useState(false);
  const [formSurah, setFormSurah] = useState(0);
  const [formAyahFrom, setFormAyahFrom] = useState(1);
  const [formAyahTo, setFormAyahTo] = useState(1);
  const [formDesc, setFormDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Student recording
  const [recordingFor, setRecordingFor] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (user) fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quran_assignments")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setAssignments(data as Assignment[]);
      // Fetch submissions for each assignment
      const subs: Record<string, Submission[]> = {};
      for (const a of data) {
        const { data: subData } = await supabase
          .from("assignment_submissions")
          .select("*")
          .eq("assignment_id", a.id);
        if (subData) subs[a.id] = subData as Submission[];
      }
      setSubmissions(subs);
    }
    if (error) console.error(error);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    const surah = surahOptions[formSurah];
    const { error } = await supabase.from("quran_assignments").insert({
      teacher_id: user.id,
      surah_number: surah.number,
      surah_name: surah.name,
      surah_name_ar: surah.nameAr,
      ayah_from: formAyahFrom,
      ayah_to: formAyahTo,
      description: formDesc,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isAr ? "تم" : "Created", description: isAr ? "تم إنشاء الواجب" : "Assignment created" });
      setShowForm(false);
      setFormDesc("");
      fetchAssignments();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("quran_assignments").delete().eq("id", id);
    if (!error) fetchAssignments();
  };

  // Student recording
  const startRecording = async (assignmentId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecordingFor(assignmentId);
      setIsRecording(true);
    } catch {
      toast({ title: "Error", description: "Microphone access denied", variant: "destructive" });
    }
  };

  const stopAndSubmit = async () => {
    if (!mediaRecorderRef.current || !recordingFor || !user) return;

    setSubmitting(true);
    const recorder = mediaRecorderRef.current;

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const fileName = `${user.id}/${recordingFor}-${Date.now()}.webm`;

      const { error: uploadErr } = await supabase.storage
        .from("recordings")
        .upload(fileName, blob);

      if (uploadErr) {
        toast({ title: "Error", description: uploadErr.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("recordings").getPublicUrl(fileName);

      const { error: insertErr } = await supabase.from("assignment_submissions").insert({
        assignment_id: recordingFor,
        student_id: user.id,
        audio_url: urlData.publicUrl,
      });

      if (insertErr) {
        toast({ title: "Error", description: insertErr.message, variant: "destructive" });
      } else {
        toast({ title: isAr ? "تم" : "Submitted", description: isAr ? "تم تسليم التلاوة" : "Recitation submitted" });
        fetchAssignments();
      }
      setRecordingFor(null);
      setIsRecording(false);
      setSubmitting(false);
    };

    recorder.stop();
    recorder.stream.getTracks().forEach((t) => t.stop());
  };

  const selectedSurahObj = surahOptions[formSurah];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-emerald-400" />
              {isAr ? "واجبات القرآن" : "Quran Assignments"}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {isTeacher
                ? isAr ? "أنشئ واجبات تلاوة لطلابك" : "Create recitation assignments for students"
                : isAr ? "اعرض واجباتك وقدّم تلاوتك" : "View assignments and submit your recitation"}
            </p>
          </div>

          {isTeacher && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {isAr ? "واجب جديد" : "New Assignment"}
            </button>
          )}
        </div>

        {/* Teacher Create Form */}
        {isTeacher && showForm && (
          <div className="bg-slate-800/60 rounded-2xl border border-white/10 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">{isAr ? "إنشاء واجب جديد" : "Create New Assignment"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Surah Select */}
              <div>
                <label className="text-sm text-slate-400 mb-1 block">{isAr ? "السورة" : "Surah"}</label>
                <select
                  value={formSurah}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setFormSurah(idx);
                    setFormAyahFrom(1);
                    setFormAyahTo(surahOptions[idx].verses);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-700/50 border border-white/10 text-white text-sm"
                >
                  {surahOptions.map((s, i) => (
                    <option key={s.number} value={i}>
                      {s.number}. {s.name} - {s.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ayah from */}
              <div>
                <label className="text-sm text-slate-400 mb-1 block">{isAr ? "من آية" : "From Ayah"}</label>
                <input
                  type="number"
                  min={1}
                  max={selectedSurahObj.verses}
                  value={formAyahFrom}
                  onChange={(e) => setFormAyahFrom(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-700/50 border border-white/10 text-white text-sm"
                />
              </div>

              {/* Ayah to */}
              <div>
                <label className="text-sm text-slate-400 mb-1 block">{isAr ? "إلى آية" : "To Ayah"}</label>
                <input
                  type="number"
                  min={formAyahFrom}
                  max={selectedSurahObj.verses}
                  value={formAyahTo}
                  onChange={(e) => setFormAyahTo(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-700/50 border border-white/10 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">{isAr ? "ملاحظات" : "Notes (optional)"}</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder={isAr ? "تعليمات للطلاب..." : "Instructions for students..."}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-700/50 border border-white/10 text-white text-sm h-20 resize-none placeholder:text-slate-500"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isAr ? "إنشاء" : "Create Assignment"}
            </button>
          </div>
        )}

        {/* Assignments List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>{isAr ? "لا توجد واجبات بعد" : "No assignments yet"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => {
              const mySubs = submissions[a.id] || [];
              const mySubmission = mySubs.find((s) => s.student_id === user?.id);

              return (
                <div key={a.id} className="bg-slate-800/60 rounded-2xl border border-white/10 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {a.surah_name_ar} - {a.surah_name}
                      </h3>
                      <p className="text-emerald-400 text-sm mt-1">
                        {isAr ? `الآيات ${a.ayah_from} - ${a.ayah_to}` : `Ayah ${a.ayah_from} – ${a.ayah_to}`}
                      </p>
                      {a.description && (
                        <p className="text-slate-400 text-sm mt-2">{a.description}</p>
                      )}
                      <p className="text-slate-500 text-xs mt-2">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isTeacher && (
                        <>
                          <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-lg">
                            {mySubs.length} {isAr ? "تسليم" : "submissions"}
                          </span>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Student actions */}
                  {!isTeacher && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      {mySubmission ? (
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                            mySubmission.status === "reviewed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : mySubmission.status === "needs_improvement"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-blue-500/10 text-blue-400"
                          }`}>
                            {mySubmission.status === "reviewed" ? <Check className="w-4 h-4" /> :
                             mySubmission.status === "needs_improvement" ? <AlertCircle className="w-4 h-4" /> :
                             <Clock className="w-4 h-4" />}
                            {mySubmission.status === "reviewed" ? (isAr ? "تمت المراجعة" : "Reviewed") :
                             mySubmission.status === "needs_improvement" ? (isAr ? "يحتاج تحسين" : "Needs Improvement") :
                             (isAr ? "تم التسليم" : "Submitted")}
                          </div>
                          {mySubmission.teacher_feedback && (
                            <p className="text-slate-300 text-sm">{mySubmission.teacher_feedback}</p>
                          )}
                        </div>
                      ) : recordingFor === a.id ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-red-400 animate-pulse">
                            <Mic className="w-5 h-5" />
                            <span className="text-sm font-medium">{isAr ? "جاري التسجيل..." : "Recording..."}</span>
                          </div>
                          <button
                            onClick={stopAndSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
                          >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {isAr ? "إيقاف وتسليم" : "Stop & Submit"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startRecording(a.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 border border-white/10 text-white text-sm hover:bg-slate-700 transition-colors"
                        >
                          <Mic className="w-4 h-4 text-emerald-400" />
                          {isAr ? "سجّل تلاوتك" : "Record Recitation"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Teacher: View submissions */}
                  {isTeacher && mySubs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                      <p className="text-sm font-medium text-slate-300 mb-2">{isAr ? "التسليمات" : "Submissions"}</p>
                      {mySubs.map((s) => (
                        <div key={s.id} className="flex items-center justify-between bg-slate-700/30 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <audio controls src={s.audio_url} className="h-8" />
                            <span className="text-xs text-slate-400">
                              {new Date(s.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-lg ${
                            s.status === "reviewed" ? "bg-emerald-500/10 text-emerald-400" :
                            s.status === "needs_improvement" ? "bg-amber-500/10 text-amber-400" :
                            "bg-blue-500/10 text-blue-400"
                          }`}>
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default QuranAssignments;
