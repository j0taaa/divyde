import { FriendsManager } from "@/components/FriendsManager";
import { seedFriends } from "@/lib/seedFriends";
import { PWA_FRIENDS_STORAGE_KEY } from "@/lib/constants";

const emptyHint = "Add your first friend to start tracking balances. Everything saves automatically.";

export default function FriendsPage() {
  return (
    <FriendsManager
      storageKey={PWA_FRIENDS_STORAGE_KEY}
      title="Friends & debts"
      helperText="Build and maintain your ledger without losing track. Each friend gets a clear breakdown of who owes what with quick actions for adding new debts."
      emptyHint={emptyHint}
      seedFriends={seedFriends}
    />
  );
}
