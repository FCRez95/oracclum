import React from "react";

interface FormProps {
  name?: string;
  action?: (formData: FormData) => void;
  children?: React.ReactNode;
  type: "login" | "default" | "main";
}
const FormVariants: Record<FormProps["type"], string> = {
  login: "flex flex-col px-small py-medium gap-medium",
  default: "flex flex-col gap-small",
  main: "",
};

const FormComponent = ({ action, children, type = "default" }: FormProps) => {
  const Variants = FormVariants[type];
  return (
    <form
      role="form"
      action={action}
      className={`${Variants}`}
    >
      {children}
    </form>
  );
};
export default FormComponent;
