"use client";

import { FriendDetail } from "@/components/FriendDetail";
import { seedFriends } from "../page";

export default function OnlineFriendDetail({ params }: { params: { friendId: string } }) {
  return (
    <FriendDetail
      friendId={params.friendId}
      storageKey="divyde:online-friends"
      mode="online"
      seedFriends={seedFriends}
    />
  );
}
