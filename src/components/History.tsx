"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SmartAvatar } from "@/components/SmartAvatar";
import { Debt } from "@/lib/api";
import { Check, Calendar, ArrowUpRight, ArrowDownLeft, Filter } from "lucide-react";
import { useState } from "react";

interface HistoryProps {
  debts: Debt[];
  totals: { totalOwed: number; totalOwing: number };
  onMarkPaid: (debtId: string) => void;
  onSelectFriend: (friendId: string) => void;
}

type FilterType = "all" | "outstanding" | "paid";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
}

function DebtHistoryCard({
  debt,
  onMarkPaid,
  onSelectFriend,
}: {
  debt: Debt;
  onMarkPaid: (debtId: string) => void;
  onSelectFriend: (friendId: string) => void;
}) {
  const friend = debt.friend;
  const isTheyOwe = debt.direction === "they-owe";

  if (!friend) return null;

  return (
    <Card className={`${debt.isPaid ? "opacity-60" : ""}`}>
      <CardContent className="flex items-center gap-3 p-4">
        {/* Friend Avatar */}
        <button onClick={() => onSelectFriend(friend.id)}>
          <SmartAvatar
            name={friend.name}
            avatar={friend.avatar}
            avatarColor={friend.avatarColor}
            size={40}
          />
        </button>

        {/* Direction Icon */}
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            isTheyOwe
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {isTheyOwe ? (
            <ArrowDownLeft className="h-4 w-4" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectFriend(friend.id)}
              className="font-medium hover:underline truncate"
            >
              {friend.name}
            </button>
            {debt.isPaid && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Paid
              </Badge>
            )}
          </div>
          <span className={`text-sm truncate ${debt.isPaid ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>
            {debt.description || "No description"}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {getRelativeDate(debt.date)}
          </div>
        </div>

        {/* Amount and Action */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`font-semibold ${
              debt.isPaid
                ? "text-muted-foreground line-through"
                : isTheyOwe
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isTheyOwe ? "+" : "-"}${debt.amount.toFixed(2)}
          </span>
          {!debt.isPaid && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-xs px-2"
              onClick={() => onMarkPaid(debt.id)}
            >
              <Check className="h-3 w-3" />
              Paid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function History({ debts, totals, onMarkPaid, onSelectFriend }: HistoryProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  // Apply filter
  const filteredDebts = debts.filter((debt) => {
    if (filter === "outstanding") return !debt.isPaid;
    if (filter === "paid") return debt.isPaid;
    return true;
  });

  // Group by date
  const groupedDebts = filteredDebts.reduce((groups, debt) => {
    const date = debt.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(debt);
    return groups;
  }, {} as Record<string, Debt[]>);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">History</h1>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">You&apos;re owed</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              ${totals.totalOwed.toFixed(2)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">You owe</div>
            <div className="text-xl font-bold text-red-600 dark:text-red-400">
              ${totals.totalOwing.toFixed(2)}
            </div>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "outstanding" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("outstanding")}
          >
            Outstanding
          </Button>
          <Button
            variant={filter === "paid" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("paid")}
          >
            Paid
          </Button>
        </div>
      </div>

      {/* Debts List */}
      {filteredDebts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-8">
            <Filter className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {debts.length === 0 ? "No debts yet" : "No debts found"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(groupedDebts).map(([date, dateDebts]) => (
            <div key={date} className="flex flex-col gap-2">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {formatDate(date)}
              </h2>
              {dateDebts.map((debt) => (
                <DebtHistoryCard
                  key={debt.id}
                  debt={debt}
                  onMarkPaid={onMarkPaid}
                  onSelectFriend={onSelectFriend}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
