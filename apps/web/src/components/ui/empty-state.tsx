import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    to?: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    to?: string;
  };
  variant?: "default" | "positive" | "error";
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  className,
}) => {
  const borderClass =
    variant === "positive"
      ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20"
      : variant === "error"
      ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20"
      : "border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414]";

  return (
    <div
      className={cn(
        "rounded-lg border p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-colors",
        borderClass,
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            "w-11 h-11 rounded-md flex items-center justify-center mb-4 border",
            variant === "positive"
              ? "border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-[#141414] text-[#15803d] dark:text-[#86efac]"
              : variant === "error"
              ? "border-rose-200 dark:border-rose-900/50 bg-white dark:bg-[#141414] text-[#e11d48] dark:text-[#fda4af]"
              : "border-[#ebebeb] dark:border-[#262626] bg-[#fafafa] dark:bg-[#191919] text-[#525252] dark:text-[#a3a3a3]"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}

      <h3 className="font-heading text-base font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-tight">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] max-w-md mt-1.5 leading-relaxed font-sans">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {action &&
            (action.to ? (
              <Link to={action.to}>
                <Button variant="primary" size="sm">
                  {action.icon && <action.icon className="w-3.5 h-3.5" />}
                  <span>{action.label}</span>
                </Button>
              </Link>
            ) : (
              <Button variant="primary" size="sm" onClick={action.onClick}>
                {action.icon && <action.icon className="w-3.5 h-3.5" />}
                <span>{action.label}</span>
              </Button>
            ))}

          {secondaryAction &&
            (secondaryAction.to ? (
              <Link to={secondaryAction.to}>
                <Button variant="outline" size="sm">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
};
