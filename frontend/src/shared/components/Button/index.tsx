import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  iconLeft?: ReactNode;
}

const joinClasses = (
  ...classes: Array<string | false | null | undefined>
): string => classes.filter(Boolean).join(" ");

function Spinner() {
  return (
    <span
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
      aria-hidden="true"
    />
  );
}

export function Button({
  variant = "primary",
  loading = false,
  iconLeft,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={joinClasses(
        "flex h-[59px] w-full items-center justify-center gap-2 rounded-auth-control px-4",
        "font-body text-auth-button text-white transition duration-200",
        "ring-offset-2 ring-offset-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55",
        variant === "primary"
          ? "bg-gradient-to-r from-auth-accent-start to-auth-accent-end shadow-auth-glow hover:brightness-110"
          : "border-4 border-white/95 bg-transparent hover:bg-white/12",
        isDisabled ? "cursor-not-allowed opacity-75" : "cursor-pointer",
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? <Spinner /> : iconLeft}
      <span>{children}</span>
    </button>
  );
}
