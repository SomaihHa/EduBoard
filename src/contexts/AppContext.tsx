import React, { createContext, useContext, useState, ReactNode } from "react";

type Role = "student" | "teacher";
type Language = "en" | "ar";

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: "ltr" | "rtl";
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>("student");
  const [language, setLanguage] = useState<Language>("en");

  const direction = language === "ar" ? "rtl" : "ltr";

  return (
    <AppContext.Provider value={{ role, setRole, language, setLanguage, direction }}>
      <div dir={direction}>{children}</div>
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};
