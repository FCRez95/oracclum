import React from "react";

interface InputProps {
  name?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  classType?: "default" | "filled" | "app" | "extraSmall";
  id?: string;
  min?: string;
  error?: boolean;
  success?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string;
  readOnly?: boolean;
}

const InputVariants: Record<NonNullable<InputProps["classType"]>, string> = {
  default: "bg-bg-input p-small text-text-input rounded-xl border-2 border-border-muted",
  filled: "bg-bg-input p-small text-text-input rounded-xl flex-1",
  app: "bg-bg-app p-small text-text-main rounded-xl border w-full focus:outline-none",
  extraSmall: "bg-bg-app p-extra-small text-text-main rounded-small border border-border-muted w-full focus:outline-none text-small",
};

const InputComponent = ({
  name,
  placeholder,
  required = false,
  type = "text",
  classType = "default",
  id,
  min,
  onChange,
  error = false,
  success = false,
  defaultValue = "",
  readOnly = false,
}: InputProps) => {
  const baseVariants = InputVariants[classType];
  const errorClass = error ? "border-2 border-border-error" : "";
  const successClass = success ? "border-2 border-border-highlight" : "";

  return (
    <input
      type={type}
      name={name}
      readOnly={readOnly}
      placeholder={placeholder}
      required={required}
      id={id}
      defaultValue={defaultValue}
      className={`${baseVariants} ${errorClass} ${successClass}`}
      min={min}
      onChange={onChange}
    />
  );
};

export default InputComponent;
