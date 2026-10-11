import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-none border bg-[#FAFAF9] dark:bg-[#1C1917] px-3.5 py-2 text-[14px] font-sans text-[#1C1917] dark:text-[#FAFAF9] placeholder-[#A8A29E] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-[#78716C] focus-visible:ring-2 focus-visible:ring-[#78716C]/30 disabled:cursor-not-allowed disabled:bg-[#F5F5F4] dark:disabled:bg-[#292524] disabled:opacity-50",
          error
            ? "border-[#DC2626] focus-visible:border-[#DC2626] focus-visible:ring-[#DC2626]/20"
            : "border-[#D6D3D1] dark:border-[#44403C]",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
