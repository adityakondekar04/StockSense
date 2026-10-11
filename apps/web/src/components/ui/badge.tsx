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
      "bg-[#F0FDF4] dark:bg-[#14532D]/30 text-[#65A30D] dark:text-[#86EFAC] border border-[#BBF7D0] dark:border-[#15803D]/40",
    warning:
      "bg-[#FEFCE8] dark:bg-[#713F12]/30 text-[#CA8A04] dark:text-[#FDE047] border border-[#FEF08A] dark:border-[#A16207]/40",
    error:
      "bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 text-[#DC2626] dark:text-[#FCA5A5] border border-[#FECACA] dark:border-[#991B1B]/40",
    neutral:
      "bg-[#F5F5F4] dark:bg-[#292524] text-[#78716C] dark:text-[#D6D3D1] border border-[#E7E5E4] dark:border-[#44403C]",
    primary:
      "bg-[#78716C] text-[#FAFAF9] border border-[#78716C]",
    outline:
      "bg-transparent text-[#57534E] dark:text-[#A8A29E] border border-[#D6D3D1] dark:border-[#44403C]",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider",
    md: "px-2.5 py-1 text-[11px] uppercase font-semibold tracking-wider",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-none font-sans select-none",
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
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-none font-sans text-[13px] font-medium border transition-colors duration-150 select-none",
        selected
          ? "bg-[#78716C] text-[#FAFAF9] border-[#78716C] shadow-none"
          : "bg-transparent text-[#57534E] dark:text-[#A8A29E] border-[#D6D3D1] dark:border-[#44403C] hover:bg-[#F5F5F4] dark:hover:bg-[#292524]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
