import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
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
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const DashboardRouter = () => {
  const { role } = useAppContext();
  return role === "student" ? <StudentDashboard /> : <TeacherDashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
            <Route path="/ai-facilitator" element={<ProtectedRoute><AIFacilitator /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><PracticeRoom /></ProtectedRoute>} />
            <Route path="/quran" element={<ProtectedRoute><QuranAssignments /></ProtectedRoute>} />
            <Route path="/homework" element={<ProtectedRoute><HomeworkUpload /></ProtectedRoute>} />
            <Route path="/writing" element={<ProtectedRoute><WritingLab /></ProtectedRoute>} />
            <Route path="/lectures" element={<ProtectedRoute><LectureNotes /></ProtectedRoute>} />
            <Route path="/presentations" element={<ProtectedRoute><Presentations /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
