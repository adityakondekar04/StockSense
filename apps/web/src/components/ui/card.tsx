import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default:
        "bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#262626] transition-colors duration-150",
      elevated:
        "bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#262626] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors duration-150",
      flat:
        "bg-[#f5f5f5]/70 dark:bg-[#1a1a1a]/70 border border-[#ebebeb] dark:border-[#262626] transition-colors duration-150",
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-lg", variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1 p-5 border-b border-[#ebebeb] dark:border-[#262626]",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-heading text-base font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-5 border-t border-[#ebebeb] dark:border-[#262626]",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
