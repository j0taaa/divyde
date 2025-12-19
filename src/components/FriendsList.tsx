"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SmartAvatar } from "@/components/SmartAvatar";
import { hairColors, eyeColors, skinColors, backgroundColors, type HairStyle } from "@/components/FriendAvatar";
import { mockFriends, mockDebts, calculateBalance, defaultAvatarColors, type Friend, type FriendAvatarData } from "@/lib/mockData";
import { ChevronRight, Plus, Search, User, X, UserPlus, Palette } from "lucide-react";

interface FriendsListProps {
  onAddDebt: (friendId: string) => void;
  onSelectFriend: (friendId: string) => void;
}

const hairStyles: { value: HairStyle; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "long", label: "Long" },
  { value: "curly", label: "Curly" },
  { value: "bald", label: "Bald" },
  { value: "mohawk", label: "Mohawk" },
  { value: "ponytail", label: "Ponytail" },
];

function formatBalance(balance: number): string {
  const absBalance = Math.abs(balance);
  return `$${absBalance.toFixed(2)}`;
}

function FriendCard({
  friend,
  balance,
  onAddDebt,
  onSelect,
}: {
  friend: Friend;
  balance: number;
  onAddDebt: (friendId: string) => void;
  onSelect: (friendId: string) => void;
}) {
  const isOwedMoney = balance > 0;
  const isSettled = balance === 0;

  return (
    <Card
      className="flex flex-row items-center gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onSelect(friend.id)}
    >
      {/* Avatar */}
      <SmartAvatar
        name={friend.name}
        avatar={friend.avatar}
        avatarColor={friend.avatarColor}
        size={48}
      />

      {/* Name and Balance */}
      <div className="flex flex-1 flex-col gap-1">
        <span className="font-medium text-foreground">{friend.name}</span>
        <div className="flex items-center gap-2">
          {isSettled ? (
            <Badge variant="secondary" className="text-xs">
              Settled up
            </Badge>
          ) : isOwedMoney ? (
            <span className="text-sm text-green-600 dark:text-green-400">
              owes you <span className="font-semibold">{formatBalance(balance)}</span>
            </span>
          ) : (
            <span className="text-sm text-red-600 dark:text-red-400">
              you owe <span className="font-semibold">{formatBalance(balance)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Add Debt Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onAddDebt(friend.id);
        }}
        className="shrink-0"
      >
        <Plus className="h-4 w-4" />
      </Button>

      {/* Chevron */}
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Card>
  );
}

function AddFriendForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);
  const [selectedAvatarColor, setSelectedAvatarColor] = useState(defaultAvatarColors[0]);
  const [selectedHairColor, setSelectedHairColor] = useState(hairColors.darkBrown);
  const [selectedHairStyle, setSelectedHairStyle] = useState<HairStyle>("short");
  const [selectedEyeColor, setSelectedEyeColor] = useState(eyeColors.brown);
  const [selectedSkinColor, setSelectedSkinColor] = useState(skinColors.fair);
  const [selectedBgColor, setSelectedBgColor] = useState(backgroundColors.blue);

  const handleSubmit = () => {
    const friendData: Partial<Friend> = {
      name,
    };

    if (useCustomAvatar) {
      friendData.avatar = {
        hairColor: selectedHairColor,
        hairStyle: selectedHairStyle,
        eyeColor: selectedEyeColor,
        skinColor: selectedSkinColor,
        backgroundColor: selectedBgColor,
      };
    } else {
      friendData.avatarColor = selectedAvatarColor;
    }

    console.log(friendData);
    onClose();
  };

  const isValid = name.trim().length > 0;

  // Build avatar data for preview
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
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5" />
            Add New Friend
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Preview */}
        <div className="flex items-center justify-center py-2">
          <SmartAvatar
            name={name || "?"}
            avatar={previewAvatar}
            avatarColor={useCustomAvatar ? undefined : selectedAvatarColor}
            size={80}
          />
        </div>

        {/* Name Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter friend's name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Email (optional)
          </label>
          <Input
            type="email"
            placeholder="Enter friend's email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Avatar Type Toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Avatar Style
          </label>
          <div className="flex gap-2">
            <Button
              variant={!useCustomAvatar ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setUseCustomAvatar(false)}
            >
              Simple (Initials)
            </Button>
            <Button
              variant={useCustomAvatar ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-1"
              onClick={() => setUseCustomAvatar(true)}
            >
              <Palette className="h-4 w-4" />
              Custom Design
            </Button>
          </div>
        </div>

        {/* Simple Avatar Color Selection */}
        {!useCustomAvatar && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Background Color
            </label>
            <div className="flex flex-wrap gap-2">
              {defaultAvatarColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedAvatarColor(color)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    selectedAvatarColor === color
                      ? "border-primary scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom Avatar Options */}
        {useCustomAvatar && (
          <>
            {/* Hair Style */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Hair Style
              </label>
              <div className="flex flex-wrap gap-2">
                {hairStyles.map((style) => (
                  <Button
                    key={style.value}
                    variant={selectedHairStyle === style.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedHairStyle(style.value)}
                  >
                    {style.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Hair Color
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(hairColors).map(([colorName, color]) => (
                  <button
                    key={colorName}
                    onClick={() => setSelectedHairColor(color)}
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      selectedHairColor === color
                        ? "border-primary scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={colorName}
                  />
                ))}
              </div>
            </div>

            {/* Eye Color */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Eye Color
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(eyeColors).map(([colorName, color]) => (
                  <button
                    key={colorName}
                    onClick={() => setSelectedEyeColor(color)}
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      selectedEyeColor === color
                        ? "border-primary scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={colorName}
                  />
                ))}
              </div>
            </div>

            {/* Skin Color */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Skin Color
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(skinColors).map(([colorName, color]) => (
                  <button
                    key={colorName}
                    onClick={() => setSelectedSkinColor(color)}
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      selectedSkinColor === color
                        ? "border-primary scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={colorName}
                  />
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Background Color
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(backgroundColors).map(([colorName, color]) => (
                  <button
                    key={colorName}
                    onClick={() => setSelectedBgColor(color)}
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      selectedBgColor === color
                        ? "border-primary scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={colorName}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={!isValid} onClick={handleSubmit}>
            Add Friend
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FriendsList({ onAddDebt, onSelectFriend }: FriendsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter friends based on search query
  const filteredFriends = mockFriends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total balance across all friends
  const totalBalance = mockFriends.reduce(
    (sum, friend) => sum + calculateBalance(friend.id, mockDebts),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header with total */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Friends</h1>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Overall:</span>
          {totalBalance === 0 ? (
            <Badge variant="secondary">All settled up</Badge>
          ) : totalBalance > 0 ? (
            <span className="font-semibold text-green-600 dark:text-green-400">
              +${totalBalance.toFixed(2)} (owed to you)
            </span>
          ) : (
            <span className="font-semibold text-red-600 dark:text-red-400">
              -${Math.abs(totalBalance).toFixed(2)} (you owe)
            </span>
          )}
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Add Friend Form */}
      {showAddForm && <AddFriendForm onClose={() => setShowAddForm(false)} />}

      {/* Friends List */}
      <div className="flex flex-col gap-3">
        {filteredFriends.length === 0 ? (
          <Card className="border-dashed p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No friends found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          </Card>
        ) : (
          filteredFriends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              balance={calculateBalance(friend.id, mockDebts)}
              onAddDebt={onAddDebt}
              onSelect={onSelectFriend}
            />
          ))
        )}
      </div>

      {/* Add Friend Button */}
      {!showAddForm && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setShowAddForm(true)}
        >
          <User className="h-4 w-4" />
          Add New Friend
        </Button>
      )}
    </div>
  );
}
