import React from "react";
import { type RefUser, initials } from "@/types/task";

export interface TaskAvatarProps {
  user: RefUser;
  size?: number;
  isMe?: boolean;
  className?: string;
}

export const TaskAvatar: React.FC<TaskAvatarProps> = ({
  user,
  size = 20,
  isMe = false,
  className = "",
}) => {
  const init = initials(user.name);
  return (
    <div
      title={`${user.name} (${user.email})`}
      className={`relative inline-flex shrink-0 items-center justify-center font-bold shadow-2xs select-none border ${
        isMe
          ? "bg-[#0F2D29] text-white border-[#0F2D29]"
          : "bg-[#0F2D29]/10 text-[#0F2D29] border border-[#0F2D29]/15"
      } ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        fontSize: Math.max(8.5, size * 0.38),
        lineHeight: 1,
      }}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="h-full w-full object-cover"
        />
      ) : (
        init
      )}
    </div>
  );
};
