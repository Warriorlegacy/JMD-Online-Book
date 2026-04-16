interface AnnouncementTickerProps {
  announcement: string;
}

export function AnnouncementTicker({ announcement }: AnnouncementTickerProps) {
  return (
    <div
      className="overflow-hidden py-2"
      style={{
        background: "rgba(0,113,227,0.08)",
        borderBottom: "1px solid rgba(0,113,227,0.15)",
      }}
    >
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="mx-8 text-[12px] text-[#2997ff]">{announcement}</span>
        <span className="mx-8 text-[12px] text-[#2997ff]">{announcement}</span>
        <span className="mx-8 text-[12px] text-[#2997ff]">{announcement}</span>
      </div>
    </div>
  );
}
