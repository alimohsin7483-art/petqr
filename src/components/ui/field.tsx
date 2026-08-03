import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(({ className, label, error, id, ...props }, ref) => {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          "rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40",
          "focus:border-brass focus:outline-none",
          error && "border-alert",
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${fieldId}-error`} className="text-xs text-alert">
          {error}
        </p>
      )}
    </div>
  );
});
Field.displayName = "Field";
