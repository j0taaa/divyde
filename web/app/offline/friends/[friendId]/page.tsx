"use client";

import { FriendDetail } from "@/components/FriendDetail";

export default function OfflineFriendDetail({ params }: { params: { friendId: string } }) {
  return (
    <FriendDetail
      friendId={params.friendId}
      storageKey="divyde:offline-friends"
      mode="offline"
    />
  );
}
