"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "organizer" | "subscriber";

export interface Organization {
  id: string;
  name: string;
  plan: string;
  code: string;
  badge: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  setRole: (role: UserRole) => void;
  organizations: Organization[];
  activeOrg: Organization;
  setActiveOrg: (org: Organization) => void;
  login: (email: string, role: UserRole, name?: string) => void;
  logout: () => void;
}

export const DEFAULT_ORGS: Organization[] = [
  {
    id: "org-1",
    name: "Apex Chits & Finance",
    plan: "Registered ROSCA",
    code: "APEX-HQ",
    badge: "Primary",
  },
  {
    id: "org-2",
    name: "Royal Chits Ltd",
    plan: "Licensed Foreperson",
    code: "RYL-SOUTH",
    badge: "Branch 02",
  },
  {
    id: "org-3",
    name: "Sri Lakshmi Mutual Chits",
    plan: "Enterprise",
    code: "SLM-NORTH",
    badge: "Branch 03",
  },
];

const DEFAULT_USER: UserProfile = {
  name: "Rajesh Sharma",
  email: "rajesh@chits.io",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  role: "organizer",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [role, setRoleState] = useState<UserRole>("organizer");
  const [organizations, setOrganizations] = useState<Organization[]>(DEFAULT_ORGS);
  const [activeOrg, setActiveOrgState] = useState<Organization>(DEFAULT_ORGS[0]);

  // Load state from localStorage on client mount
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("chit_user_role") as UserRole | null;
      if (savedRole && (savedRole === "organizer" || savedRole === "subscriber")) {
        setRoleState(savedRole);
        setUser((prev) => ({ ...prev, role: savedRole }));
      }

      const savedOrgId = localStorage.getItem("chit_active_org");
      if (savedOrgId) {
        const found = DEFAULT_ORGS.find((o) => o.id === savedOrgId);
        if (found) setActiveOrgState(found);
      }

      const savedUser = localStorage.getItem("chit_user_profile");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore SSR storage access errors
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setUser((prev) => {
      const updated = { ...prev, role: newRole };
      try {
        localStorage.setItem("chit_user_role", newRole);
        localStorage.setItem("chit_user_profile", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const setActiveOrg = (org: Organization) => {
    setActiveOrgState(org);
    try {
      localStorage.setItem("chit_active_org", org.id);
    } catch {}
  };

  const login = (email: string, newRole: UserRole, name?: string) => {
    const updated: UserProfile = {
      name: name || (newRole === "organizer" ? "Rajesh Sharma (Admin)" : "Anil Kumar (Subscriber)"),
      email: email || (newRole === "organizer" ? "admin@chits.io" : "subscriber@chits.io"),
      avatar: DEFAULT_USER.avatar,
      role: newRole,
    };
    setUser(updated);
    setRoleState(newRole);
    try {
      localStorage.setItem("chit_user_role", newRole);
      localStorage.setItem("chit_user_profile", JSON.stringify(updated));
    } catch {}
  };

  const logout = () => {
    const defaultUser: UserProfile = {
      ...DEFAULT_USER,
      role: "organizer",
    };
    setUser(defaultUser);
    setRoleState("organizer");
    try {
      localStorage.removeItem("chit_user_role");
      localStorage.removeItem("chit_user_profile");
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        organizations,
        activeOrg,
        setActiveOrg,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
