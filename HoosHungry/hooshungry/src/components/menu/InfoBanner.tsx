interface InfoBannerProps {
  dayName: string;
  date: string;
  hallHours: { open_time: string; close_time: string };
  periodName: string;
  periodHours: { start_time: string; end_time: string };
}

export default function InfoBanner({ dayName, date, hallHours, periodName, periodHours }: InfoBannerProps) {
  return (
    <div
      className="flex flex-wrap justify-between items-center py-3 px-0 mb-6 gap-2"
      style={{ borderBottom: "1px solid var(--rule)" }}
    >
      <span className="text-xs" style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}>
        {dayName}, {date}
      </span>
      <span className="text-xs" style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}>
        Hall {hallHours.open_time}–{hallHours.close_time}
      </span>
      <span className="text-xs" style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}>
        {periodName} {periodHours.start_time}–{periodHours.end_time}
      </span>
    </div>
  );
}
