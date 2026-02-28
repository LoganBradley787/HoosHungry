import type { ReactNode } from "react";

interface PillButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export default function PillButton({ active, onClick, children }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`tab-link ${active ? "active" : ""}`}
    >
      {children}
    </button>
  );
}
