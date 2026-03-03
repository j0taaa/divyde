"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { FriendDetail } from "@/components/FriendDetail";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function FriendPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const handleBack = () => {
    const from = searchParams.get("from");
    if (from === "history") {
      router.push("/?screen=history");
      return;
    }
    router.push("/");
  };

  const handleAddDebt = (friendId: string) => {
    router.push(`/?screen=add-debt&friendId=${friendId}&from=friend-detail`);
  };

  const handleMarkPaid = async (debtId: string) => {
    const { error } = await api.updateDebt(debtId, { isPaid: true });
    if (error) {
      console.error("Failed to mark debt paid:", error);
    }
  };

  const handleFriendUpdated = () => {
    // No-op: FriendDetail already refreshes local friend state after updates.
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <FriendDetail
        friendId={params.id}
        onBack={handleBack}
        onAddDebt={handleAddDebt}
        onMarkPaid={handleMarkPaid}
        onFriendUpdated={handleFriendUpdated}
      />
    </div>
  );
}
