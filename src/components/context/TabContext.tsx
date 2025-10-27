import { createContext, useContext, useState, ReactNode } from "react";

// Create Context
const TabContext = createContext<any>(null);

// Context Provider Component
export const TabProvider = ({ children }: { children: ReactNode }) => {
    const [activeTab, setActiveTab] = useState("pf-report");

    return (
        <TabContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </TabContext.Provider>
    );
};

// Custom Hook for Using Context
export const useTab = () => useContext(TabContext);
