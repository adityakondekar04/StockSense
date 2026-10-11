import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "neutral" | "primary" | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const variantClasses = {
    success:
      "bg-[#f0fdf4] dark:bg-[#0d2416] text-[#15803d] dark:text-[#86efac] border border-[#dcfce7] dark:border-[#163d24]",
    warning:
      "bg-[#fffbeb] dark:bg-[#291d0a] text-[#b45309] dark:text-[#fcd34d] border border-[#fef3c7] dark:border-[#452f0d]",
    error:
      "bg-[#fff1f2] dark:bg-[#2b1114] text-[#e11d48] dark:text-[#fda4af] border border-[#ffe4e6] dark:border-[#4c1d24]",
    neutral:
      "bg-[#f5f5f5] dark:bg-[#1f1f1f] text-[#525252] dark:text-[#a3a3a3] border border-[#ebebeb] dark:border-[#262626]",
    primary:
      "bg-[#171717] dark:bg-[#f5f5f5] text-white dark:text-[#0a0a0a] border border-[#171717] dark:border-[#f5f5f5]",
    outline:
      "bg-transparent text-[#525252] dark:text-[#a3a3a3] border border-[#ebebeb] dark:border-[#262626]",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] font-medium",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded font-mono select-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  className,
  selected = false,
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-xs font-medium border transition-colors duration-150 select-none",
        selected
          ? "bg-[#171717] text-white border-[#171717] dark:bg-[#f5f5f5] dark:text-[#0a0a0a] dark:border-[#f5f5f5]"
          : "bg-white dark:bg-[#141414] text-[#525252] dark:text-[#a3a3a3] border-[#ebebeb] dark:border-[#262626] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#f5f5f5] dark:hover:bg-[#1f1f1f]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
