import { FriendsManager } from "@/components/FriendsManager";

const emptyHint = "Add your first friend to start tracking balances without needing an account.";

export default function OfflineFriendsPage() {
  return (
    <FriendsManager
      storageKey="divyde:offline-friends"
      title="Offline friends & debts"
      helperText="Build and maintain your ledger locally. Each friend gets a clear breakdown of who owes what with quick actions for adding new debts."
      emptyHint={emptyHint}
      mode="offline"
    />
  );
}
