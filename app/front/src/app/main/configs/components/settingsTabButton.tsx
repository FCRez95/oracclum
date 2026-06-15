"use client";

interface SettingsTabButtonProps {
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: (el: HTMLButtonElement) => void;
}

export default function SettingsTabButton({
  label,
  isActive,
  disabled = false,
  onClick,
}: SettingsTabButtonProps) {
  const activeClass = isActive
    ? "border-2 border-border-highlight bg-bg-primary text-text-on-primary"
    : "bg-bg-primary/10 hover:bg-bg-primary/40 cursor-pointer text-text-main";

  const disabledClass = disabled
    ? "opacity-20 cursor-not-allowed hover:bg-bg-primary/10"
    : "";
  return (
    <button
      disabled={disabled}
      className={`flex justify-center tablet:justify-start items-center w-full rounded-tablet text-left transition px-medium py-small text-small rounded-medium ${activeClass} ${disabledClass}`}
      onClick={(e) => {
        if (disabled) return;
        onClick(e.currentTarget);
      }}
    >
      {label}
    </button>
  );
}
