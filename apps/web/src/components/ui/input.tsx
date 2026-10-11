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
          "flex h-9 w-full rounded-md border bg-white dark:bg-[#141414] px-3 py-1.5 text-xs sm:text-sm font-sans text-[#171717] dark:text-[#f5f5f5] placeholder:text-[#a3a3a3] dark:placeholder:text-[#525252] transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium focus-visible:outline-none focus-visible:border-[#171717] dark:focus-visible:border-[#f5f5f5] focus-visible:ring-1 focus-visible:ring-[#171717] dark:focus-visible:ring-[#f5f5f5] disabled:cursor-not-allowed disabled:bg-[#f5f5f5] dark:disabled:bg-[#1f1f1f] disabled:opacity-50",
          error
            ? "border-[#ee0000] focus-visible:border-[#ee0000] focus-visible:ring-[#ee0000]"
            : "border-[#ebebeb] dark:border-[#262626]",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
