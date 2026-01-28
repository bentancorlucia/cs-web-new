"use client";

import { createContext, useContext } from "react";

interface AdminContextType {
  openSidebar: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({
  children,
  openSidebar,
}: {
  children: React.ReactNode;
  openSidebar: () => void;
}) {
  return (
    <AdminContext.Provider value={{ openSidebar }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
