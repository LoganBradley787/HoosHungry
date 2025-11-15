interface InfoBannerProps {
  dayName: string;
  date: string;
  hallHours: {
    open_time: string;
    close_time: string;
  };
  periodName: string;
  periodHours: {
    start_time: string;
    end_time: string;
  };
}

export default function InfoBanner({
  dayName,
  date,
  hallHours,
  periodName,
  periodHours,
}: InfoBannerProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          {dayName}, {date}
        </span>
        <span>
          Hall Hours: {hallHours.open_time} - {hallHours.close_time}
        </span>
        <span>
          {periodName}: {periodHours.start_time} - {periodHours.end_time}
        </span>
      </div>
    </div>
  );
}
