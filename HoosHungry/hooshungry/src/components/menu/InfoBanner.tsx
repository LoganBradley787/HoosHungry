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
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-4 mb-6 shadow-sm">
      {/* Desktop Layout */}
      <div className="hidden sm:flex justify-between items-center text-xs sm:text-sm text-gray-600">
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

      {/* Mobile Layout */}
      <div className="flex flex-col gap-2 sm:hidden text-xs text-gray-600">
        <div className="font-semibold text-center">
          {dayName}, {date}
        </div>
        <div className="flex justify-between">
          <span>
            Hall: {hallHours.open_time} - {hallHours.close_time}
          </span>
          <span>
            {periodName}: {periodHours.start_time} - {periodHours.end_time}
          </span>
        </div>
      </div>
    </div>
  );
}
