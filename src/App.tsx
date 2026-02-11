import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import PracticeRoom from "./pages/PracticeRoom";
import HomeworkUpload from "./pages/HomeworkUpload";
import WritingLab from "./pages/WritingLab";
import LectureNotes from "./pages/LectureNotes";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            <Route path="/" element={<DashboardRouter />} />
            <Route path="/practice" element={<PracticeRoom />} />
            <Route path="/quran" element={<PracticeRoom />} />
            <Route path="/homework" element={<HomeworkUpload />} />
            <Route path="/writing" element={<WritingLab />} />
            <Route path="/lectures" element={<LectureNotes />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
