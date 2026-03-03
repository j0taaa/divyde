"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { History as HistoryIcon, LogOut, Plus, UserCircle, Users } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isFriends = pathname === "/";
  const isHistory = pathname === "/history";

  const showBottomNav = isFriends || isHistory;
  const showAddDebt = isFriends || isHistory;

  const addDebtHref = isHistory ? "/add-debt?from=history" : "/add-debt";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <h1 className="text-xl font-bold tracking-tight">Divyde</h1>
          <div className="flex items-center gap-2">
            {showAddDebt && (
              <Button size="sm" onClick={() => router.push(addDebtHref)} className="gap-1.5">
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

      <main className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-6">{children}</div>
      </main>

      {showBottomNav && (
        <nav className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="mx-auto flex max-w-lg items-center justify-around py-2">
            <Link
              href="/"
              className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
                isFriends ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs font-medium">Friends</span>
            </Link>
            <Link
              href="/history"
              className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
                isHistory ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HistoryIcon className="h-5 w-5" />
              <span className="text-xs font-medium">History</span>
            </Link>
            <button
              onClick={() => router.push("/profile")}
              className="flex flex-col items-center gap-1 px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <UserCircle className="h-5 w-5" />
              <span className="text-xs font-medium">{user?.name?.split(" ")[0] || "Account"}</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
