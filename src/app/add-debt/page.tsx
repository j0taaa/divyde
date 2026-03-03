"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AddDebt } from "@/components/AddDebt";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/contexts/DashboardContext";

export default function AddDebtPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { friends, isLoading, refreshData } = useDashboardData();

  const selectedFriendId = searchParams.get("friendId");
  const from = searchParams.get("from");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleBack = () => {
    if (from === "history") {
      router.push("/history");
      return;
    }
    router.push("/");
  };

  if (authLoading || (isAuthenticated && isLoading && friends.length === 0)) {
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
      <AddDebt
        friends={friends}
        selectedFriendId={selectedFriendId}
        onBack={handleBack}
        onDebtCreated={async () => {
          await refreshData();
          handleBack();
        }}
      />
    </AppShell>
  );
}
