import type { CSSProperties, ReactNode } from "react";

interface PillButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  style?: CSSProperties;
}

export default function PillButton({ active, onClick, children, style }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`tab-link ${active ? "active" : ""}`}
      style={style}
    >
      {children}
    </button>
  );
}
