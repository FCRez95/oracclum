interface CardProps {
  children: React.ReactNode;
  borderType: "default" | "success" | "error" | "muted" | "borderless";
  paddingType: "default" | "small" | "medium" | "large";
  campaign?: boolean;
}

const borderVariants: Record<CardProps["borderType"], string> = {
  default: "border-border-default",
  success: "border-border-highlight",
  error: "border-border-error",
  muted: "border-border-muted",
  borderless: "border-transparent",
};

const paddingVariants: Record<CardProps["paddingType"], string> = {
  default: "p-default",
  small: "p-small",
  medium: "p-medium",
  large: "p-large",
};

export const Card = ({ children, borderType, paddingType }: CardProps) => {
  const borderVariantClass = borderVariants[borderType];
  const paddingClass = paddingVariants[paddingType || "default"];

  return (
    <div
      className={`bg-bg-card rounded-large w-fit border-3 ${paddingClass} ${borderVariantClass}`}
    >
      {children}
    </div>
  );
};
