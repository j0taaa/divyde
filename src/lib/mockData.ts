// Mock data for the debt tracker app
import type { HairStyle } from "@/components/FriendAvatar";

export interface Debt {
  id: string;
  friendId: string;
  amount: number;
  direction: "they-owe" | "you-owe"; // they-owe = they owe you, you-owe = you owe them
  description: string;
  date: string;
  isPaid: boolean;
}

export interface FriendAvatarData {
  hairColor: string;
  hairStyle: HairStyle;
  eyeColor: string;
  skinColor: string;
  backgroundColor: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar?: FriendAvatarData; // Optional - if not provided, show initials
  avatarColor?: string; // Fallback color for initials avatar
}

export const mockFriends: Friend[] = [
  {
    id: "1",
    name: "Alex Chen",
    avatar: {
      hairColor: "#1a1a1a",
      hairStyle: "short",
      eyeColor: "#5D4E37",
      skinColor: "#F5D0C5",
      backgroundColor: "#3B82F6",
    },
  },
  {
    id: "2",
    name: "Sarah Miller",
    avatar: {
      hairColor: "#8B6914",
      hairStyle: "long",
      eyeColor: "#2E7D32",
      skinColor: "#FDEBD0",
      backgroundColor: "#8B5CF6",
    },
  },
  {
    id: "3",
    name: "Jordan Lee",
    // No avatar - will show initials
    avatarColor: "#22C55E",
  },
  {
    id: "4",
    name: "Taylor Swift",
    avatar: {
      hairColor: "#F4D03F",
      hairStyle: "ponytail",
      eyeColor: "#64B5F6",
      skinColor: "#FDEBD0",
      backgroundColor: "#EC4899",
    },
  },
  {
    id: "5",
    name: "Morgan Freeman",
    // No avatar - will show initials
    avatarColor: "#F59E0B",
  },
];

export const mockDebts: Debt[] = [
  // Alex Chen debts
  {
    id: "d1",
    friendId: "1",
    amount: 25.50,
    direction: "they-owe",
    description: "Dinner at Italian place",
    date: "2024-12-15",
    isPaid: false,
  },
  {
    id: "d2",
    friendId: "1",
    amount: 20.00,
    direction: "they-owe",
    description: "Movie tickets",
    date: "2024-12-10",
    isPaid: false,
  },
  {
    id: "d3",
    friendId: "1",
    amount: 15.00,
    direction: "they-owe",
    description: "Coffee run",
    date: "2024-12-01",
    isPaid: true,
  },

  // Sarah Miller debts
  {
    id: "d4",
    friendId: "2",
    amount: 23.00,
    direction: "you-owe",
    description: "Groceries",
    date: "2024-12-14",
    isPaid: false,
  },
  {
    id: "d5",
    friendId: "2",
    amount: 50.00,
    direction: "they-owe",
    description: "Concert tickets",
    date: "2024-11-28",
    isPaid: true,
  },

  // Jordan Lee debts (all settled)
  {
    id: "d6",
    friendId: "3",
    amount: 30.00,
    direction: "they-owe",
    description: "Uber ride",
    date: "2024-12-05",
    isPaid: true,
  },

  // Taylor Swift debts
  {
    id: "d7",
    friendId: "4",
    amount: 75.00,
    direction: "they-owe",
    description: "Birthday gift split",
    date: "2024-12-12",
    isPaid: false,
  },
  {
    id: "d8",
    friendId: "4",
    amount: 45.75,
    direction: "they-owe",
    description: "Brunch",
    date: "2024-12-08",
    isPaid: false,
  },
  {
    id: "d9",
    friendId: "4",
    amount: 20.00,
    direction: "you-owe",
    description: "Parking",
    date: "2024-12-06",
    isPaid: true,
  },

  // Morgan Freeman debts
  {
    id: "d10",
    friendId: "5",
    amount: 45.00,
    direction: "you-owe",
    description: "Gas money",
    date: "2024-12-16",
    isPaid: false,
  },
  {
    id: "d11",
    friendId: "5",
    amount: 22.25,
    direction: "you-owe",
    description: "Lunch",
    date: "2024-12-11",
    isPaid: false,
  },
  {
    id: "d12",
    friendId: "5",
    amount: 35.00,
    direction: "they-owe",
    description: "Event tickets",
    date: "2024-12-03",
    isPaid: true,
  },
];

// Helper function to calculate balance for a friend
export function calculateBalance(friendId: string, debts: Debt[]): number {
  return debts
    .filter((debt) => debt.friendId === friendId && !debt.isPaid)
    .reduce((sum, debt) => {
      if (debt.direction === "they-owe") {
        return sum + debt.amount;
      } else {
        return sum - debt.amount;
      }
    }, 0);
}

// Helper to get debts for a friend
export function getDebtsForFriend(friendId: string, debts: Debt[]): Debt[] {
  return debts.filter((debt) => debt.friendId === friendId);
}

// Helper to get initials from name
export function getInitials(name: string): string {
  if (!name.trim()) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Default avatar colors for random assignment
export const defaultAvatarColors = [
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#22C55E", // green
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#6B7280", // gray
];
