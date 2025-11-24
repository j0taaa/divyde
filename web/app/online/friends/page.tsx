import { FriendsManager } from "@/components/FriendsManager";
import { seedFriends } from "@/lib/seedFriends";

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
