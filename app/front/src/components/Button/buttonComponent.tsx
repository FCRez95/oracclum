"use client";

interface ButtonProps {
  children: React.ReactNode;
  onClickAction: () => void;
  type: "confirm" | "cancel" | "select" | "unselect";
  size: "small" | "medium" | "spaced" | "large";
  htmlType?: "button" | "submit" | "reset";
  disabled?: boolean;
  active?: boolean;
}

const buttonVariants: Record<ButtonProps["type"], string> = {
  confirm: "bg-bg-primary text-text-on-primary hover:bg-bg-primary/80",
  cancel: "bg-bg-cancel text-text-on-cancel hover:bg-bg-cancel-hover",
  select: "bg-bg-primary text-text-main w-full",
  unselect: "bg-bg-app text-text-main hover:bg-bg-primary w-full",
};

const buttonSizes: Record<ButtonProps["size"], string> = {
  small: "px-small py-extra-small text-content",
  medium: "px-medium py-small text-medium",
  spaced: "px-large py-small text-medium",
  large: "px-large py-small text-large",
};

export const Button = ({
  children,
  type,
  size,
  onClickAction,
  htmlType = "button",
  disabled = false,
  active = true,
}: ButtonProps) => {
  const variantClass = active
    ? buttonVariants[type]
    : "bg-bg-app border-2 border-bg-primary text-text-main";
  const sizeClass = buttonSizes[size];

  return (
    <button
      type={htmlType}
      onClick={onClickAction}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-medium transition ${variantClass} ${sizeClass} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
};
