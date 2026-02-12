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
import PracticeRoom from "./pages/PracticeRoom";
import QuranAssignments from "./pages/QuranAssignments";
import HomeworkUpload from "./pages/HomeworkUpload";
import WritingLab from "./pages/WritingLab";
import LectureNotes from "./pages/LectureNotes";
import Achievements from "./pages/Achievements";
import AIFacilitator from "./pages/AIFacilitator";
import Presentations from "./pages/Presentations";
import SkillsHub from "./pages/SkillsHub";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
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
  
  // If role-restricted and user's role doesn't match, redirect to home
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const DashboardRouter = () => {
  const { role } = useAppContext();
  return role === "teacher" ? <TeacherDashboard /> : <StudentDashboard />;
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
            <Route path="/quran" element={<ProtectedRoute><QuranAssignments /></ProtectedRoute>} />
            {/* Teacher-only routes */}
            <Route path="/presentations" element={<ProtectedRoute allowedRoles={["teacher"]}><Presentations /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </SidebarStateProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
