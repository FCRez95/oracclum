"use client";

interface SettingsTabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export default function SettingsTabButton({
  label,
  isActive,
  onClick,
}: SettingsTabButtonProps){
  const activeClass = isActive
    ? "border-2 border-border-highlight bg-bg-primary text-text-on-primary"
    : "bg-bg-primary/10 hover:bg-bg-primary/40 cursor-pointer text-text-main";

  return (
    <button
      onClick={onClick}
      className={`flex justify-center tablet:justify-start items-center w-full rounded-lg text-left transition px-medium py-small text-small ${activeClass}`}
    >
      {label}
    </button>
  );
};