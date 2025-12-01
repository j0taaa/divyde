import { FriendsManager } from "@/components/FriendsManager";
import { seedFriends } from "@/lib/seedFriends";
import { PWA_FRIENDS_STORAGE_KEY } from "@/lib/constants";

const emptyHint = "Add your first friend to start tracking balances. Everything is saved to your device for the PWA.";

export default function FriendsPage() {
  return (
    <FriendsManager
      storageKey={PWA_FRIENDS_STORAGE_KEY}
      title="Friends & debts"
      helperText="Build and maintain your ledger locally. Each friend gets a clear breakdown of who owes what with quick actions for adding new debts."
      emptyHint={emptyHint}
      seedFriends={seedFriends}
    />
  );
}
