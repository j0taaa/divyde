"use client";

import { useState } from "react";
import Link from "next/link";
import { FriendsList } from "@/components/FriendsList";
import { FriendDetail } from "@/components/FriendDetail";
import { AddDebt } from "@/components/AddDebt";
import { History } from "@/components/History";
import { Button } from "@/components/ui/button";
import { Plus, Users, History as HistoryIcon, UserCircle } from "lucide-react";

type Screen = "friends" | "friend-detail" | "add-debt" | "history";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("friends");
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen>("friends");

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

  const handleMarkPaid = (debtId: string) => {
    // This would normally update the debt - for now just log it
    console.log("Marking debt as paid:", debtId);
    // In a real app, we'd update the state here
  };

  const showBottomNav = currentScreen === "friends" || currentScreen === "history";

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
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <UserCircle className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-6">
          {currentScreen === "friends" && (
            <FriendsList
              onAddDebt={handleAddDebt}
              onSelectFriend={handleSelectFriend}
            />
          )}
          {currentScreen === "history" && (
            <History
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
            <AddDebt selectedFriendId={selectedFriendId} onBack={handleBack} />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="mx-auto flex max-w-lg items-center justify-around py-2">
            <button
              onClick={() => setCurrentScreen("friends")}
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
              onClick={() => setCurrentScreen("history")}
              className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
                currentScreen === "history"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HistoryIcon className="h-5 w-5" />
              <span className="text-xs font-medium">History</span>
            </button>
            <Link
              href="/login"
              className="flex flex-col items-center gap-1 px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <UserCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Account</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
