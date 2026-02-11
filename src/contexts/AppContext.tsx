import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth, AppRole } from "@/hooks/useAuth";

type Language = "en" | "ar";

interface AppContextType {
  role: AppRole;
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: "ltr" | "rtl";
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { role: authRole } = useAuth();
  const [language, setLanguage] = useState<Language>("en");

  // Role is always derived from auth — no manual override
  const role: AppRole = authRole ?? "student";
  const direction = language === "ar" ? "rtl" : "ltr";

  return (
    <AppContext.Provider value={{ role, language, setLanguage, direction }}>
      <div dir={direction}>{children}</div>
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};
