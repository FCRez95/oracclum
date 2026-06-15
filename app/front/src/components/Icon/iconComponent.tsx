"use client";

import {
  Pencil,
  CalendarRange,
  LogOut,
  Trash2,
  ListFilter,
  ArrowDown,
  ArrowLeft,
  X,
  Check,
  Menu,
  ChevronsLeftRightEllipsis,
  TriangleAlert,
  Lock,
} from "lucide-react";

interface IconProps {
  type: "edit" | "calendar" | "logout" | "delete" | "filter" | "arrowDown" | "arrowLeft" | "close" | "check" | "menu" | "integration" | "warning" | "lock";
  size: "small" | "medium" | "large" | "extraLarge";
  color: "default" | "primary" | "secondary" | "cancel";
  onClickAction?: () => void;
}

const sizeVariants: Record<IconProps["size"], string> = {
  small: "w-4 h-4",
  medium: "w-6 h-6",
  large: "w-8 h-8",
  extraLarge: "w-10 h-10",
};
const colorVariants: Record<IconProps["color"], string> = {
  default: "text-text-main",
  primary: "text-text-primary",
  secondary: "text-text-secondary",
  cancel: "text-text-error",
};

const iconVariants: Record<IconProps["type"], React.ElementType> = {
  edit: Pencil,
  calendar: CalendarRange,
  logout: LogOut,
  delete: Trash2,
  filter: ListFilter,
  arrowDown: ArrowDown,
  arrowLeft: ArrowLeft,
  close: X,
  check: Check,
  menu: Menu,
  integration: ChevronsLeftRightEllipsis,
  warning: TriangleAlert,
  lock: Lock,
};

export const Icon = ({ type, size, color, onClickAction }: IconProps) => {
  const LucideIcon = iconVariants[type];
  const iconSize = sizeVariants[size];
  const iconColor = colorVariants[color];

  return (
    <div
      onClick={onClickAction}
      className={`inline-flex items-center justify-center ${iconColor} ${onClickAction ? "cursor-pointer" : ""
        }`}
    >
      <LucideIcon className={`${iconSize}`} />
    </div>
  );
};
