"use client";

export type HairStyle =
  | "short"
  | "long"
  | "curly"
  | "bald"
  | "mohawk"
  | "ponytail"
  | "buzzcut"
  | "afro"
  | "bob"
  | "braids"
  | "spiky"
  | "waves"
  | "spaceBuns"
  | "sidePart";

export interface FriendAvatarProps {
  hairColor?: string;
  hairStyle?: HairStyle;
  eyeColor?: string;
  skinColor?: string;
  backgroundColor?: string;
  size?: number;
  className?: string;
}

const defaultColors = {
  hair: "#4A3728",
  eyes: "#5D4E37",
  skin: "#F5D0C5",
  background: "#E8E8E8",
};

export function FriendAvatar({
  hairColor = defaultColors.hair,
  hairStyle = "short",
  eyeColor = defaultColors.eyes,
  skinColor = defaultColors.skin,
  backgroundColor = defaultColors.background,
  size = 48,
  className = "",
}: FriendAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill={backgroundColor} />

      {/* Hair rendered behind shoulders/head for longer styles */}
      <BackHairComponent style={hairStyle} color={hairColor} />

      {/* Neck */}
      <path
        d="M40 70 L40 85 L60 85 L60 70"
        fill={skinColor}
      />

      {/* Ears */}
      <ellipse cx="25" cy="50" rx="5" ry="7" fill={skinColor} />
      <ellipse cx="75" cy="50" rx="5" ry="7" fill={skinColor} />

      {/* Face */}
      <ellipse cx="50" cy="50" rx="25" ry="28" fill={skinColor} />

      {/* Hair */}
      <HairComponent style={hairStyle} color={hairColor} skinColor={skinColor} />

      {/* Eyes */}
      <g>
        {/* Left eye white */}
        <ellipse cx="40" cy="48" rx="6" ry="5" fill="white" />
        {/* Right eye white */}
        <ellipse cx="60" cy="48" rx="6" ry="5" fill="white" />
        {/* Left iris */}
        <circle cx="40" cy="48" r="3" fill={eyeColor} />
        {/* Right iris */}
        <circle cx="60" cy="48" r="3" fill={eyeColor} />
        {/* Left pupil */}
        <circle cx="40" cy="48" r="1.5" fill="#1a1a1a" />
        {/* Right pupil */}
        <circle cx="60" cy="48" r="1.5" fill="#1a1a1a" />
        {/* Eye shine */}
        <circle cx="41" cy="47" r="1" fill="white" />
        <circle cx="61" cy="47" r="1" fill="white" />
      </g>

      {/* Eyebrows */}
      <path
        d="M34 42 Q40 40 46 42"
        stroke={hairColor}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M54 42 Q60 40 66 42"
        stroke={hairColor}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose */}
      <path
        d="M50 52 L48 58 Q50 60 52 58 L50 52"
        fill={adjustColor(skinColor, -20)}
      />

      {/* Mouth */}
      <path
        d="M43 66 Q50 72 57 66"
        stroke="#C4756E"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheeks (blush) */}
      <ellipse cx="34" cy="58" rx="5" ry="3" fill="#FFB6B6" opacity="0.4" />
      <ellipse cx="66" cy="58" rx="5" ry="3" fill="#FFB6B6" opacity="0.4" />
    </svg>
  );
}

