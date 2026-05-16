import type { PlayerProfileInfo } from "../../types/account.types";

interface PlayerProfileSidebarProps {
  userInfo: PlayerProfileInfo;
}

export function PlayerProfileSidebar({ userInfo }: PlayerProfileSidebarProps) {
  return (
    <div className="flex w-[220px] shrink-0 flex-col gap-4">
      <div className="h-[190px] w-full overflow-hidden rounded-2xl bg-white/90 flex items-center justify-center">
        <img
          src={userInfo.avatarUrl || "/default-avatar.png"}
          alt="avatar"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="w-full rounded-2xl bg-white/20 px-4 py-4 flex flex-col gap-2">
        <div className="font-bold text-[#2E7D1E] text-lg truncate">{userInfo.name}</div>
        <div className="text-sm text-gray-700 truncate">{userInfo.email}</div>
        {userInfo.phone && (
          <div className="text-sm text-gray-700 truncate">SĐT: {userInfo.phone}</div>
        )}
        {userInfo.role && (
          <div className="text-xs font-semibold text-[#2E7D1E] bg-white/60 rounded px-2 py-1 w-fit">
            {userInfo.role}
          </div>
        )}
      </div>
    </div>
  );
}