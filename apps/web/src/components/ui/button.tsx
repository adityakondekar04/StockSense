import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center font-sans font-semibold rounded-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78716C] disabled:opacity-40 disabled:cursor-not-allowed select-none";

    const variantClasses = {
      primary:
        "bg-[#78716C] text-[#FAFAF9] border border-[#78716C] hover:bg-[#57534E] active:bg-[#44403C] dark:bg-[#78716C] dark:hover:bg-[#8C8580]",
      secondary:
        "bg-transparent text-[#78716C] dark:text-[#D6D3D1] border border-[#D6D3D1] dark:border-[#44403C] hover:bg-[#F5F5F4] dark:hover:bg-[#292524] active:bg-[#EFEDEB]",
      ghost:
        "bg-transparent text-[#78716C] dark:text-[#D6D3D1] hover:bg-[#F5F5F4] dark:hover:bg-[#292524] active:bg-[#EFEDEB]",
      destructive:
        "bg-[#DC2626] text-[#FAFAF9] border border-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B]",
      outline:
        "bg-transparent text-[#1C1917] dark:text-[#FAFAF9] border border-[#E7E5E4] dark:border-[#292524] hover:bg-[#F5F5F4] dark:hover:bg-[#292524]",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-[13px] gap-1.5",
      md: "px-5 py-2.5 text-[15px] gap-2",
      lg: "px-7 py-3 text-[17px] gap-2.5",
      icon: "p-2 text-[14px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