function HairComponent({ style, color, skinColor }: { style: HairStyle; color: string; skinColor: string }) {
  switch (style) {
    case "short":
      return (
        <g>
          <path
            d="M25 45 Q25 20 50 18 Q75 20 75 45 Q70 35 50 33 Q30 35 25 45"
            fill={color}
          />
          <path
            d="M30 38 Q35 32 50 30 Q65 32 70 38"
            fill={color}
          />
        </g>
      );

    case "long":
      return (
        <g>
          {/* Top of hair */}
          <path
            d="M25 45 Q25 20 50 18 Q75 20 75 45 Q70 35 50 33 Q30 35 25 45"
            fill={color}
          />
          {/* Left side hair covering ear */}
          <path
            d="M25 45 Q22 50 22 60 Q22 70 25 75 L30 75 Q28 65 28 55 Q28 48 30 42 Z"
            fill={color}
          />
          {/* Right side hair covering ear */}
          <path
            d="M75 45 Q78 50 78 60 Q78 70 75 75 L70 75 Q72 65 72 55 Q72 48 70 42 Z"
            fill={color}
          />
        </g>
      );

    case "curly":
      return (
        <g>
          {/* Main curly hair mass */}
          <circle cx="35" cy="28" r="10" fill={color} />
          <circle cx="50" cy="22" r="10" fill={color} />
          <circle cx="65" cy="28" r="10" fill={color} />
          <circle cx="28" cy="38" r="8" fill={color} />
          <circle cx="72" cy="38" r="8" fill={color} />
          <circle cx="42" cy="26" r="8" fill={color} />
          <circle cx="58" cy="26" r="8" fill={color} />
          {/* Fill gaps */}
          <path
            d="M28 35 Q30 25 50 22 Q70 25 72 35 Q65 30 50 28 Q35 30 28 35"
            fill={color}
          />
        </g>
      );

    case "bald":
      return (
        <g>
          {/* Slight shine on bald head */}
          <ellipse cx="45" cy="30" rx="8" ry="4" fill="white" opacity="0.2" />
        </g>
      );

    case "mohawk":
      return (
        <g>
          {/* Base strip on head */}
          <path
            d="M42 32 Q50 28 58 32 L58 22 Q50 18 42 22 Z"
            fill={color}
          />
          {/* Mohawk spikes standing up */}
          <path
            d="M44 22 L50 5 L56 22 Q50 18 44 22"
            fill={color}
          />
          <path
            d="M46 20 L50 8 L54 20"
            fill={color}
          />
          {/* Shaved sides hint */}
          <ellipse cx="32" cy="35" rx="4" ry="6" fill={adjustColor(skinColor, -10)} opacity="0.3" />
          <ellipse cx="68" cy="35" rx="4" ry="6" fill={adjustColor(skinColor, -10)} opacity="0.3" />
        </g>
      );

    case "ponytail":
      return (
        <g>
          {/* Top hair */}
          <path
            d="M28 45 Q28 25 50 22 Q72 25 72 45 Q65 35 50 33 Q35 35 28 45"
            fill={color}
          />
          {/* Front fringe */}
          <path d="M34 33 Q42 28 50 30 Q58 28 66 33 Q56 36 50 36 Q44 36 34 33" fill={color} />
          {/* Hair tie */}
          <ellipse cx="50" cy="21" rx="4" ry="2" fill={adjustColor(color, -30)} />
        </g>
      );

    case "buzzcut":
      return (
        <g>
          <path d="M27 45 Q27 25 50 22 Q73 25 73 45 Q65 37 50 35 Q35 37 27 45" fill={adjustColor(color, 10)} />
          <path d="M32 35 Q40 30 50 30 Q60 30 68 35" stroke={adjustColor(color, -10)} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );

    case "afro":
      return (
        <g>
          <circle cx="50" cy="28" r="20" fill={color} />
          <circle cx="33" cy="32" r="9" fill={color} />
          <circle cx="67" cy="32" r="9" fill={color} />
          <path d="M26 43 Q35 37 50 37 Q65 37 74 43 Q66 41 50 41 Q34 41 26 43" fill={color} />
        </g>
      );

    case "bob":
      return (
        <g>
          <path d="M24 46 Q24 24 50 21 Q76 24 76 46 Q73 42 50 40 Q27 42 24 46" fill={color} />
          <path d="M25 45 Q22 56 25 71 Q28 74 34 73 Q30 62 31 48" fill={color} />
          <path d="M75 45 Q78 56 75 71 Q72 74 66 73 Q70 62 69 48" fill={color} />
        </g>
      );

    case "braids":
      return (
        <g>
          <path d="M26 45 Q26 24 50 21 Q74 24 74 45 Q67 36 50 35 Q33 36 26 45" fill={color} />
          <path d="M28 46 L24 53 L28 60 L24 67 L28 74" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M72 46 L76 53 L72 60 L76 67 L72 74" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="28" cy="76" r="2" fill={adjustColor(color, -35)} />
          <circle cx="72" cy="76" r="2" fill={adjustColor(color, -35)} />
        </g>
      );

    case "spiky":
      return (
        <g>
          <path d="M24 44 L30 30 L38 36 L44 20 L50 33 L56 18 L62 35 L70 28 L76 44 Q66 38 50 38 Q34 38 24 44" fill={color} />
        </g>
      );

    case "waves":
      return (
        <g>
          <path d="M26 45 Q26 24 50 21 Q74 24 74 45 Q68 39 58 37 Q52 39 46 37 Q36 39 26 45" fill={color} />
          <path d="M33 32 Q39 28 45 32 Q51 36 57 32 Q63 28 68 32" stroke={adjustColor(color, -20)} strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      );

    case "spaceBuns":
      return (
        <g>
          <circle cx="32" cy="24" r="8" fill={color} />
          <circle cx="68" cy="24" r="8" fill={color} />
          <path d="M28 45 Q28 26 50 23 Q72 26 72 45 Q65 37 50 35 Q35 37 28 45" fill={color} />
        </g>
      );

    case "sidePart":
      return (
        <g>
          <path d="M25 45 Q25 23 50 20 Q74 23 74 45 Q64 34 52 33 Q38 34 25 45" fill={color} />
          <path d="M41 24 Q45 35 43 44" stroke={adjustColor(color, -25)} strokeWidth="2" strokeLinecap="round" />
          <path d="M44 33 Q56 26 68 32" stroke={adjustColor(color, -15)} strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      );

    default:
      return null;
  }
}

