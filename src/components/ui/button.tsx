import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className, variant = "primary", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        variant === "primary" && "bg-ink text-paper hover:bg-brass-dark hover:shadow-md",
        variant === "ghost" && "bg-transparent text-ink underline underline-offset-4 hover:text-brass-dark",
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
