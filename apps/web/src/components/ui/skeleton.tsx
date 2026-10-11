import React from "react";
import { cn } from "../../lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#E7E5E4] dark:bg-[#292524] rounded-none",
        className
      )}
      {...props}
    />
  );
};