function BackHairComponent({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case "long":
    case "braids":
      return (
        <g>
          <path d="M20 50 Q18 70 22 95 L35 95 Q30 75 32 55" fill={color} />
          <path d="M80 50 Q82 70 78 95 L65 95 Q70 75 68 55" fill={color} />
        </g>
      );

    case "ponytail":
      return (
        <g>
          <ellipse cx="50" cy="23" rx="9" ry="6" fill={color} />
          <path d="M47 20 Q40 8 48 2 Q52 8 57 2 Q60 8 53 20" fill={color} />
        </g>
      );

    case "bob":
      return (
        <g>
          <path d="M27 56 Q24 76 30 95 L39 95 Q36 80 37 60" fill={color} />
          <path d="M73 56 Q76 76 70 95 L61 95 Q64 80 63 60" fill={color} />
        </g>
      );

    default:
      return null;
  }
}

// Helper function to darken/lighten a color
function adjustColor(color: string, amount: number): string {
  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }
  return color;
}

// Preset color palettes for easy use
export const hairColors = {
  black: "#1a1a1a",
  darkBrown: "#4A3728",
  brown: "#8B6914",
  lightBrown: "#B8860B",
  blonde: "#F4D03F",
  red: "#C0392B",
  ginger: "#E67E22",
  gray: "#95A5A6",
  white: "#ECF0F1",
  blue: "#3498DB",
  pink: "#E91E63",
  purple: "#9B59B6",
  green: "#27AE60",
};

export const eyeColors = {
  brown: "#5D4E37",
  darkBrown: "#3E2723",
  hazel: "#8B7355",
  green: "#2E7D32",
  blue: "#1976D2",
  lightBlue: "#64B5F6",
  gray: "#607D8B",
  amber: "#FFA000",
};

export const skinColors = {
  light: "#FDEBD0",
  fair: "#F5D0C5",
  medium: "#DEB887",
  olive: "#C4A484",
  tan: "#B8860B",
  brown: "#8D6E63",
  darkBrown: "#5D4037",
  dark: "#3E2723",
};

export const backgroundColors = {
  blue: "#3B82F6",
  purple: "#8B5CF6",
  pink: "#EC4899",
  red: "#EF4444",
  orange: "#F97316",
  amber: "#F59E0B",
  green: "#22C55E",
  teal: "#14B8A6",
  cyan: "#06B6D4",
  gray: "#6B7280",
};
