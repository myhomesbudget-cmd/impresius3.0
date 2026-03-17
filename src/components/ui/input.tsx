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
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
              icon && "pl-10",
              suffix && "pr-12",
              error && "border-red-400 focus:border-red-500 focus:ring-red-500/15",
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
