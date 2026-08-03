import { cn } from "@/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }
>(({ className, label, error, id, children, ...props }, ref) => {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        ref={ref}
        id={fieldId}
        className={cn(
          "rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink",
          "focus:border-brass focus:outline-none",
          error && "border-alert",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-alert">{error}</p>}
    </div>
  );
});
Select.displayName = "Select";
