import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, suffix, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              suffix && "pr-12",
              error && "border-destructive focus:border-destructive focus:ring-destructive/15",
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm font-medium text-destructive">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
