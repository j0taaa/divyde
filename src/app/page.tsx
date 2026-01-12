"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FriendsList } from "@/components/FriendsList";
import { FriendDetail } from "@/components/FriendDetail";
import { AddDebt } from "@/components/AddDebt";
import { History } from "@/components/History";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { api, Friend, Debt } from "@/lib/api";
import { Plus, Users, History as HistoryIcon, UserCircle, LogOut } from "lucide-react";

type Screen = "friends" | "friend-detail" | "add-debt" | "history";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("friends");
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen>("friends");
  
  // Data state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [totals, setTotals] = useState({ totalOwed: 0, totalOwing: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasSyncedFromUrl = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Initialize friends/history screen from URL (e.g. /?screen=history)
  useEffect(() => {
    if (hasSyncedFromUrl.current) return;
    const screen = searchParams.get("screen");
    if (screen === "history") {
      setCurrentScreen("history");
    }
    hasSyncedFromUrl.current = true;
  }, [searchParams]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const [friendsRes, debtsRes] = await Promise.all([
        api.getFriends(),
        api.getDebts(),
      ]);

      if (friendsRes.data) {
        setFriends(friendsRes.data.friends);
      }
      if (debtsRes.data) {
        setDebts(debtsRes.data.debts);
        setTotals(debtsRes.data.totals);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleAddDebt = (friendId?: string) => {
    setPreviousScreen(currentScreen);
    setSelectedFriendId(friendId ?? null);
    setCurrentScreen("add-debt");
  };

  const handleSelectFriend = (friendId: string) => {
    setPreviousScreen(currentScreen);
    setSelectedFriendId(friendId);
    setCurrentScreen("friend-detail");
  };

  const handleBack = () => {
    if (currentScreen === "add-debt") {
      if (previousScreen === "friend-detail" && selectedFriendId) {
        setCurrentScreen("friend-detail");
      } else {
        setSelectedFriendId(null);
        setCurrentScreen(previousScreen === "history" ? "history" : "friends");
      }
    } else if (currentScreen === "friend-detail") {
      setSelectedFriendId(null);
      setCurrentScreen(previousScreen === "history" ? "history" : "friends");
    } else {
      setSelectedFriendId(null);
      setCurrentScreen("friends");
    }
  };

  const handleMarkPaid = async (debtId: string) => {
    const { error } = await api.updateDebt(debtId, { isPaid: true });
    if (!error) {
      // Refresh data
      await fetchData();
    }
  };

  const handleDebtCreated = async () => {
    await fetchData();
    handleBack();
  };

  const handleFriendCreated = async () => {
    await fetchData();
  };

  const showBottomNav = currentScreen === "friends" || currentScreen === "history";

  // Loading state
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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <h1 className="text-xl font-bold tracking-tight">Divyde</h1>
          <div className="flex items-center gap-2">
            {(currentScreen === "friends" || currentScreen === "history") && (
              <Button size="sm" onClick={() => handleAddDebt()} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Debt
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-6">
          {currentScreen === "friends" && (
            <FriendsList
              friends={friends}
              onAddDebt={handleAddDebt}
              onSelectFriend={handleSelectFriend}
              onFriendCreated={handleFriendCreated}
            />
          )}
          {currentScreen === "history" && (
            <History
              debts={debts}
              totals={totals}
              onMarkPaid={handleMarkPaid}
              onSelectFriend={handleSelectFriend}
            />
          )}
          {currentScreen === "friend-detail" && selectedFriendId && (
            <FriendDetail
              friendId={selectedFriendId}
              onBack={handleBack}
              onAddDebt={handleAddDebt}
              onMarkPaid={handleMarkPaid}
            />
          )}
          {currentScreen === "add-debt" && (
            <AddDebt 
              friends={friends}
              selectedFriendId={selectedFriendId} 
              onBack={handleBack}
              onDebtCreated={handleDebtCreated}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="mx-auto flex max-w-lg items-center justify-around py-2">
            <button
              onClick={() => {
                setCurrentScreen("friends");
                router.replace("/");
              }}
              className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
                currentScreen === "friends"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs font-medium">Friends</span>
            </button>
            <button
              onClick={() => {
                setCurrentScreen("history");
                router.replace("/?screen=history");
              }}
              className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
                currentScreen === "history"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HistoryIcon className="h-5 w-5" />
              <span className="text-xs font-medium">History</span>
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="flex flex-col items-center gap-1 px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <UserCircle className="h-5 w-5" />
              <span className="text-xs font-medium">{user?.name?.split(' ')[0] || 'Account'}</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
