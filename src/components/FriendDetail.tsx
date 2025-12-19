"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SmartAvatar } from "@/components/SmartAvatar";
import {
  mockFriends,
  mockDebts,
  calculateBalance,
  getDebtsForFriend,
  type Debt,
} from "@/lib/mockData";
import { ArrowLeft, Check, Plus, Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface FriendDetailProps {
  friendId: string;
  onBack: () => void;
  onAddDebt: (friendId: string) => void;
  onMarkPaid: (debtId: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DebtCard({
  debt,
  onMarkPaid,
}: {
  debt: Debt;
  onMarkPaid: (debtId: string) => void;
}) {
  const isTheyOwe = debt.direction === "they-owe";

  return (
    <Card className={`${debt.isPaid ? "opacity-60" : ""}`}>
      <CardContent className="flex items-center gap-4 p-4">
        {/* Direction Icon */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isTheyOwe
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {isTheyOwe ? (
            <ArrowDownLeft className="h-5 w-5" />
          ) : (
            <ArrowUpRight className="h-5 w-5" />
          )}
        </div>

        {/* Description and Date */}
        <div className="flex flex-1 flex-col gap-1">
          <span className={`font-medium ${debt.isPaid ? "line-through text-muted-foreground" : ""}`}>
            {debt.description}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(debt.date)}
          </div>
        </div>

        {/* Amount */}
        <div className="flex flex-col items-end gap-1">
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
          {debt.isPaid ? (
            <Badge variant="secondary" className="text-xs">
              Paid
            </Badge>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => onMarkPaid(debt.id)}
            >
              <Check className="h-3 w-3" />
              Mark paid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FriendDetail({
  friendId,
  onBack,
  onAddDebt,
  onMarkPaid,
}: FriendDetailProps) {
  const friend = mockFriends.find((f) => f.id === friendId);
  const debts = getDebtsForFriend(friendId, mockDebts);
  const balance = calculateBalance(friendId, mockDebts);

  const unpaidDebts = debts.filter((d) => !d.isPaid);
  const paidDebts = debts.filter((d) => d.isPaid);

  if (!friend) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">Friend not found</p>
        <Button variant="outline" onClick={onBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <SmartAvatar
            name={friend.name}
            avatar={friend.avatar}
            avatarColor={friend.avatarColor}
            size={48}
          />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">{friend.name}</h1>
            <div className="text-sm">
              {balance === 0 ? (
                <span className="text-muted-foreground">All settled up</span>
              ) : balance > 0 ? (
                <span className="text-green-600 dark:text-green-400">
                  Owes you <span className="font-semibold">${balance.toFixed(2)}</span>
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">
                  You owe <span className="font-semibold">${Math.abs(balance).toFixed(2)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <Button size="sm" onClick={() => onAddDebt(friendId)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Unpaid Debts */}
      {unpaidDebts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Outstanding ({unpaidDebts.length})
          </h2>
          {unpaidDebts.map((debt) => (
            <DebtCard key={debt.id} debt={debt} onMarkPaid={onMarkPaid} />
          ))}
        </div>
      )}

      {/* Empty State for Unpaid */}
      {unpaidDebts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-8">
            <Check className="h-8 w-8 text-green-500" />
            <p className="text-sm text-muted-foreground">All settled up!</p>
          </CardContent>
        </Card>
      )}

      {/* Paid Debts */}
      {paidDebts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            History ({paidDebts.length})
          </h2>
          {paidDebts.map((debt) => (
            <DebtCard key={debt.id} debt={debt} onMarkPaid={onMarkPaid} />
          ))}
        </div>
      )}
    </div>
  );
}
