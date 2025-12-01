"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearSession, loadSession, persistSession, type AuthUser } from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (name: string, email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const existing = loadSession();
    if (existing) {
      setUser(existing);
      setStatus("authenticated");
    } else {
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signIn: (name: string, email: string) => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedName || !trimmedEmail) return;

        const account: AuthUser = {
          id: user?.id ?? crypto.randomUUID(),
          name: trimmedName,
          email: trimmedEmail,
          createdAt: user?.createdAt ?? new Date().toISOString(),
        };

        setUser(account);
        setStatus("authenticated");
        persistSession(account);
      },
      signOut: () => {
        clearSession();
        setUser(null);
        setStatus("unauthenticated");
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
