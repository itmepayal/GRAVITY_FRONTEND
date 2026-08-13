import React from "react";
import { type RefUser, initials } from "@/types/task";

export interface TaskAvatarProps {
  user?: RefUser | string | null;
  size?: number;
  isMe?: boolean;
  className?: string;
  rounded?: "full" | "lg" | "md";
}

const getBgGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    "bg-gradient-to-br from-[#0F2D29] to-[#1E4D45] text-white",
    "bg-gradient-to-br from-[#1A365D] to-[#2B6CB0] text-white",
    "bg-gradient-to-br from-[#2C5282] to-[#4299E1] text-white",
    "bg-gradient-to-br from-[#276749] to-[#38A169] text-white",
    "bg-gradient-to-br from-[#7B341E] to-[#DD6B20] text-white",
    "bg-gradient-to-br from-[#4A5568] to-[#718096] text-white",
  ];
  return gradients[Math.abs(hash) % gradients.length];
};

export const TaskAvatar: React.FC<TaskAvatarProps> = ({
  user,
  size = 22,
  isMe = false,
  className = "",
  rounded = "full",
}) => {
  let name = "User";
  let email = "";
  let avatarUrl: string | null | undefined = null;

  if (typeof user === "string") {
    name = user;
  } else if (user && typeof user === "object") {
    name = user.name || user.email || "User";
    email = user.email || "";
    avatarUrl = user.avatar;
  }

  const titleText = email ? `${name} (${email})` : name;
  const init = initials(name);
  const roundedClass = rounded === "full" ? "rounded-full" : rounded === "lg" ? "rounded-lg" : "rounded-md";
  const bgClass = isMe
    ? "bg-[#0F2D29] text-white ring-2 ring-[#0F2D29]/30"
    : getBgGradient(name);

  return (
    <div
      title={titleText}
      className={`relative inline-flex shrink-0 items-center justify-center font-bold tracking-wider select-none shadow-2xs border border-white/20 transition-transform duration-150 hover:scale-105 ${roundedClass} ${bgClass} ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        fontSize: Math.max(8.5, size * 0.38),
        lineHeight: 1,
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`h-full w-full object-cover ${roundedClass}`}
        />
      ) : (
        <span className="leading-none">{init}</span>
      )}
    </div>
  );
};
