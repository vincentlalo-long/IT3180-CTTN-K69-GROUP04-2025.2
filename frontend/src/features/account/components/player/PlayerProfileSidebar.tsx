interface PlayerProfileSidebarProps {
  avatarSrc: string;
}

export function PlayerProfileSidebar({ avatarSrc }: PlayerProfileSidebarProps) {
  return (
    <div className="flex w-[200px] shrink-0 flex-col gap-4">
      <div className="h-[190px] w-full overflow-hidden rounded-2xl bg-white/90">
        <img
          src={avatarSrc}
          alt="avatar"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="h-[130px] w-full rounded-2xl bg-white/20" />
    </div>
  );
}
