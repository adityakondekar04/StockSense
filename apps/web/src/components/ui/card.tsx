import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default:
        "bg-[#FAFAF9] dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] hover:border-[#D6D3D1] dark:hover:border-[#44403C] transition-colors duration-150",
      elevated:
        "bg-[#F5F5F4] dark:bg-[#292524] border border-[#D6D3D1] dark:border-[#44403C]",
      flat:
        "bg-transparent border border-[#E7E5E4] dark:border-[#292524]",
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-none shadow-none", variantClasses[variant], className)}
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
    className={cn("flex flex-col space-y-1.5 p-6 border-b border-[#E7E5E4] dark:border-[#292524]", className)}
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
      "font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight",
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
    className={cn("text-[13px] text-[#57534E] dark:text-[#A8A29E] leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 border-t border-[#E7E5E4] dark:border-[#292524]", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
