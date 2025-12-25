"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SmartAvatar } from "@/components/SmartAvatar";
import { api, Friend } from "@/lib/api";
import { ArrowLeft, Check, DollarSign, Search, Users, X } from "lucide-react";

interface AddDebtProps {
  friends: Friend[];
  selectedFriendId?: string | null;
  onBack: () => void;
  onDebtCreated: () => void;
}

export function AddDebt({ friends, selectedFriendId, onBack, onDebtCreated }: AddDebtProps) {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"they-owe" | "you-owe">("they-owe");
  const [selectedFriends, setSelectedFriends] = useState<string[]>(
    selectedFriendId ? [selectedFriendId] : []
  );
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter friends based on search query
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    const { error: apiError } = await api.createDebt({
      amount: parseFloat(amount),
      direction,
      description: description || undefined,
      friendIds: selectedFriends,
    });

    if (apiError) {
      setError(apiError);
      setIsLoading(false);
      return;
    }

    onDebtCreated();
  };

  const isValid = amount && parseFloat(amount) > 0 && selectedFriends.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Add Debt</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Amount Input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 text-2xl font-semibold h-14"
              step="0.01"
              min="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Who Owes Who */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Who owes who?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={direction === "they-owe" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setDirection("they-owe")}
            >
              They owe you
            </Button>
            <Button
              variant={direction === "you-owe" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setDirection("you-owe")}
            >
              You owe them
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Select Friends */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            Select people
            {selectedFriends.length > 0 && (
              <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {selectedFriends.length} selected
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Friends List */}
          <div className="flex flex-col gap-2">
            {filteredFriends.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Search className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {friends.length === 0
                    ? "No friends yet. Add a friend first!"
                    : `No friends found matching "${searchQuery}"`}
                </p>
              </div>
            ) : (
              filteredFriends.map((friend) => {
                const isSelected = selectedFriends.includes(friend.id);
                return (
                  <button
                    key={friend.id}
                    onClick={() => toggleFriend(friend.id)}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <SmartAvatar
                      name={friend.name}
                      avatar={friend.avatar}
                      avatarColor={friend.avatarColor}
                      size={40}
                    />
                    <span className="flex-1 text-left font-medium">
                      {friend.name}
                    </span>
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description (optional) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">
            What&apos;s it for? (optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g., Dinner, Movie tickets, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      {isValid && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              {direction === "they-owe" ? (
                <>
                  <span className="font-medium text-foreground">
                    {selectedFriends
                      .map((id) => friends.find((f) => f.id === id)?.name)
                      .join(", ")}
                  </span>{" "}
                  will owe you{" "}
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ${parseFloat(amount).toFixed(2)}
                  </span>
                  {selectedFriends.length > 1 && (
                    <span className="block text-xs mt-1">
                      (${(parseFloat(amount) / selectedFriends.length).toFixed(2)} each)
                    </span>
                  )}
                </>
              ) : (
                <>
                  You will owe{" "}
                  <span className="font-medium text-foreground">
                    {selectedFriends
                      .map((id) => friends.find((f) => f.id === id)?.name)
                      .join(", ")}
                  </span>{" "}
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    ${parseFloat(amount).toFixed(2)}
                  </span>
                  {selectedFriends.length > 1 && (
                    <span className="block text-xs mt-1">
                      (${(parseFloat(amount) / selectedFriends.length).toFixed(2)} each)
                    </span>
                  )}
                </>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button
        size="lg"
        className="w-full"
        disabled={!isValid || isLoading}
        onClick={handleSubmit}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : (
          "Add Debt"
        )}
      </Button>
    </div>
  );
}
