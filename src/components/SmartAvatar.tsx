"use client";

import { FriendAvatar, type HairStyle } from "@/components/FriendAvatar";
import { getInitials, defaultAvatarColors } from "@/lib/mockData";

interface AvatarData {
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinColor: string;
  backgroundColor: string;
}

interface SmartAvatarProps {
  name: string;
  avatar?: AvatarData;
  avatarColor?: string;
  size?: number;
  className?: string;
}

// Generate a consistent color based on name
function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % defaultAvatarColors.length;
  return defaultAvatarColors[index];
}

export function SmartAvatar({
  name,
  avatar,
  avatarColor,
  size = 48,
  className = "",
}: SmartAvatarProps) {
  // If avatar data exists, show the custom FriendAvatar
  if (avatar) {
    return (
      <FriendAvatar
        hairColor={avatar.hairColor}
        hairStyle={avatar.hairStyle as HairStyle}
        eyeColor={avatar.eyeColor}
        skinColor={avatar.skinColor}
        backgroundColor={avatar.backgroundColor}
        size={size}
        className={`rounded-full ${className}`}
      />
    );
  }

  // Otherwise, show initials with a colored background
  const backgroundColor = avatarColor || getColorFromName(name);
  const initials = getInitials(name);
  
  // Calculate font size based on avatar size
  const fontSize = size * 0.4;

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-medium ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor,
        fontSize,
      }}
    >
      {initials}
    </div>
  );
}
