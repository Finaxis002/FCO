import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

type AppNameContextType = {
  appName: string;
  setAppName: (name: string) => Promise<void>;
};

const AppNameContext = createContext<AppNameContextType | undefined>(undefined);

// context/AppNameContext.tsx
export function AppNameProvider({ children }: { children: ReactNode }) {
  const [appName, setAppNameState] = useState("FranchiseFlow");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/settings/app-name")
      .then((res) => setAppNameState(res.data.appName))
      .catch(console.error);
  }, []);

     useEffect(() => {
    if (appName) {
      document.title = appName;
    }
  }, [appName]);


  const setAppName = async (name: string) => {
    await axios.post("/api/settings/app-name", { appName: name });
    setAppNameState(name);
  };

  return (
    <AppNameContext.Provider value={{ appName, setAppName }}>
      {children}
    </AppNameContext.Provider>
  );
}

export function useAppName() {
  const context = useContext(AppNameContext);
  if (!context) throw new Error("useAppName must be used within AppNameProvider");
  return context;
}
