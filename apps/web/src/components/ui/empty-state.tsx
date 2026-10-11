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
      ? "border-[#315C46]/40 bg-[#F2F7F4] dark:bg-[#315C46]/10"
      : variant === "error"
      ? "border-[#B84B45]/40 bg-[#FDF4F3] dark:bg-[#B84B45]/10"
      : "border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#1C1917]";

  return (
    <div
      className={cn(
        "border p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-colors",
        borderClass,
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            "w-12 h-12 flex items-center justify-center mb-4 border",
            variant === "positive"
              ? "border-[#315C46]/30 bg-white dark:bg-[#1C1917] text-[#315C46] dark:text-[#4E8F6C]"
              : variant === "error"
              ? "border-[#B84B45]/30 bg-white dark:bg-[#1C1917] text-[#B84B45] dark:text-[#E07A75]"
              : "border-[#E7E5E4] dark:border-[#292524] bg-[#FAFAF9] dark:bg-[#292524] text-[#78716C] dark:text-[#A8A29E]"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}

      <h3 className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-[#57534E] dark:text-[#A8A29E] max-w-md mt-2 leading-relaxed font-sans">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {action && (
            action.to ? (
              <Link to={action.to}>
                <Button variant="primary" size="sm" className="font-mono text-xs">
                  {action.icon && <action.icon className="w-3.5 h-3.5 mr-1.5" />}
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={action.onClick}
                className="font-mono text-xs"
              >
                {action.icon && <action.icon className="w-3.5 h-3.5 mr-1.5" />}
                {action.label}
              </Button>
            )
          )}

          {secondaryAction && (
            secondaryAction.to ? (
              <Link to={secondaryAction.to}>
                <Button variant="outline" size="sm" className="font-mono text-xs">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={secondaryAction.onClick}
                className="font-mono text-xs"
              >
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
};
