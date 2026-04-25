import type { InputHTMLAttributes, ReactNode } from "react";

interface TextInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  id: string;
  label: string;
  error?: string;
  rightAdornment?: ReactNode;
}

const joinClasses = (
  ...classes: Array<string | false | null | undefined>
): string => classes.filter(Boolean).join(" ");

export function TextInput({
  id,
  label,
  error,
  rightAdornment,
  className,
  ...props
}: TextInputProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div
        className={joinClasses(
          "group flex h-[66px] w-full items-center rounded-auth-control border px-4 transition duration-200",
          "ring-offset-2 ring-offset-transparent focus-within:ring-2 focus-within:ring-white/45",
          error
            ? "border-red-400/95 bg-red-500/10"
            : "border-white/85 bg-white/[0.035] hover:bg-white/[0.065]",
        )}
      >
        <input
          id={id}
          className={joinClasses(
            "h-full w-full border-none bg-transparent font-body text-auth-input text-white outline-none",
            "placeholder:text-auth-placeholder",
            className,
          )}
          {...props}
        />
        {rightAdornment ? (
          <div className="ml-3 flex shrink-0 items-center">
            {rightAdornment}
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-sm font-medium text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
