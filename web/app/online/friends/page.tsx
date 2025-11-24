import { FriendsManager } from "@/components/FriendsManager";
import type { Friend } from "@/lib/friendsStore";

export const seedFriends: Friend[] = [
  {
    id: "seed-riley",
    name: "Riley",
    debts: [
      {
        id: "seed-riley-flight",
        title: "Airport rideshare",
        amount: 85,
        description: "Covered group rideshare from airport",
        direction: "fromFriend",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "seed-ava",
    name: "Ava",
    debts: [
      {
        id: "seed-ava-brunch",
        title: "Team brunch",
        amount: 42.5,
        description: "Brunch for the team meetup",
        direction: "toFriend",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

const emptyHint = "No friends yet. Add teammates or housemates to sync expenses when online services are available.";

export default function OnlineFriendsPage() {
  return (
    <FriendsManager
      storageKey="divyde:online-friends"
      title="Online friends & debts"
      helperText="Prepare data for cloud sync. Add friends, capture what you owe them or what they owe you, and review running balances."
      emptyHint={emptyHint}
      mode="online"
      seedFriends={seedFriends}
    />
  );
}
