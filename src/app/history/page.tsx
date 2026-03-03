"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { History } from "@/components/History";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/contexts/DashboardContext";

export default function HistoryPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { debts, totals, markDebtPaid, isLoading } = useDashboardData();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || (isAuthenticated && isLoading && debts.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppShell>
      <History
        debts={debts}
        totals={totals}
        onMarkPaid={markDebtPaid}
        onSelectFriend={(friendId) => router.push(`/friends/${friendId}?from=history`)}
      />
    </AppShell>
  );
}
