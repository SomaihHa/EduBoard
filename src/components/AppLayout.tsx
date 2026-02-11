import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { useAppContext } from "@/contexts/AppContext";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { role } = useAppContext();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 rtl:ml-0 rtl:mr-64 min-h-screen">
        {/* Top bar with notifications */}
        {role === "student" && (
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="flex items-center justify-end px-6 lg:px-8 py-2.5 max-w-7xl mx-auto">
              <NotificationBell />
            </div>
          </div>
        )}
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
