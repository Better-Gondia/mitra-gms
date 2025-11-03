"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import type { UserRole } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";
import { Role as DBRole } from "@prisma/client";

type RoleContextType = {
  role: UserRole;
  setRole: (role: UserRole) => void; // No-op, kept for backward compatibility
  activeView: "list" | "analytics";
  setActiveView: (view: "list" | "analytics") => void;
  t: (key: string) => string;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  deepLinkedComplaintId: string | null;
  setDeepLinkedComplaintId: (id: string | null) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Map database role enum to UI role string
const dbRoleToUIRole: Record<DBRole, UserRole> = {
  USER: "Citizen",
  ADMIN: "Admin",
  SUPERADMIN: "SuperAdmin",
  COLLECTOR_TEAM: "Collector Team",
  COLLECTOR_TEAM_ADVANCED: "Collector Team Advanced",
  DEPARTMENT_TEAM: "Department Team",
  DISTRICT_COLLECTOR: "District Collector",
  SUPERINTENDENT_OF_POLICE: "Superintendent of Police",
  MP_RAJYA_SABHA: "MP Rajya Sabha",
  MP_LOK_SABHA: "MP Lok Sabha",
  MLA_GONDIA: "MLA Gondia",
  MLA_TIRORA: "MLA Tirora",
  MLA_ARJUNI_MORGAON: "MLA Sadak Arjuni",
  MLA_AMGAON_DEORI: "MLA Deori",
  MLC: "MLC",
  IFS: "Citizen",
  ZP_CEO: "Zila Parishad",
};

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState<"list" | "analytics">("list");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    null
  );
  const [deepLinkedComplaintId, setDeepLinkedComplaintId] = useState<
    string | null
  >(null);
  const { t } = useLanguage();

  // Get role from session and map DB role to UI role
  const role: UserRole = useMemo(() => {
    const dbRole = (session?.user as any)?.role as DBRole | undefined;
    if (!dbRole) return "Citizen";
    return dbRoleToUIRole[dbRole] || "Citizen";
  }, [session]);

  // No-op function for backward compatibility (role cannot be changed)
  const handleSetRole = useCallback((_newRole: UserRole) => {
    // Role is now read-only from session, do nothing
  }, []);

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
      handleSetRole,
      activeView,
      setActiveView,
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
