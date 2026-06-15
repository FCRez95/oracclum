"use client";
import { useEffect } from "react";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  showCloseButton?: boolean;
  children: React.ReactNode;
  borderType?: "default" | "success" | "error" | "muted" | "borderless";
  paddingType?: "default" | "small" | "medium" | "large";
}

const borderVariants: Record<
  NonNullable<ModalProps["borderType"]>,
  string
> = {
  default: "border-border-default",
  success: "border-border-highlight",
  error: "border-border-error",
  muted: "border-border-muted",
  borderless: "border-transparent",
};

const paddingVariants: Record<
  NonNullable<ModalProps["paddingType"]>,
  string
> = {
  default: "p-default",
  small: "p-small",
  medium: "p-medium",
  large: "p-large",
};

export const Modal = ({
  isOpen,
  onCloseAction,
  showCloseButton = false,
  borderType = "borderless",
  paddingType = "default",
  children,
}: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseAction();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCloseAction]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCloseAction();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={clsx(
          "relative rounded-extra-large shadow-lg bg-transparent md:bg-bg-card mx-4",
          paddingVariants[paddingType],
          borderType !== "borderless" && "border-3",
          borderVariants[borderType]
        )}>
        {showCloseButton && (
          <button
            onClick={onCloseAction}
            className="absolute top-[-20px] right-[0px] text-text-info text-subtitle pr-extra-small"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div >
  );
};
