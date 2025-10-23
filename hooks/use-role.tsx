"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { UserRole } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";

type RoleContextType = {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeView: "list" | "analytics";
  setActiveView: (view: "list" | "analytics") => void;
  t: (key: string) => string;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  deepLinkedComplaintId: string | null;
  setDeepLinkedComplaintId: (id: string | null) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("District Collector");
  const [activeView, setActiveView] = useState<"list" | "analytics">("list");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    null
  );
  const [deepLinkedComplaintId, setDeepLinkedComplaintId] = useState<
    string | null
  >(null);
  const { t } = useLanguage();

  useEffect(() => {
    const storedRole = localStorage.getItem("role") as UserRole | null;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const handleSetRole = (newRole: UserRole) => {
    if (!newRole) return;
    setRole(newRole);
    localStorage.setItem("role", newRole);
    if (newRole !== "District Collector") {
      setActiveView("list");
    }
  };

  const handleSetSelectedComplaintId = useCallback((id: string | null) => {
    setSelectedComplaintId(id);
  }, []);

  const handleSetDeepLinkedComplaintId = useCallback((id: string | null) => {
    setDeepLinkedComplaintId(id);
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole: handleSetRole,
      activeView,
      setActiveView,
      t,
      selectedComplaintId,
      setSelectedComplaintId: handleSetSelectedComplaintId,
      deepLinkedComplaintId,
      setDeepLinkedComplaintId: handleSetDeepLinkedComplaintId,
    }),
    [
      role,
      activeView,
      t,
      selectedComplaintId,
      handleSetSelectedComplaintId,
      deepLinkedComplaintId,
      handleSetDeepLinkedComplaintId,
    ]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
