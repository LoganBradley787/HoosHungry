interface PillButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function PillButton({
  active,
  onClick,
  children,
}: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap ${
        active
          ? "bg-orange-500 text-white"
          : "bg-white text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
