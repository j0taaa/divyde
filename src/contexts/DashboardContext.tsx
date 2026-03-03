"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, Debt, Friend } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardContextValue {
  friends: Friend[];
  debts: Debt[];
  totals: { totalOwed: number; totalOwing: number };
  isLoading: boolean;
  refreshData: () => Promise<void>;
  markDebtPaid: (debtId: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [totals, setTotals] = useState({ totalOwed: 0, totalOwing: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setFriends([]);
      setDebts([]);
      setTotals({ totalOwed: 0, totalOwing: 0 });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [friendsRes, debtsRes] = await Promise.all([api.getFriends(), api.getDebts()]);
      if (friendsRes.data) {
        setFriends(friendsRes.data.friends);
      }
      if (debtsRes.data) {
        setDebts(debtsRes.data.debts);
        setTotals(debtsRes.data.totals);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const markDebtPaid = useCallback(
    async (debtId: string) => {
      const { error } = await api.updateDebt(debtId, { isPaid: true });
      if (!error) {
        await refreshData();
      }
    },
    [refreshData]
  );

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value = useMemo(
    () => ({ friends, debts, totals, isLoading, refreshData, markDebtPaid }),
    [friends, debts, totals, isLoading, refreshData, markDebtPaid]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardData must be used within DashboardProvider");
  }
  return context;
}
