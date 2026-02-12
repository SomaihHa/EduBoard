import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { useAppContext } from "@/contexts/AppContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebarState } from "@/contexts/SidebarContext";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { role } = useAppContext();
  const isMobile = useIsMobile();
  const { collapsed } = useSidebarState();

  const marginClass = isMobile
    ? "ml-0 rtl:mr-0"
    : collapsed
      ? "ml-[68px] rtl:ml-0 rtl:mr-[68px]"
      : "ml-64 rtl:ml-0 rtl:mr-64";

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className={`min-h-screen transition-all duration-300 ${marginClass}`}>
        {role === "student" && (
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className={`flex items-center justify-end px-6 lg:px-8 py-2.5 max-w-7xl mx-auto ${isMobile ? "pl-16" : ""}`}>
              <NotificationBell />
            </div>
          </div>
        )}
        <div className={`p-6 lg:p-8 max-w-7xl mx-auto ${isMobile ? "pt-16" : ""}`}>
          {children}
        </div>
      </main>
    </div>
  );
};
