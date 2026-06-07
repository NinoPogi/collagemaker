import * as React from "react";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30  h-9 w-full min-w-0  bg-transparent px-3 py-1 text-base   outline-none file:inline-flex file:h-7  file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",

  {
    variants: {
      variant: {
        default:
          "rounded-md border border-input file:border-0 shadow-xs transition-[color,box-shadow] hover:cursor-pointer",
        title: "text-2xl md:text-3xl font-bold truncate",
        focus:
          "rounded-md border border-input file:border-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] shadow-xs transition-[color,box-shadow]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "title";
}

function Input({ className, variant, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Input };
