"use client";

import { useEffect, useState } from "react";
import { hairColors, eyeColors, skinColors, backgroundColors, type HairStyle } from "@/components/FriendAvatar";
import { SmartAvatar } from "@/components/SmartAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, Debt, Friend, FriendAvatarData } from "@/lib/api";
import { defaultAvatarColors } from "@/lib/mockData";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Calendar, Check, Pencil, Plus, Save, X } from "lucide-react";

interface FriendDetailProps {
  friendId: string;
  onBack: () => void;
  onAddDebt: (friendId: string) => void;
  onMarkPaid: (debtId: string) => void;
  onFriendUpdated: () => void;
}

const hairStyles: { value: HairStyle; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "long", label: "Long" },
  { value: "curly", label: "Curly" },
  { value: "bald", label: "Bald" },
  { value: "mohawk", label: "Mohawk" },
  { value: "ponytail", label: "Ponytail" },
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DebtCard({ debt, onMarkPaid }: { debt: Debt; onMarkPaid: (debtId: string) => void }) {
  const isTheyOwe = debt.direction === "they-owe";

  return (
    <Card className={debt.isPaid ? "opacity-60" : ""}>
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isTheyOwe
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {isTheyOwe ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <span className={`font-medium ${debt.isPaid ? "line-through text-muted-foreground" : ""}`}>
            {debt.description || "No description"}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(debt.date)}
          </div>
        </div>

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
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => onMarkPaid(debt.id)}>
              <Check className="h-3 w-3" />
              Mark paid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FriendDetail({ friendId, onBack, onAddDebt, onMarkPaid, onFriendUpdated }: FriendDetailProps) {
  const [friend, setFriend] = useState<(Friend & { debts: Debt[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);
  const [selectedAvatarColor, setSelectedAvatarColor] = useState(defaultAvatarColors[0]);
  const [selectedHairColor, setSelectedHairColor] = useState(hairColors.darkBrown);
  const [selectedHairStyle, setSelectedHairStyle] = useState<HairStyle>("short");
  const [selectedEyeColor, setSelectedEyeColor] = useState(eyeColors.brown);
  const [selectedSkinColor, setSelectedSkinColor] = useState(skinColors.fair);
  const [selectedBgColor, setSelectedBgColor] = useState(backgroundColors.blue);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error: apiError } = await api.getFriend(friendId);
      if (cancelled) return;

      if (apiError) {
        setError(apiError);
      } else if (data) {
        setFriend(data.friend);
        setError("");
      }

      setIsLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [friendId]);

  const refreshFriend = async () => {
    const { data } = await api.getFriend(friendId);
    if (data) {
      setFriend(data.friend);
    }
  };

  const startEditing = () => {
    if (!friend) return;
    setName(friend.name);

    if (friend.avatar) {
      setUseCustomAvatar(true);
      setSelectedHairColor(friend.avatar.hairColor);
      setSelectedHairStyle(friend.avatar.hairStyle as HairStyle);
      setSelectedEyeColor(friend.avatar.eyeColor);
      setSelectedSkinColor(friend.avatar.skinColor);
      setSelectedBgColor(friend.avatar.backgroundColor);
    } else {
      setUseCustomAvatar(false);
      setSelectedAvatarColor(friend.avatarColor || defaultAvatarColors[0]);
    }

    setFormError("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!friend || !name.trim()) {
      setFormError("Name is required");
      return;
    }

    setIsSaving(true);
    const payload: {
      name: string;
      avatarType: "initials" | "custom";
      avatarColor?: string;
      avatar?: FriendAvatarData;
    } = { name: name.trim(), avatarType: useCustomAvatar ? "custom" : "initials" };

    if (useCustomAvatar) {
      payload.avatar = {
        hairColor: selectedHairColor,
        hairStyle: selectedHairStyle,
        eyeColor: selectedEyeColor,
        skinColor: selectedSkinColor,
        backgroundColor: selectedBgColor,
      };
    } else {
      payload.avatarColor = selectedAvatarColor;
    }

    const { error: updateError } = await api.updateFriend(friend.id, payload);
    setIsSaving(false);

    if (updateError) {
      setFormError(updateError);
      return;
    }

    await refreshFriend();
    onFriendUpdated();
    setIsEditing(false);
  };

  const handleMarkPaid = async (debtId: string) => {
    await onMarkPaid(debtId);
    await refreshFriend();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !friend) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">{error || "Friend not found"}</p>
        <Button variant="outline" onClick={onBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const unpaidDebts = friend.debts.filter((d) => !d.isPaid);
  const paidDebts = friend.debts.filter((d) => d.isPaid);
  const previewAvatar: FriendAvatarData | undefined = useCustomAvatar
    ? {
        hairColor: selectedHairColor,
        hairStyle: selectedHairStyle,
        eyeColor: selectedEyeColor,
        skinColor: selectedSkinColor,
        backgroundColor: selectedBgColor,
      }
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <SmartAvatar name={friend.name} avatar={friend.avatar} avatarColor={friend.avatarColor} size={48} />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">{friend.name}</h1>
            <div className="text-sm">
              {friend.balance === 0 ? (
                <span className="text-muted-foreground">All settled up</span>
              ) : friend.balance > 0 ? (
                <span className="text-green-600 dark:text-green-400">
                  Owes you <span className="font-semibold">${friend.balance.toFixed(2)}</span>
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">
                  You owe <span className="font-semibold">${Math.abs(friend.balance).toFixed(2)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={startEditing} title="Edit friend">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={() => onAddDebt(friendId)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {isEditing && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-4">
            {formError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {formError}
              </div>
            )}
            <div className="flex items-center justify-center">
              <SmartAvatar
                name={name || "?"}
                avatar={previewAvatar}
                avatarColor={useCustomAvatar ? undefined : selectedAvatarColor}
                size={72}
              />
            </div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Friend name" />

            <div className="flex gap-2">
              <Button variant={!useCustomAvatar ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setUseCustomAvatar(false)}>
                Simple Icon
              </Button>
              <Button variant={useCustomAvatar ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setUseCustomAvatar(true)}>
                Custom Icon
              </Button>
            </div>

            {!useCustomAvatar ? (
              <div className="flex flex-wrap gap-2">
                {defaultAvatarColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 ${selectedAvatarColor === color ? "border-foreground" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedAvatarColor(color)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <select className="rounded-md border bg-background px-2 py-1" value={selectedHairStyle} onChange={(e) => setSelectedHairStyle(e.target.value as HairStyle)}>
                  {hairStyles.map((style) => (
                    <option key={style.value} value={style.value}>{style.label}</option>
                  ))}
                </select>
                <select className="rounded-md border bg-background px-2 py-1" value={selectedHairColor} onChange={(e) => setSelectedHairColor(e.target.value)}>
                  {Object.entries(hairColors).map(([key, value]) => (
                    <option key={key} value={value}>{key}</option>
                  ))}
                </select>
                <select className="rounded-md border bg-background px-2 py-1" value={selectedEyeColor} onChange={(e) => setSelectedEyeColor(e.target.value)}>
                  {Object.entries(eyeColors).map(([key, value]) => (
                    <option key={key} value={value}>{key}</option>
                  ))}
                </select>
                <select className="rounded-md border bg-background px-2 py-1" value={selectedSkinColor} onChange={(e) => setSelectedSkinColor(e.target.value)}>
                  {Object.entries(skinColors).map(([key, value]) => (
                    <option key={key} value={value}>{key}</option>
                  ))}
                </select>
                <select className="col-span-2 rounded-md border bg-background px-2 py-1" value={selectedBgColor} onChange={(e) => setSelectedBgColor(e.target.value)}>
                  {Object.entries(backgroundColors).map(([key, value]) => (
                    <option key={key} value={value}>{key}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                <X className="mr-1 h-4 w-4" />Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={isSaving || !name.trim()}>
                <Save className="mr-1 h-4 w-4" />{isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {unpaidDebts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Outstanding ({unpaidDebts.length})</h2>
          {unpaidDebts.map((debt) => (
            <DebtCard key={debt.id} debt={debt} onMarkPaid={handleMarkPaid} />
          ))}
        </div>
      )}

      {unpaidDebts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-8">
            <Check className="h-8 w-8 text-green-500" />
            <p className="text-sm text-muted-foreground">All settled up!</p>
          </CardContent>
        </Card>
      )}

      {paidDebts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">History ({paidDebts.length})</h2>
          {paidDebts.map((debt) => (
            <DebtCard key={debt.id} debt={debt} onMarkPaid={handleMarkPaid} />
          ))}
        </div>
      )}
    </div>
  );
}
