"use client";

import { FriendDetail } from "@/components/FriendDetail";
import { PWA_FRIENDS_STORAGE_KEY } from "@/lib/constants";
import { seedFriends } from "@/lib/seedFriends";

export default function FriendDetailPage({ params }: { params: { friendId: string } }) {
  return (
    <FriendDetail friendId={params.friendId} storageKey={PWA_FRIENDS_STORAGE_KEY} seedFriends={seedFriends} />
  );
}
