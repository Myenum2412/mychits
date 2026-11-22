"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "orgmenu" | "chits";

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

export interface PredefinedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  roleBadge: string;
  description: string;
  avatar: string;
  defaultPassword: string;
}

// 2 Predefined Users: OrgMenu (as Admin) and Chits (for common user)
export const PREDEFINED_USERS: Record<UserRole, PredefinedUser> = {
  orgmenu: {
    id: "user-admin",
    name: "OrgMenu Admin",
    email: "admin@orgmenu.com",
    role: "orgmenu",
    roleLabel: "OrgMenu",
    roleBadge: "Admin",
    description: "Chit Fund Foreperson & Organization Administrator with full controls.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    defaultPassword: "admin",
  },
  chits: {
    id: "user-common",
    name: "Chits Member",
    email: "user@chits.com",
    role: "chits",
    roleLabel: "Chits",
    roleBadge: "Common User",
    description: "Chit subscriber portal to bid in auctions, view dividends and pay dues.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    defaultPassword: "user",
  },
};

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
  name: PREDEFINED_USERS.orgmenu.name,
  email: PREDEFINED_USERS.orgmenu.email,
  avatar: PREDEFINED_USERS.orgmenu.avatar,
  role: "orgmenu",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [role, setRoleState] = useState<UserRole>("orgmenu");
  const [organizations, setOrganizations] = useState<Organization[]>(DEFAULT_ORGS);
  const [activeOrg, setActiveOrgState] = useState<Organization>(DEFAULT_ORGS[0]);

  // Load state from localStorage on client mount
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("chit_user_role") as UserRole | null;
      if (savedRole && (savedRole === "orgmenu" || savedRole === "chits")) {
        setRoleState(savedRole);
        const predefined = PREDEFINED_USERS[savedRole];
        setUser((prev) => ({
          ...prev,
          role: savedRole,
          name: prev.name || predefined.name,
          email: prev.email || predefined.email,
        }));
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
    const predefined = PREDEFINED_USERS[newRole];
    setUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        role: newRole,
        name: predefined.name,
        email: predefined.email,
        avatar: predefined.avatar,
      };
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
    const predefined = PREDEFINED_USERS[newRole];
    const updated: UserProfile = {
      name: name || predefined.name,
      email: email || predefined.email,
      avatar: predefined.avatar,
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
      role: "orgmenu",
    };
    setUser(defaultUser);
    setRoleState("orgmenu");
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
