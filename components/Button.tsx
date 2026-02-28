"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "danger" | "default";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visible content rendered inside the button. */
  children: ReactNode;
  /** Visual variant controlling button colors. */
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  default:
    "bg-gray-300 text-gray-800 hover:bg-gray-400 focus-visible:ring-gray-500",
};

function joinClasses(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Reusable button primitive with consistent focus and state styling.
 */
export default function Button({
  children,
  variant = "default",
  disabled = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={joinClasses(
        "inline-flex items-center justify-center rounded-md px-4 py-2",
        "font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
