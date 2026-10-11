import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center font-sans font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717] dark:focus-visible:ring-[#f5f5f5] focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.99]";

    const variantClasses = {
      primary:
        "bg-[#171717] text-white border border-[#171717] hover:bg-[#2b2b2b] dark:bg-[#f5f5f5] dark:text-[#0a0a0a] dark:border-[#f5f5f5] dark:hover:bg-white",
      secondary:
        "bg-[#f5f5f5] dark:bg-[#1f1f1f] text-[#171717] dark:text-[#f5f5f5] border border-[#ebebeb] dark:border-[#262626] hover:bg-[#ebebeb] dark:hover:bg-[#2a2a2a]",
      ghost:
        "bg-transparent text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#f5f5f5] dark:hover:bg-[#1f1f1f]",
      destructive:
        "bg-[#ee0000] text-white border border-[#ee0000] hover:bg-[#c50000]",
      outline:
        "bg-white dark:bg-[#141414] text-[#171717] dark:text-[#f5f5f5] border border-[#ebebeb] dark:border-[#262626] hover:bg-[#f5f5f5] dark:hover:bg-[#1f1f1f] hover:border-[#d4d4d4] dark:hover:border-[#383838]",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-xs sm:text-sm gap-2",
      lg: "px-5 py-2.5 text-sm gap-2",
      icon: "p-2 text-xs",
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
