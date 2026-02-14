import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { SidebarStateProvider } from "@/contexts/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherSubmissions from "./pages/TeacherSubmissions";
import TeacherSettings from "./pages/TeacherSettings";
import TeacherAnalytics from "./pages/TeacherAnalytics";
import PracticeRoom from "./pages/PracticeRoom";
import QuranAssignments from "./pages/QuranAssignments";
import HomeworkUpload from "./pages/HomeworkUpload";
import WritingLab from "./pages/WritingLab";
import LectureNotes from "./pages/LectureNotes";
import Achievements from "./pages/Achievements";
import AIFacilitator from "./pages/AIFacilitator";
import Presentations from "./pages/Presentations";
import PronunciationTraining from "./pages/PronunciationTraining";
import SkillsHub from "./pages/SkillsHub";
import ClassManagement from "./pages/ClassManagement";
import AuthPage from "./pages/AuthPage";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: ("student" | "teacher")[] }) => {
  const { user, loading, role } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const DashboardRouter = () => {
  const { role } = useAppContext();
  return role === "teacher" ? <TeacherDashboard /> : <StudentDashboard />;
};

const TeacherFallback = () => {
  const { role } = useAppContext();
  if (role !== "teacher") return <Navigate to="/" replace />;
  return <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <SidebarStateProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
            <Route path="/ai-facilitator" element={<ProtectedRoute><AIFacilitator /></ProtectedRoute>} />
            {/* Student-only routes */}
            <Route path="/practice" element={<ProtectedRoute allowedRoles={["student"]}><PracticeRoom /></ProtectedRoute>} />
            <Route path="/homework" element={<ProtectedRoute allowedRoles={["student"]}><HomeworkUpload /></ProtectedRoute>} />
            <Route path="/writing" element={<ProtectedRoute allowedRoles={["student"]}><WritingLab /></ProtectedRoute>} />
            <Route path="/lectures" element={<ProtectedRoute allowedRoles={["student"]}><LectureNotes /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute allowedRoles={["student"]}><SkillsHub /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute allowedRoles={["student"]}><Achievements /></ProtectedRoute>} />
            {/* Shared routes */}
            <Route path="/assignments" element={<ProtectedRoute><QuranAssignments /></ProtectedRoute>} />
            <Route path="/pronunciation" element={<ProtectedRoute><PronunciationTraining /></ProtectedRoute>} />
            {/* Legacy route redirect */}
            <Route path="/quran" element={<Navigate to="/assignments" replace />} />
            <Route path="/classes" element={<ProtectedRoute><ClassManagement /></ProtectedRoute>} />
            {/* Teacher-only routes */}
            <Route path="/presentations" element={<ProtectedRoute allowedRoles={["teacher"]}><Presentations /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherStudents /></ProtectedRoute>} />
            <Route path="/submissions" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherSubmissions /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherSettings /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherAnalytics /></ProtectedRoute>} />
            {/* Catch-all: redirect to home instead of 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </SidebarStateProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
