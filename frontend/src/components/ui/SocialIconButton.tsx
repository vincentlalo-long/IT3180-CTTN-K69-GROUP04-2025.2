import type { ButtonHTMLAttributes } from "react";

interface SocialIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconSrc: string;
  label: string;
}

const joinClasses = (
  ...classes: Array<string | false | null | undefined>
): string => classes.filter(Boolean).join(" ");

export function SocialIconButton({
  iconSrc,
  label,
  className,
  ...props
}: SocialIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={joinClasses(
        "flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/8",
        "transition duration-200 hover:bg-white/20",
        "ring-offset-2 ring-offset-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55",
        className,
      )}
      {...props}
    >
      <img src={iconSrc} alt="" className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
